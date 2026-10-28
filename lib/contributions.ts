import { connectToDatabase } from './mongodb';
import { ContributionModel } from './models/Contribution';
import type { Contribution } from './contribution-format';

// All contributions, newest first. Errors are deliberately not swallowed: the
// public pages using this are static, and if a background rebuild throws, Next
// keeps serving the last good version instead of one showing ₹0.
export async function getContributions(): Promise<Contribution[]> {
  await connectToDatabase();
  const docs = await ContributionModel.find().sort({ month: -1, createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    month: doc.month,
    ngo: doc.ngo,
    amount: doc.amount,
    funded: doc.funded,
    receiptUrl: doc.receiptUrl ?? '',
  }));
}
