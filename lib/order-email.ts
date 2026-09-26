import { getGmail } from './gmail';
import { getProductById } from './products';
import type { OrderFormData, OrderPricing } from './order-pricing';

// Emails the business a copy of every new order, sent from the Gmail account
// (lib/gmail.ts) to that same account. Skipped if Gmail is not configured.

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const rupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

interface OrderEmailDetails {
  formData: OrderFormData;
  pricing: OrderPricing;
  paymentStatus: 'cod' | 'paid';
  razorpayPaymentId?: string;
}

export async function sendOrderNotification({
  formData,
  pricing,
  paymentStatus,
  razorpayPaymentId,
}: OrderEmailDetails): Promise<void> {
  const gmail = getGmail();
  if (!gmail) {
    console.warn('[order-email] GMAIL_USER / GMAIL_APP_PASSWORD not set — order email skipped.');
    return;
  }

  const placedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const payment =
    paymentStatus === 'paid'
      ? `Paid online${razorpayPaymentId ? ` (Razorpay payment ${razorpayPaymentId})` : ''}`
      : 'Cash on Delivery';

  const items = pricing.pricedItems.map((item) => {
    const product = getProductById(item.product.id);
    const size = product ? ` (${product.bagSize}, ${product.bagCount} bags)` : '';
    return {
      label: `${item.product.name}${size}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    };
  });

  const totals: [string, string][] = [
    ['Subtotal', rupees(pricing.subtotal)],
    ...(pricing.discountAmount > 0
      ? [[`Discount${pricing.appliedCoupon ? ` (${pricing.appliedCoupon}, ${pricing.discountPercent}%)` : ''}`, `−${rupees(pricing.discountAmount)}`] as [string, string]]
      : []),
    ['Shipping', pricing.shipping === 0 ? 'Free' : rupees(pricing.shipping)],
    ['Total', rupees(pricing.total)],
  ];

  const customer: [string, string][] = [
    ['Name', formData.name],
    ['Email', formData.email],
    ['Phone', formData.phone],
    ['Address', formData.address],
    ['City', formData.city],
    ['Pincode', formData.pincode],
  ];

  const text = [
    `New Bear Bags order — ${rupees(pricing.total)}`,
    `Placed: ${placedAt}`,
    `Payment: ${payment}`,
    '',
    'Items:',
    ...items.map((i) => `- ${i.label} × ${i.quantity} @ ${rupees(i.unitPrice)} = ${rupees(i.lineTotal)}`),
    '',
    ...totals.map(([k, v]) => `${k}: ${v}`),
    '',
    'Customer:',
    ...customer.map(([k, v]) => `${k}: ${v}`),
  ].join('\n');

  const row = (k: string, v: string, bold = false) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#555">${escapeHtml(k)}</td><td style="padding:4px 0;${bold ? 'font-weight:700;' : ''}">${escapeHtml(v)}</td></tr>`;

  const html = `
<div style="font-family:Arial,sans-serif;font-size:14px;color:#1f3a2d;max-width:600px">
  <h2 style="margin:0 0 4px;color:#134632">New order — ${escapeHtml(rupees(pricing.total))}</h2>
  <p style="margin:0 0 16px;color:#555">${escapeHtml(placedAt)} · ${escapeHtml(payment)}</p>

  <h3 style="margin:16px 0 8px;color:#134632">Items</h3>
  <table style="border-collapse:collapse;width:100%">
    <tr style="text-align:left;color:#555;border-bottom:1px solid #dbe7d2">
      <th style="padding:6px 0">Product</th><th style="padding:6px 8px">Qty</th><th style="padding:6px 8px">Price</th><th style="padding:6px 0;text-align:right">Total</th>
    </tr>
    ${items
      .map(
        (i) =>
          `<tr style="border-bottom:1px solid #f0f0e8"><td style="padding:6px 0">${escapeHtml(i.label)}</td><td style="padding:6px 8px">${i.quantity}</td><td style="padding:6px 8px">${escapeHtml(rupees(i.unitPrice))}</td><td style="padding:6px 0;text-align:right">${escapeHtml(rupees(i.lineTotal))}</td></tr>`,
      )
      .join('')}
  </table>
  <table style="margin-top:12px">${totals.map(([k, v]) => row(k, v, k === 'Total')).join('')}</table>

  <h3 style="margin:20px 0 8px;color:#134632">Customer</h3>
  <table>${customer.map(([k, v]) => row(k, v)).join('')}</table>
</div>`;

  await gmail.transporter.sendMail({
    from: `Bear Bags Orders <${gmail.user}>`,
    to: gmail.user,
    replyTo: formData.email,
    subject: `New order: ${formData.name} — ${rupees(pricing.total)} (${paymentStatus === 'paid' ? 'Paid' : 'COD'})`,
    text,
    html,
  });
}
