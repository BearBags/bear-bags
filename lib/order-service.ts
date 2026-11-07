import { connectToDatabase } from './mongodb';
import { Order } from './models/Order';
import { sendOrderConfirmation, sendOrderNotification } from './order-email';
import { dataRouting } from '@/config/data-routing';
import type { OrderFormData, OrderPricing } from './order-pricing';

interface SaveOrderOptions {
  formData: OrderFormData;
  pricing: OrderPricing;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

// Saves the paid order. Returns null when this payment was already recorded
// (a retried or replayed verify call), so its follow-ups never run twice.
export async function saveOrder({
  formData,
  pricing,
  razorpayOrderId,
  razorpayPaymentId,
}: SaveOrderOptions): Promise<{ orderId: string | null } | null> {
  const { pricedItems, subtotal, shipping, total, discountPercent, discountAmount, appliedCoupon } = pricing;

  if (!dataRouting.database.storeOrders) return { orderId: null };

  await connectToDatabase();
  if (razorpayPaymentId && (await Order.exists({ razorpayPaymentId }))) return null;
  try {
    const order = await Order.create({
      customerName: formData.name,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
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
      ...(dataRouting.invoices.createInZohoBooks && { invoice: { status: 'pending' } }),
    });
    return { orderId: String(order._id) };
  } catch (error) {
    // Two concurrent calls for the same payment: the unique index let one through.
    if ((error as { code?: number })?.code === 11000) return null;
    throw error;
  }
}

// Emails, run after the customer already has their "order placed" response
// (next/server `after`). The customer has paid, so none of these may fail the
// order: each failure is logged.
//
// The GST invoice is not created here: it is created when the admin marks the
// order as shipped (app/api/admin/orders/[id]/status), since a customer may
// cancel before then.
export async function runOrderFollowUps({
  orderId,
  formData,
  pricing,
  razorpayPaymentId,
}: SaveOrderOptions & { orderId: string | null }): Promise<void> {
  if (dataRouting.email.sendOrderNotifications) {
    try {
      await sendOrderNotification({ formData, pricing, razorpayPaymentId });
    } catch (error) {
      console.error('[order-email] failed to send order notification:', error);
    }
  }

  if (dataRouting.email.sendCustomerConfirmations) {
    try {
      await sendOrderConfirmation({ formData, pricing, orderId });
    } catch (error) {
      console.error('[order-email] failed to send customer confirmation:', error);
    }
  }
}
