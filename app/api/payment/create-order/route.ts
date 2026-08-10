import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { computeOrderPricing, type CartItem, type OrderFormData } from '@/lib/order-pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: OrderFormData = body?.formData;
    const cartItems: CartItem[] = body?.cartItems ?? [];

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Online payment is not set up yet. Please choose Cash on Delivery.' },
        { status: 503 },
      );
    }

    const pricing = await computeOrderPricing(cartItems, formData.email);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: pricing.total * 100, // paise
      currency: 'INR',
      receipt: `bearbags_${Date.now()}`,
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      total: pricing.total,
      discountPercent: pricing.discountPercent,
    });
  } catch (error) {
    console.error('[payment/create-order] failed:', error);
    return NextResponse.json({ error: 'Failed to start payment. Please try again.' }, { status: 500 });
  }
}
