/**
 * Central config that governs exactly what data goes where.
 * Change flags here — the API routes read from this object.
 */
export const dataRouting = {
  database: {
    // MongoDB Atlas via Mongoose — stores permanent records
    storeNewsletterSignups: true,
    storeOrders: true,            // full order: customer info + items
  },

  email: {
    // Email a copy of every order to GMAIL_USER (see lib/order-email.ts)
    sendOrderNotifications: true,
    // Email the customer an order confirmation (see lib/order-email.ts)
    sendCustomerConfirmations: true,
  },

  invoices: {
    // Create a paid GST invoice in Zoho Books for every order and have Zoho
    // email it to the customer (see lib/invoice-service.ts). Needs the
    // ZOHO_BOOKS_* env vars; until they are set, orders show "Invoice failed:
    // not set up" in the admin and can be retried once they are.
    createInZohoBooks: true,
  },

  admin: {
    routePrefix: '/admin',
    sessionCookieName: 'bear_admin_session',
    sessionMaxAgeSeconds: 60 * 60 * 8, // 8 hours
    email: 'hello@bearbags.in', // the single admin account
    // Password-reset codes always go here. Fixed in code on purpose: there is
    // no way to change it from the dashboard, so a stolen session cannot
    // redirect recovery to an attacker's inbox.
    recoveryEmail: 'aschouhan17@gmail.com',
  },
} as const;
