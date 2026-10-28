import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// Receipt files uploaded from the admin Contributions section. The site runs on
// Vercel, whose filesystem is read-only, so the file bytes live in MongoDB and
// are served by app/api/receipts/[id]. Uploads are capped well below Mongo's
// 16 MB document limit (see app/api/admin/receipts).
const receiptSchema = new Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  filename: { type: String, default: '' },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type ReceiptDoc = InferSchemaType<typeof receiptSchema>;

export const ReceiptModel: Model<ReceiptDoc> =
  (mongoose.models.Receipt as Model<ReceiptDoc>) ??
  mongoose.model<ReceiptDoc>('Receipt', receiptSchema);
