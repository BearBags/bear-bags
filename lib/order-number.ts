// The order number customers see in their confirmation email and the admin
// shows next to each order: the end of the order's database id, e.g. BB-3F9A1C02.
export const formatOrderNumber = (orderId: string) => `BB-${orderId.slice(-8).toUpperCase()}`;
