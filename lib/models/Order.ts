import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// Order items are embedded rather than a separate collection: an order and its
// items are always read and written together, so they live in one document.
const orderItemSchema = new Schema(
  {
    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['cod', 'paid'], default: 'cod' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    zohoSynced: { type: Boolean, default: false },
    items: { type: [orderItemSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
);

export type OrderDoc = InferSchemaType<typeof orderSchema>;

// Model registration is cached: in dev, hot reload re-runs this module and
// mongoose throws OverwriteModelError if the model is compiled twice.
export const Order: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) ?? mongoose.model<OrderDoc>('Order', orderSchema);
