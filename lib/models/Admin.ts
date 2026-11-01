import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  // Pending password-reset code (bcrypt-hashed) and when it stops working.
  otpHash: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  // Wrong guesses at the pending code. Kept here, not in the per-IP rate limit,
  // so it holds across server instances and rotating IPs.
  otpAttempts: { type: Number, default: 0 },
});

export type AdminDoc = InferSchemaType<typeof adminSchema>;

export const Admin: Model<AdminDoc> =
  (mongoose.models.Admin as Model<AdminDoc>) ?? mongoose.model<AdminDoc>('Admin', adminSchema);
