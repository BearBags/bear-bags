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

// Progress of the order's Zoho Books invoice (lib/invoice-service.ts). Each id
// is saved as soon as it exists, so a retry resumes instead of starting over.
const invoiceSchema = new Schema(
  {
    status: { type: String, enum: ['pending', 'running', 'done', 'failed'], default: 'pending' },
    zohoCustomerId: { type: String, default: null },
    zohoInvoiceId: { type: String, default: null },
    number: { type: String, default: null },
    paidAt: { type: Date, default: null },
    emailedAt: { type: Date, default: null },
    error: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
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
    // Needed for the GST place of supply. Missing on orders placed before it was asked for.
    state: { type: String, default: null },
    paymentMethod: { type: String, required: true },
    // Every order is paid online through Razorpay before it is saved.
    paymentStatus: { type: String, enum: ['paid'], default: 'paid' },
    razorpayOrderId: { type: String },
    // Unique so one payment can never be recorded as two orders.
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    // Which coupon the buyer applied, so campaign codes can be reported on.
    couponCode: { type: String, default: null },
    items: { type: [orderItemSchema], default: [] },
    // Set from the admin Orders table. The GST invoice is only created once an
    // order is shipped (lib/invoice-service.ts); a cancelled order never gets one.
    // Missing on orders placed before statuses existed, which count as "placed".
    status: { type: String, enum: ['placed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    // Absent on orders placed before invoicing, or while it is switched off.
    invoice: { type: invoiceSchema, default: undefined },
    createdAt: { type: Date, default: Date.now },
  },
);

export type OrderDoc = InferSchemaType<typeof orderSchema>;

// Model registration is cached: in dev, hot reload re-runs this module and
// mongoose throws OverwriteModelError if the model is compiled twice.
export const Order: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) ?? mongoose.model<OrderDoc>('Order', orderSchema);
