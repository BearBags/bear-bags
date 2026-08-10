import { connectToDatabase } from './mongodb';
import { Order } from './models/Order';
import { FIRST_TIME_DISCOUNT_PERCENT, RETURNING_DISCOUNT_PERCENT } from './discount';

// Authoritative discount check, run when an order is placed: looks at past
// orders for this email to decide first-time (7%) vs returning (5%) pricing,
// correcting whatever the client's localStorage-based guess was.
export async function getDiscountPercentForEmail(email: string): Promise<number> {
  await connectToDatabase();
  const pastOrders = await Order.countDocuments({ email: email.toLowerCase().trim() });
  return pastOrders === 0 ? FIRST_TIME_DISCOUNT_PERCENT : RETURNING_DISCOUNT_PERCENT;
}
