import { getGmail } from './gmail';
import { getProductById } from './products';
import { formatOrderNumber } from './order-number';
import { getZohoBooksConfig } from './zoho-books';
import { dataRouting } from '@/config/data-routing';
import type { OrderFormData, OrderPricing } from './order-pricing';

// Order emails, sent from the Gmail account in lib/gmail.ts and skipped if it
// is not configured:
//   sendOrderNotification -- a copy of every new order, to the business inbox
//   sendOrderConfirmation -- the customer's "order confirmed" email

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const rupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const row = (k: string, v: string, bold = false) =>
  `<tr><td style="padding:4px 16px 4px 0;color:#555">${escapeHtml(k)}</td><td style="padding:4px 0;${bold ? 'font-weight:700;' : ''}">${escapeHtml(v)}</td></tr>`;

function lineItems(pricing: OrderPricing) {
  return pricing.pricedItems.map((item) => {
    const product = getProductById(item.product.id);
    const size = product ? ` (${product.bagSize}, ${product.bagCount} bags)` : '';
    return {
      label: `${item.product.name}${size}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    };
  });
}

function totalRows(pricing: OrderPricing): [string, string][] {
  return [
    ['Subtotal', rupees(pricing.subtotal)],
    ...(pricing.discountAmount > 0
      ? [[`Discount${pricing.appliedCoupon ? ` (${pricing.appliedCoupon}, ${pricing.discountPercent}%)` : ''}`, `−${rupees(pricing.discountAmount)}`] as [string, string]]
      : []),
    ['Shipping', pricing.shipping === 0 ? 'Free' : rupees(pricing.shipping)],
    ['Total', rupees(pricing.total)],
  ];
}

const itemsTableHtml = (items: ReturnType<typeof lineItems>) => `
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
  </table>`;

interface OrderEmailDetails {
  formData: OrderFormData;
  pricing: OrderPricing;
  razorpayPaymentId?: string;
}

export async function sendOrderNotification({
  formData,
  pricing,
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
  const payment = `Paid online${razorpayPaymentId ? ` (Razorpay payment ${razorpayPaymentId})` : ''}`;

  const items = lineItems(pricing);
  const totals = totalRows(pricing);

  const customer: [string, string][] = [
    ['Name', formData.name],
    ['Email', formData.email],
    ['Phone', formData.phone],
    ['Address', formData.address],
    ['City', formData.city],
    ['State', formData.state],
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

  const html = `
<div style="font-family:Arial,sans-serif;font-size:14px;color:#1f3a2d;max-width:600px">
  <h2 style="margin:0 0 4px;color:#134632">New order — ${escapeHtml(rupees(pricing.total))}</h2>
  <p style="margin:0 0 16px;color:#555">${escapeHtml(placedAt)} · ${escapeHtml(payment)}</p>

  <h3 style="margin:16px 0 8px;color:#134632">Items</h3>
  ${itemsTableHtml(items)}
  <table style="margin-top:12px">${totals.map(([k, v]) => row(k, v, k === 'Total')).join('')}</table>

  <h3 style="margin:20px 0 8px;color:#134632">Customer</h3>
  <table>${customer.map(([k, v]) => row(k, v)).join('')}</table>
</div>`;

  await gmail.transporter.sendMail({
    from: `Bear Bags Orders <${gmail.user}>`,
    to: gmail.user,
    replyTo: formData.email,
    subject: `New order: ${formData.name} — ${rupees(pricing.total)}`,
    text,
    html,
  });
}

export async function sendOrderConfirmation({
  formData,
  pricing,
  orderId,
}: {
  formData: OrderFormData;
  pricing: OrderPricing;
  orderId: string | null;
}): Promise<void> {
  const gmail = getGmail();
  if (!gmail) {
    console.warn('[order-email] GMAIL_USER / GMAIL_APP_PASSWORD not set — customer confirmation skipped.');
    return;
  }

  const orderNumber = orderId ? formatOrderNumber(orderId) : null;
  const items = lineItems(pricing);
  const totals = totalRows(pricing);
  const firstName = formData.name.trim().split(/\s+/)[0];
  const address = [formData.address, `${formData.city}, ${formData.state} ${formData.pincode}`];
  // Only promise an invoice email when one will actually be sent.
  const invoiceNote =
    dataRouting.invoices.createInZohoBooks && getZohoBooksConfig()
      ? "We'll email you again when your order ships, with your GST invoice attached."
      : null;
  const support = dataRouting.admin.email;

  const text = [
    `Hi ${firstName},`,
    '',
    `Thank you for your order${orderNumber ? ` ${orderNumber}` : ''}. Your payment of ${rupees(pricing.total)} was successful.`,
    ...(invoiceNote ? ['', invoiceNote] : []),
    '',
    'Items:',
    ...items.map((i) => `- ${i.label} × ${i.quantity} = ${rupees(i.lineTotal)}`),
    '',
    ...totals.map(([k, v]) => `${k}: ${v}`),
    '',
    'Delivering to:',
    formData.name,
    ...address,
    '',
    `Questions about your order? Reply to this email or write to ${support}.`,
    '',
    'Bear Bags',
  ].join('\n');

  const html = `
<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1f3a2d;max-width:600px">
  <h2 style="margin:0 0 4px;color:#134632">Your order is confirmed</h2>
  ${orderNumber ? `<p style="margin:0 0 16px;color:#555">Order ${escapeHtml(orderNumber)}</p>` : ''}
  <p>Hi ${escapeHtml(firstName)},</p>
  <p>Thank you for your order. Your payment of <strong>${escapeHtml(rupees(pricing.total))}</strong> was successful.</p>
  ${invoiceNote ? `<p>${escapeHtml(invoiceNote)}</p>` : ''}

  <h3 style="margin:20px 0 8px;color:#134632">Your order</h3>
  ${itemsTableHtml(items)}
  <table style="margin-top:12px">${totals.map(([k, v]) => row(k, v, k === 'Total')).join('')}</table>

  <h3 style="margin:20px 0 8px;color:#134632">Delivering to</h3>
  <p style="margin:0">${[formData.name, ...address].map(escapeHtml).join('<br>')}</p>

  <p style="margin-top:24px;color:#555">Questions about your order? Reply to this email or write to
    <a href="mailto:${escapeHtml(support)}" style="color:#134632">${escapeHtml(support)}</a>.</p>
  <p style="color:#555">Bear Bags</p>
</div>`;

  await gmail.transporter.sendMail({
    from: `Bear Bags <${gmail.user}>`,
    to: formData.email,
    replyTo: support,
    subject: `Your Bear Bags order${orderNumber ? ` ${orderNumber}` : ''} is confirmed`,
    text,
    html,
  });
}
