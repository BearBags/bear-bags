// Shared by the server (API validation) and client components (impact table,
// admin manager), so this file must not import the database.

export interface Contribution {
  id: string;
  month: string;
  ngo: string;
  amount: number;
  funded: string;
  receiptUrl: string;
}

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// "2026-05" -> "May 2026"
export const formatMonth = (month: string) =>
  MONTH_RE.test(month)
    ? new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : month;

export const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

// Receipts open in a new tab, so only allow our own paths or https links --
// never javascript: or other schemes. Backslashes are refused because browsers
// read "/\host" as "//host", another site.
export const isSafeReceiptUrl = (url: string) =>
  url === '' || (!url.includes('\\') && (/^\/[^/]/.test(url) || /^https:\/\//i.test(url)));
