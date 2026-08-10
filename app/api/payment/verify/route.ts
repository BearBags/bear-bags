import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { computeOrderPricing, type CartItem, type OrderFormData } from '@/lib/order-pricing';
import { saveOrder } from '@/lib/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: OrderFormData = body?.formData;
    const cartItems: CartItem[] = body?.cartItems ?? [];
    const razorpay_order_id: string | undefined = body?.razorpay_order_id;
    const razorpay_payment_id: string | undefined = body?.razorpay_payment_id;
    const razorpay_signature: string | undefined = body?.razorpay_signature;

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Online payment is not set up yet.' }, { status: 503 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const pricing = await computeOrderPricing(cartItems, formData.email);
    await saveOrder({
      formData,
      pricing,
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      total: pricing.total,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
    });
  } catch (error) {
    console.error('[payment/verify] failed:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
