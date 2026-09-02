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

  zohoCRM: {
    // Leads created in Zoho CRM free plan
    sendNewsletterSubscribers: true,
    sendAllOrders: true,
  },

  admin: {
    routePrefix: '/admin',
    sessionCookieName: 'bear_admin_session',
    sessionMaxAgeSeconds: 60 * 60 * 8, // 8 hours
  },
} as const;
