'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

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
  discountPercent?: number;
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
  shippingNotification: 'gained' | 'lost' | null;
  dismissShippingNotification: () => void;
}

const getSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

const CartContext = createContext<CartContextType | undefined>(undefined);

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
  const [shippingNotification, setShippingNotification] = useState<'gained' | 'lost' | null>(null);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
    setHasLoadedCart(true);
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (shippingNotification !== 'gained') return;
    const timeout = setTimeout(() => setShippingNotification(null), 4000);
    return () => clearTimeout(timeout);
  }, [shippingNotification]);

  const dismissShippingNotification = () => setShippingNotification(null);

  // Compares the cart's free-shipping eligibility before/after a mutation and
  // surfaces a celebration toast or a lost-shipping popup on a crossing.
  // Skipped while the cart hasn't finished loading from localStorage, so
  // restoring an existing >₹500 cart on page load doesn't fire a false "gained".
  const notifyShippingChange = (before: CartItem[], after: CartItem[]) => {
    if (!hasLoadedCart) return;
    const wasEligible = getSubtotal(before) > FREE_SHIPPING_THRESHOLD;
    const isEligible = getSubtotal(after) > FREE_SHIPPING_THRESHOLD;
    if (!wasEligible && isEligible) setShippingNotification('gained');
    else if (wasEligible && !isEligible) setShippingNotification('lost');
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const exists = cart.find(
      (i) => i.product.id === product.id && i.product.option === product.option
    );

    const nextCart = exists
      ? cart.map(i =>
          i.product.id === product.id && i.product.option === product.option
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [...cart, { product, quantity }];

    notifyShippingChange(cart, nextCart);
    setCart(nextCart);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, option?: string) => {
    const nextCart = cart.filter((i) => i.product.id !== id || i.product.option !== option);
    notifyShippingChange(cart, nextCart);
    setCart(nextCart);
  };

  const updateQuantity = (id: number, quantity: number, option?: string) => {
    if (quantity < 1) return;
    const nextCart = cart.map(i =>
      i.product.id === id && i.product.option === option ? { ...i, quantity } : i
    );
    notifyShippingChange(cart, nextCart);
    setCart(nextCart);
  };

  const clearCart = () => {
    notifyShippingChange(cart, []);
    setCart([]);
  };

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
        shippingNotification,
        dismissShippingNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};