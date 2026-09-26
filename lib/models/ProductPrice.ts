import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// Admin-set price for a catalog product. The catalog in lib/products.ts holds
// everything else about a product (and the fallback price); only the price is
// editable from the dashboard, so only the price lives here.
const productPriceSchema = new Schema({
  productId: { type: Number, required: true, unique: true },
  price: { type: Number, required: true, min: 1 },
  updatedAt: { type: Date, default: Date.now },
});

export type ProductPriceDoc = InferSchemaType<typeof productPriceSchema>;

export const ProductPrice: Model<ProductPriceDoc> =
  (mongoose.models.ProductPrice as Model<ProductPriceDoc>) ??
  mongoose.model<ProductPriceDoc>('ProductPrice', productPriceSchema);
