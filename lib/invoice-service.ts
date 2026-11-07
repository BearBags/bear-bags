import { connectToDatabase } from './mongodb';
import { Order } from './models/Order';
import { indiaDay } from './discount';
import { stateCode } from './indian-states';
import { formatOrderNumber } from './order-number';
import { escapeHtml } from './order-email';
import { dataRouting } from '@/config/data-routing';
import {
  createInvoice,
  emailInvoice,
  findInvoiceByReference,
  getInvoice,
  getZohoBooksConfig,
  markInvoiceSent,
  recordPayment,
  upsertCustomer,
} from './zoho-books';

// Invoices a paid order in Zoho Books: customer → invoice → payment → email.
// Runs when the admin marks the order as shipped (GST: the invoice is issued at
// dispatch, and a customer may cancel before then), and again whenever the
// admin presses Retry. Orders that are not shipped are never invoiced.
//
// Each step's result is saved on the order as it completes, so a retry picks up
// where the last attempt stopped. The invoice is also looked up in Zoho by the
// Razorpay payment id before one is created, so even a step that succeeded in
// Zoho but failed to save here never produces a duplicate invoice.

// An attempt that crashed mid-way (e.g. the function was killed) leaves the
// order "running"; after this long a retry may take it over.
const STALE_ATTEMPT_MS = 5 * 60_000;

// Products sold on the site that have a Zoho Books item. Only one today.
const INVOICED_PRODUCT_IDS = new Set([2]);

export type InvoiceStatus = 'pending' | 'running' | 'done' | 'failed';

export interface InvoiceResult {
  status: InvoiceStatus;
  number: string | null;
  error: string | null;
}

/**
 * Runs (or resumes) invoicing for one order. Returns the outcome, or null if
 * the order is already invoiced or another attempt is in progress.
 */
export async function invoiceOrder(orderId: string): Promise<InvoiceResult | null> {
  await connectToDatabase();

  // Claimed atomically, so the automatic run and an admin retry can never work
  // on the same order at once.
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: 'shipped',
      $or: [
        { 'invoice.status': { $in: ['pending', 'failed'] } },
        { 'invoice.status': { $exists: false } },
        { 'invoice.status': 'running', 'invoice.startedAt': { $lt: new Date(Date.now() - STALE_ATTEMPT_MS) } },
      ],
    },
    { $set: { 'invoice.status': 'running', 'invoice.startedAt': new Date() }, $inc: { 'invoice.attempts': 1 } },
    { returnDocument: 'after' },
  );
  if (!order?.invoice) return null;
  const invoice = order.invoice;

  try {
    if (!dataRouting.invoices.createInZohoBooks) {
      throw new Error('Invoicing is turned off in config/data-routing.ts.');
    }
    const config = getZohoBooksConfig();
    if (!config) throw new Error('Zoho Books is not set up yet: add the ZOHO_BOOKS_* environment variables.');

    const placeOfSupply = stateCode(order.state);
    if (!placeOfSupply) {
      throw new Error('This order has no delivery state, so the GST place of supply is unknown. Create the invoice in Zoho by hand.');
    }
    const unsupported = order.items.find((item) => !INVOICED_PRODUCT_IDS.has(item.productId));
    if (unsupported) throw new Error(`"${unsupported.productName}" has no Zoho Books item.`);

    const reference = order.razorpayPaymentId ?? String(order._id);
    // Dated the day it shipped: that is the GST time of supply.
    const date = indiaDay(order.shippedAt ?? new Date());

    invoice.zohoCustomerId ??= await upsertCustomer(config, {
      name: order.customerName,
      email: order.email,
      phone: order.phone,
      placeOfSupply,
      address: { address: order.address, city: order.city, state: order.state ?? '', zip: order.pincode, country: 'India' },
    });
    await order.save();

    let zohoInvoice = invoice.zohoInvoiceId
      ? await getInvoice(config, invoice.zohoInvoiceId)
      : await findInvoiceByReference(config, reference);
    // Item prices on the order are what was charged, after any coupon.
    zohoInvoice ??= await createInvoice(config, {
      customerId: invoice.zohoCustomerId,
      reference,
      date,
      placeOfSupply,
      lines: order.items.map((item) => ({ quantity: item.quantity, rate: item.price })),
    });
    invoice.zohoInvoiceId = zohoInvoice.invoice_id;
    invoice.number = zohoInvoice.invoice_number;
    await order.save();

    // Checked before any payment is recorded: an invoice that disagrees with
    // what Razorpay charged must be looked at, not marked paid.
    if (Math.abs(Number(zohoInvoice.total) - order.total) > 0.5) {
      throw new Error(`Zoho's invoice total (₹${zohoInvoice.total}) doesn't match the amount paid (₹${order.total}). Check the item's GST settings.`);
    }

    if (zohoInvoice.status === 'draft') await markInvoiceSent(config, zohoInvoice.invoice_id);
    if (Number(zohoInvoice.balance) > 0) {
      await recordPayment(config, {
        customerId: invoice.zohoCustomerId,
        invoiceId: zohoInvoice.invoice_id,
        amount: order.total,
        date,
        reference,
      });
    }
    invoice.paidAt ??= new Date();
    await order.save();

    if (!invoice.emailedAt) {
      await emailInvoice(config, zohoInvoice.invoice_id, {
        to: order.email,
        // Never Cc the customer's own address back to them.
        cc: dataRouting.invoices.ccInvoiceEmailsTo.filter((cc) => cc.toLowerCase() !== order.email.toLowerCase()),
        subject: `Your Bear Bags order ${formatOrderNumber(String(order._id))} has shipped (invoice ${zohoInvoice.invoice_number})`,
        body: `Hi ${escapeHtml(order.customerName)},<br><br>Good news: your Bear Bags order ${formatOrderNumber(String(order._id))} has been shipped. Your invoice is attached.<br><br>Questions? Just reply to this email.<br><br>Bear Bags (Eye of Arjuna)`,
      });
      invoice.emailedAt = new Date();
    }

    invoice.status = 'done';
    invoice.error = null;
  } catch (error) {
    console.error(`[invoice] order ${orderId} failed:`, error);
    invoice.status = 'failed';
    invoice.error = (error instanceof Error ? error.message : String(error)).slice(0, 500);
  }

  await order.save();
  return { status: invoice.status as InvoiceStatus, number: invoice.number ?? null, error: invoice.error ?? null };
}
