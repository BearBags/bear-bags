// Minimal Zoho Books (India) API client: just the calls needed to invoice a
// paid order. Written against Zoho Books API v3; every response is checked for
// Zoho's `code: 0` success marker, so an unexpected field name or value fails
// loudly with Zoho's own message instead of producing a wrong invoice.
//
// Setup and env vars: see README → "Invoices (Zoho Books)".

export interface ZohoBooksConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  organizationId: string;
  itemId: string;
  depositAccountId: string | null;
}

/** null when the ZOHO_BOOKS_* variables are not all set. */
export function getZohoBooksConfig(): ZohoBooksConfig | null {
  const {
    ZOHO_BOOKS_CLIENT_ID,
    ZOHO_BOOKS_CLIENT_SECRET,
    ZOHO_BOOKS_REFRESH_TOKEN,
    ZOHO_BOOKS_ORGANIZATION_ID,
    ZOHO_BOOKS_ITEM_ID,
    ZOHO_BOOKS_DEPOSIT_ACCOUNT_ID,
  } = process.env;
  if (!ZOHO_BOOKS_CLIENT_ID || !ZOHO_BOOKS_CLIENT_SECRET || !ZOHO_BOOKS_REFRESH_TOKEN || !ZOHO_BOOKS_ORGANIZATION_ID || !ZOHO_BOOKS_ITEM_ID) {
    return null;
  }
  return {
    clientId: ZOHO_BOOKS_CLIENT_ID,
    clientSecret: ZOHO_BOOKS_CLIENT_SECRET,
    refreshToken: ZOHO_BOOKS_REFRESH_TOKEN,
    organizationId: ZOHO_BOOKS_ORGANIZATION_ID,
    itemId: ZOHO_BOOKS_ITEM_ID,
    depositAccountId: ZOHO_BOOKS_DEPOSIT_ACCOUNT_ID || null,
  };
}

const accountsUrl = () => process.env.ZOHO_ACCOUNTS_URL ?? 'https://accounts.zoho.in';
const apiUrl = () => process.env.ZOHO_BOOKS_API_URL ?? 'https://www.zohoapis.in/books/v3';

// A slow Zoho must not hold the request open until the platform kills it.
const TIMEOUT_MS = 15_000;

export class ZohoBooksError extends Error {}

// Access tokens last an hour; reuse one while it is still valid.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(config: ZohoBooksConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const res = await fetch(`${accountsUrl()}/oauth/v2/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new ZohoBooksError(`Could not log in to Zoho Books: ${data?.error ?? res.status}`);
  }
  cachedToken = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

async function call(
  config: ZohoBooksConfig,
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  { query = {}, body }: { query?: Record<string, string>; body?: unknown } = {},
) {
  const url = new URL(`${apiUrl()}${path}`);
  url.searchParams.set('organization_id', config.organizationId);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${await getAccessToken(config)}`,
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.code !== 0) {
    throw new ZohoBooksError(`Zoho Books ${method} ${path} failed: ${data?.message ?? `HTTP ${res.status}`}`);
  }
  return data;
}

export interface ZohoAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ZohoCustomer {
  name: string;
  email: string;
  phone: string;
  /** GST place-of-supply code, e.g. "KA". */
  placeOfSupply: string;
  address: ZohoAddress;
}

export interface ZohoInvoice {
  invoice_id: string;
  invoice_number: string;
  status: string;
  total: number;
  balance: number;
}

/** Finds the customer by email (updating their address) or creates them. Returns the contact id. */
export async function upsertCustomer(config: ZohoBooksConfig, customer: ZohoCustomer): Promise<string> {
  const email = customer.email.toLowerCase();
  const details = {
    place_of_contact: customer.placeOfSupply,
    billing_address: customer.address,
    shipping_address: customer.address,
  };

  const found = await call(config, 'GET', '/contacts', { query: { email } });
  // Matched again here rather than trusting the filter: if Zoho ignored it, the
  // first contact in the list would belong to someone else.
  const existing = (found.contacts ?? []).find(
    (c: { email?: string; contact_type?: string }) => c.email?.toLowerCase() === email && c.contact_type !== 'vendor',
  );
  if (existing) {
    await call(config, 'PUT', `/contacts/${existing.contact_id}`, { body: details });
    return existing.contact_id;
  }

  const created = await call(config, 'POST', '/contacts', {
    body: {
      contact_name: customer.name,
      contact_type: 'customer',
      customer_sub_type: 'individual',
      gst_treatment: 'consumer',
      ...details,
      contact_persons: [{ first_name: customer.name, email, phone: customer.phone, is_primary_contact: true }],
    },
  });
  return created.contact.contact_id;
}

/** The invoice already created for this payment, if any, so a retry never makes a second one. */
export async function findInvoiceByReference(config: ZohoBooksConfig, reference: string): Promise<ZohoInvoice | null> {
  const found = await call(config, 'GET', '/invoices', { query: { reference_number: reference } });
  const match = (found.invoices ?? []).find((i: { reference_number?: string }) => i.reference_number === reference);
  return match ? getInvoice(config, match.invoice_id) : null;
}

export async function getInvoice(config: ZohoBooksConfig, invoiceId: string): Promise<ZohoInvoice> {
  return (await call(config, 'GET', `/invoices/${invoiceId}`)).invoice;
}

export async function createInvoice(
  config: ZohoBooksConfig,
  invoice: {
    customerId: string;
    reference: string;
    /** YYYY-MM-DD */
    date: string;
    placeOfSupply: string;
    lines: { quantity: number; rate: number }[];
  },
): Promise<ZohoInvoice> {
  const created = await call(config, 'POST', '/invoices', {
    body: {
      customer_id: invoice.customerId,
      reference_number: invoice.reference,
      date: invoice.date,
      place_of_supply: invoice.placeOfSupply,
      gst_treatment: 'consumer',
      // Site prices already include GST; Zoho splits the tax out of them.
      is_inclusive_tax: true,
      line_items: invoice.lines.map((line) => ({ item_id: config.itemId, quantity: line.quantity, rate: line.rate })),
    },
  });
  return created.invoice;
}

/** A draft invoice cannot take a payment; this moves it to "sent" without emailing. */
export async function markInvoiceSent(config: ZohoBooksConfig, invoiceId: string): Promise<void> {
  await call(config, 'POST', `/invoices/${invoiceId}/status/sent`);
}

export async function recordPayment(
  config: ZohoBooksConfig,
  payment: { customerId: string; invoiceId: string; amount: number; date: string; reference: string },
): Promise<void> {
  await call(config, 'POST', '/customerpayments', {
    body: {
      customer_id: payment.customerId,
      payment_mode: 'others',
      amount: payment.amount,
      date: payment.date,
      reference_number: payment.reference,
      description: 'Paid online via Razorpay',
      invoices: [{ invoice_id: payment.invoiceId, amount_applied: payment.amount }],
      ...(config.depositAccountId && { account_id: config.depositAccountId }),
    },
  });
}

/** Zoho emails the invoice, with its PDF attached, to the customer. */
export async function emailInvoice(
  config: ZohoBooksConfig,
  invoiceId: string,
  email: { to: string; subject: string; body: string },
): Promise<void> {
  await call(config, 'POST', `/invoices/${invoiceId}/email`, {
    body: { to_mail_ids: [email.to], subject: email.subject, body: email.body },
  });
}

/** Where the admin can open an invoice in Zoho Books. */
export const zohoInvoiceUrl = (organizationId: string, invoiceId: string) =>
  `https://books.zoho.in/app/${organizationId}#/invoices/${invoiceId}`;
