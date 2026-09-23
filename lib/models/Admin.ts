import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
});

export type AdminDoc = InferSchemaType<typeof adminSchema>;

export const Admin: Model<AdminDoc> =
  (mongoose.models.Admin as Model<AdminDoc>) ?? mongoose.model<AdminDoc>('Admin', adminSchema);
