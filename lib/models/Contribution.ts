import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// One donation to an NGO, shown in the contributions table on /impact and
// summed into the "contributed so far" figure on the home page. Managed from
// the admin dashboard.
const contributionSchema = new Schema({
  // Calendar month of the donation (YYYY-MM), e.g. "2026-05".
  month: { type: String, required: true },
  ngo: { type: String, required: true, trim: true },
  // Whole rupees.
  amount: { type: Number, required: true, min: 1 },
  funded: { type: String, required: true, trim: true },
  // Site path ("/images/...") or https:// link to the receipt. Empty hides "View".
  receiptUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export type ContributionDoc = InferSchemaType<typeof contributionSchema>;

export const ContributionModel: Model<ContributionDoc> =
  (mongoose.models.Contribution as Model<ContributionDoc>) ??
  mongoose.model<ContributionDoc>('Contribution', contributionSchema);
