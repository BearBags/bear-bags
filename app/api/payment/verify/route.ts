import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { pricingFromOrderNotes, type OrderFormData } from '@/lib/order-pricing';
import { saveOrder } from '@/lib/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: OrderFormData = body?.formData;
    const razorpay_order_id: string | undefined = body?.razorpay_order_id;
    const razorpay_payment_id: string | undefined = body?.razorpay_payment_id;
    const razorpay_signature: string | undefined = body?.razorpay_signature;

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !secret) {
      return NextResponse.json({ error: 'Online payment is not set up yet.' }, { status: 503 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // What was paid for comes from the Razorpay order we created, never from
    // this request: the signature only proves this order was paid, so a cart
    // sent here could list more than the amount actually charged.
    const razorpay = new Razorpay({ key_id: keyId, key_secret: secret });
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const paid = pricingFromOrderNotes(razorpayOrder.notes as Record<string, string | number> | undefined);

    if (!paid || paid.pricing.total * 100 !== Number(razorpayOrder.amount)) {
      console.error('[payment/verify] order notes do not match the paid amount:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    if (formData.email.trim().toLowerCase() !== paid.email) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const { pricing } = paid;
    await saveOrder({
      formData,
      pricing,
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
