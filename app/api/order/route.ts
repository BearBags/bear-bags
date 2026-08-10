import { NextRequest, NextResponse } from 'next/server';
import { computeOrderPricing, type CartItem, type OrderFormData } from '@/lib/order-pricing';
import { saveOrder } from '@/lib/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: OrderFormData = body?.formData;
    const cartItems: CartItem[] = body?.cartItems ?? [];

    if (!formData?.name || !formData?.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const pricing = await computeOrderPricing(cartItems, formData.email);
    await saveOrder({ formData, pricing, paymentStatus: 'cod' });

    return NextResponse.json({
      success: true,
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      total: pricing.total,
      discountPercent: pricing.discountPercent,
      discountAmount: pricing.discountAmount,
    });
  } catch (error) {
    console.error('[order] failed:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}
