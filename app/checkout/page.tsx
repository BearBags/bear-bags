'use client';

import Checkout from '../components/Checkout';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { cart, buyNowItem, updateQuantity, removeFromCart, clearCart, clearBuyNowItem } = useCart();

  const isBuyNow = buyNowItem !== null;
  const cartItems = isBuyNow ? [buyNowItem] : cart ?? [];

  return (
    <Checkout
      cartItems={cartItems}
      isBuyNow={isBuyNow}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
      onClearCart={isBuyNow ? clearBuyNowItem : clearCart}
    />
  );
}