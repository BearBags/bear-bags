import { connectToDatabase } from './mongodb';
import { Order } from './models/Order';
import { sendOrderNotification } from './order-email';
import { dataRouting } from '@/config/data-routing';
import type { OrderFormData, OrderPricing } from './order-pricing';

interface SaveOrderOptions {
  formData: OrderFormData;
  pricing: OrderPricing;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export async function saveOrder({
  formData,
  pricing,
  razorpayOrderId,
  razorpayPaymentId,
}: SaveOrderOptions): Promise<void> {
  const { pricedItems, subtotal, shipping, total, discountPercent, discountAmount, appliedCoupon } = pricing;

  if (dataRouting.database.storeOrders) {
    await connectToDatabase();
    // A retried or replayed verify call for a payment already recorded is a
    // no-op: no second order or email.
    if (razorpayPaymentId && (await Order.exists({ razorpayPaymentId }))) return;
    try {
      await Order.create({
        customerName: formData.name,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'paid',
        razorpayOrderId,
        razorpayPaymentId,
        subtotal,
        shipping,
        total,
        discountPercent,
        discountAmount,
        couponCode: appliedCoupon,
        items: pricedItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
      });
    } catch (error) {
      // Two concurrent calls for the same payment: the unique index let one through.
      if ((error as { code?: number })?.code === 11000) return;
      throw error;
    }
  }

  // A failed email must never fail an order that is already saved and paid for.
  if (dataRouting.email.sendOrderNotifications) {
    try {
      await sendOrderNotification({ formData, pricing, razorpayPaymentId });
    } catch (error) {
      console.error('[order-email] failed to send order notification:', error);
    }
  }
}
