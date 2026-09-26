import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { NewsletterSubscriber } from '@/lib/models/NewsletterSubscriber';
import { CouponModel } from '@/lib/models/Coupon';
import { isCampaignActive } from '@/lib/discount';
import CouponsManager, { type AdminCoupon, type CouponStatus } from './CouponsManager';
import ProductPriceCard from './ProductPriceCard';
import Pagination from './Pagination';
import { getLiveProductBySlug } from '@/lib/product-prices';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function logout() {
  'use server';
  (await cookies()).delete('bear_admin_session');
  redirect('/admin/login');
}

const PAGE_SIZE = 10;

// ?ordersPage=2 -> 2. Anything missing or invalid is page 1; pages past the end
// are clamped once the total is known.
const pageFrom = (value: string | undefined) => Math.max(1, Math.floor(Number(value)) || 1);

async function getData(ordersPageParam: number, subscribersPageParam: number) {
  await connectToDatabase();
  const [orderCount, subscriberCount] = await Promise.all([
    Order.countDocuments(),
    NewsletterSubscriber.countDocuments(),
  ]);
  const ordersTotalPages = Math.max(1, Math.ceil(orderCount / PAGE_SIZE));
  const subscribersTotalPages = Math.max(1, Math.ceil(subscriberCount / PAGE_SIZE));
  const ordersPage = Math.min(ordersPageParam, ordersTotalPages);
  const subscribersPage = Math.min(subscribersPageParam, subscribersTotalPages);

  // Items are embedded in the order document, so no join/include is needed.
  const [orders, subscribers, couponDocs, product] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip((ordersPage - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    NewsletterSubscriber.find().sort({ createdAt: -1 }).skip((subscribersPage - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    CouponModel.find().sort({ createdAt: -1 }).lean(),
    getLiveProductBySlug('medium-size-bag'),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const coupons: AdminCoupon[] = couponDocs.map((doc) => {
    const startsAt = doc.startsAt ?? '';
    const endsAt = doc.endsAt ?? '';
    // Same date rule checkout uses (isCampaignActive), so the badge matches
    // whether customers can actually see the code.
    const inWindow = isCampaignActive({ code: doc.code, percent: doc.percent, kind: 'campaign', blurb: '', startsAt, endsAt });
    const status: CouponStatus = !doc.active
      ? 'Paused'
      : inWindow
        ? 'Active'
        : startsAt && today < startsAt
          ? 'Scheduled'
          : 'Expired';
    return { id: String(doc._id), code: doc.code, percent: doc.percent, blurb: doc.blurb ?? '', startsAt, endsAt, active: doc.active, status };
  });

  return {
    orders, orderCount, ordersPage, ordersTotalPages,
    subscribers, subscriberCount, subscribersPage, subscribersTotalPages,
    coupons, product,
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const {
    orders, orderCount, ordersPage, ordersTotalPages,
    subscribers, subscriberCount, subscribersPage, subscribersTotalPages,
    coupons, product,
  } = await getData(pageFrom(query.ordersPage), pageFrom(query.subscribersPage));

  return (
    <main className="min-h-screen bg-[#f4f4ec] py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-[#134632]">Bear Bags — Admin</h1>
          <form action={logout}>
            <button type="submit" className="rounded-full border border-[#d1ddcf] bg-white px-5 py-2 text-sm text-[#555] hover:bg-[#f0f0e8]">
              Log out
            </button>
          </form>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Orders', value: orderCount },
            { label: 'Newsletter', value: subscriberCount },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[20px] border border-[#dbe7d2] bg-white p-5 shadow-sm">
              <div className="text-3xl font-bold text-[#134632]">{value}</div>
              <div className="mt-1 text-sm text-[#555]">{label}</div>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-[#134632]">Orders</h2>
          <div className="overflow-x-auto rounded-[20px] border border-[#dbe7d2] bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#dbe7d2] text-left text-xs font-semibold uppercase tracking-wide text-[#555]">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-[#888]">No orders yet</td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={String(order._id)} className="border-b border-[#f0f0e8] last:border-0 hover:bg-[#f8fcf6]">
                    <td className="whitespace-nowrap px-5 py-3 text-[#555]">
                      {order.createdAt.toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1f3a2d]">{order.customerName}</td>
                    <td className="px-5 py-3 text-[#555]">{order.email}</td>
                    <td className="px-5 py-3 text-[#555]">{order.city}</td>
                    <td className="px-5 py-3 font-semibold text-[#134632]">₹{order.total}</td>
                    <td className="px-5 py-3 capitalize text-[#555]">{order.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              param="ordersPage"
              page={ordersPage}
              totalPages={ordersTotalPages}
              totalItems={orderCount}
              pageSize={PAGE_SIZE}
              searchParams={query}
            />
          </div>
        </section>

        {/* Newsletter subscribers */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-[#134632]">Newsletter Subscribers</h2>
          <div className="overflow-x-auto rounded-[20px] border border-[#dbe7d2] bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#dbe7d2] text-left text-xs font-semibold uppercase tracking-wide text-[#555]">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-[#888]">No subscribers yet</td>
                  </tr>
                )}
                {subscribers.map((sub) => (
                  <tr key={String(sub._id)} className="border-b border-[#f0f0e8] last:border-0 hover:bg-[#f8fcf6]">
                    <td className="whitespace-nowrap px-5 py-3 text-[#555]">
                      {sub.createdAt.toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1f3a2d]">{sub.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              param="subscribersPage"
              page={subscribersPage}
              totalPages={subscribersTotalPages}
              totalItems={subscriberCount}
              pageSize={PAGE_SIZE}
              searchParams={query}
            />
          </div>
        </section>

        {product && (
          <ProductPriceCard productId={product.id} title={product.title} bagCount={product.bagCount} price={product.price} />
        )}

        <CouponsManager coupons={coupons} />

      </div>
    </main>
  );
}
