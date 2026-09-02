import { connectToDatabase } from './mongodb';
import { Order } from './models/Order';
import { createZohoLead } from './zoho';
import { dataRouting } from '@/config/data-routing';
import type { OrderFormData, OrderPricing } from './order-pricing';

interface SaveOrderOptions {
  formData: OrderFormData;
  pricing: OrderPricing;
  paymentStatus: 'cod' | 'paid';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export async function saveOrder({
  formData,
  pricing,
  paymentStatus,
  razorpayOrderId,
  razorpayPaymentId,
}: SaveOrderOptions): Promise<void> {
  const { pricedItems, subtotal, shipping, total, discountPercent, discountAmount } = pricing;

  if (dataRouting.database.storeOrders) {
    await connectToDatabase();
    await Order.create({
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      subtotal,
      shipping,
      total,
      discountPercent,
      discountAmount,
      items: pricedItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    });
  }

  if (dataRouting.zohoCRM.sendAllOrders) {
    const nameParts = formData.name.trim().split(' ');
    const lastName = nameParts.pop() ?? formData.name;
    const firstName = nameParts.join(' ') || undefined;

    const itemLines = pricedItems.map(
      (item) => `- ${item.product.name} x${item.quantity} — ₹${item.unitPrice * item.quantity}`,
    );

    const description = [
      `Order Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`,
      `Payment: ${paymentStatus === 'paid' ? 'Online Payment (paid)' : 'Cash on Delivery'}`,
      `Subtotal: ₹${subtotal}  Shipping: ₹${shipping}  Total: ₹${total}`,
      '',
      'Items:',
      ...itemLines,
    ].join('\n');

    await createZohoLead({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      leadSource: 'Web Site',
      description,
    });
  }
}
