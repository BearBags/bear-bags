'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  size?: string;
  count?: number;
  features?: string[];
  option?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: number, option?: string) => void;
  updateQuantity: (id: number, quantity: number, option?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  buyNowItem: CartItem | null;
  setBuyNowItem: (product: Product, quantity?: number) => void;
  clearBuyNowItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// One line per product and option. Also repairs carts saved before this rule,
// which could hold the same product twice. A missing option and an empty one
// are the same option.
const lineKey = (product: Product) => `${product.id}|${product.option ?? ''}`;
function mergeLines(items: CartItem[]): CartItem[] {
  const lines = new Map<string, CartItem>();
  for (const item of items) {
    if (!item?.product || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
    const key = lineKey(item.product);
    const line = lines.get(key);
    lines.set(key, line ? { ...line, quantity: line.quantity + item.quantity } : item);
  }
  return [...lines.values()];
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [buyNowItem, setBuyNowItemState] = useState<CartItem | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const pathname = usePathname();

  // The provider lives in the root layout and survives client-side navigation,
  // so an open drawer would otherwise stay pinned over the page the user just
  // navigated to -- the URL changes but the overlay never lifts.
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  // A Buy Now item is scoped to the single checkout it was started for. Leaving
  // /checkout abandons it, otherwise it outlives the visit and every later
  // checkout renders that stale item instead of the real cart.
  useEffect(() => {
    if (pathname !== '/checkout') setBuyNowItemState(null);
  }, [pathname]);

  useEffect(() => {
    // Corrupt or blocked storage just means starting with an empty cart; this
    // provider wraps the whole site, so it must never throw.
    try {
      const stored = JSON.parse(localStorage.getItem('cart') ?? '[]');
      if (Array.isArray(stored)) setCart(mergeLines(stored));
    } catch {
      // keep the empty cart
    }
    setCartLoaded(true);
  }, []);

  // A saved cart keeps the price each item had when it was added. If the admin
  // has changed a price since, show the current one -- it is what checkout
  // charges. Failing to fetch just leaves the saved prices in place.
  useEffect(() => {
    fetch('/api/products/prices')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { prices: Record<number, number> } | null) => {
        if (!data?.prices) return;
        const priceOf = (product: Product) => data.prices[product.id] ?? product.price;
        setCart((current) =>
          current.some((i) => priceOf(i.product) !== i.product.price)
            ? current.map((i) => ({ ...i, product: { ...i.product, price: priceOf(i.product) } }))
            : current,
        );
      })
      .catch(() => {});
  }, []);

  // save to localStorage
  // Waits for the load above, or the initial empty cart would overwrite it.
  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {
      // storage unavailable -- the cart still works for this visit
    }
  }, [cart, cartLoaded]);

  // Functional update, so two quick taps on "Add to Cart" add to one line
  // instead of each starting from the same old cart.
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((current) => mergeLines([...current, { product, quantity }]));
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, option?: string) => {
    setCart(cart.filter((i) => i.product.id !== id || i.product.option !== option));
  };

  const updateQuantity = (id: number, quantity: number, option?: string) => {
    if (quantity < 1) return;
    setCart(cart.map(i =>
      i.product.id === id && i.product.option === option ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setCart([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const setBuyNowItem = (product: Product, quantity: number = 1) => {
    setBuyNowItemState({ product, quantity });
  };

  const clearBuyNowItem = () => setBuyNowItemState(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        buyNowItem,
        setBuyNowItem,
        clearBuyNowItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
