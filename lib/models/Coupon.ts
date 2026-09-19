import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// Campaign coupons created from the admin dashboard: festival offers,
// influencer codes and the like. The two tier coupons (FIRSTBEAR/BEARBACK) are
// not stored here -- they are earned by order history and defined in
// lib/discount.ts, so they cannot be deleted by accident.
const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  percent: { type: Number, required: true, min: 1, max: 100 },
  blurb: { type: String, default: '' },
  // Inclusive ISO calendar days (YYYY-MM-DD). Empty means open-ended.
  startsAt: { type: String, default: null },
  endsAt: { type: String, default: null },
  // Lets a campaign be switched off without losing its dates or history.
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export type CouponDoc = InferSchemaType<typeof couponSchema>;

export const CouponModel: Model<CouponDoc> =
  (mongoose.models.Coupon as Model<CouponDoc>) ??
  mongoose.model<CouponDoc>('Coupon', couponSchema);
