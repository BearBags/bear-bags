import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const newsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
);

export type NewsletterSubscriberDoc = InferSchemaType<typeof newsletterSubscriberSchema>;

export const NewsletterSubscriber: Model<NewsletterSubscriberDoc> =
  (mongoose.models.NewsletterSubscriber as Model<NewsletterSubscriberDoc>) ??
  mongoose.model<NewsletterSubscriberDoc>('NewsletterSubscriber', newsletterSubscriberSchema);
