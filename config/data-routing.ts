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
  },

  zohoCRM: {
    // Leads created in Zoho CRM free plan
    sendNewsletterSubscribers: true,
    sendAllOrders: true,
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
