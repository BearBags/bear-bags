import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { createZohoLead } from '@/lib/zoho';
import { dataRouting, type PurchaseType } from '@/config/data-routing';

interface CartProduct {
  id: number;
  name: string;
  price: number;
  option?: PurchaseType;
}

interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  paymentMethod: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: OrderFormData = body?.formData;
    const cartItems: CartItem[] = body?.cartItems ?? [];
    const subtotal: number = body?.subtotal ?? 0;
    const shipping: number = body?.shipping ?? 0;
    const total: number = body?.total ?? 0;

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const hasSubscription = cartItems.some((item) => item.product.option === 'subscribe');

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
        subtotal,
        shipping,
        total,
        hasSubscription,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          purchaseType: item.product.option ?? 'oneTime',
        })),
      });
    }

    const shouldSendToZoho =
      dataRouting.zohoCRM.sendAllOrders ||
      (dataRouting.zohoCRM.sendSubscriptionOrdersOnly && hasSubscription);

    if (shouldSendToZoho) {
      const nameParts = formData.name.trim().split(' ');
      const lastName = nameParts.pop() ?? formData.name;
      const firstName = nameParts.join(' ') || undefined;

      const itemLines = cartItems.map((item) => {
        const type = item.product.option === 'subscribe' ? 'Subscribe & Save' : 'One-Time Purchase';
        return `- ${item.product.name} x${item.quantity} [${type}] — ₹${item.product.price * item.quantity}`;
      });

      const description = [
        `Order Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`,
        `Order Type: ${hasSubscription ? 'Subscription (Subscribe & Save)' : 'One-Time Purchase'}`,
        `Payment: ${formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[order] failed:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
