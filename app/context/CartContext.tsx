'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

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

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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

    setCart(nextCart);
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
