import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function logout() {
  'use server';
  (await cookies()).delete('bear_admin_session');
  redirect('/admin/login');
}

async function getData() {
  const [orders, subscribers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { orders, subscribers };
}

export default async function AdminPage() {
  const { orders, subscribers } = await getData();

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Subscriptions', value: orders.filter((o) => o.hasSubscription).length },
            { label: 'One-Time', value: orders.filter((o) => !o.hasSubscription).length },
            { label: 'Newsletter', value: subscribers.length },
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
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Zoho</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-[#888]">No orders yet</td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#f0f0e8] last:border-0 hover:bg-[#f8fcf6]">
                    <td className="whitespace-nowrap px-5 py-3 text-[#555]">
                      {order.createdAt.toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1f3a2d]">{order.customerName}</td>
                    <td className="px-5 py-3 text-[#555]">{order.email}</td>
                    <td className="px-5 py-3 text-[#555]">{order.city}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.hasSubscription
                          ? 'bg-[#d4edda] text-[#134632]'
                          : 'bg-[#f0f0e8] text-[#555]'
                      }`}>
                        {order.hasSubscription ? 'Subscribe & Save' : 'One-Time'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#134632]">₹{order.total}</td>
                    <td className="px-5 py-3 capitalize text-[#555]">{order.paymentMethod}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${order.zohoSynced ? 'text-[#134632]' : 'text-[#888]'}`}>
                        {order.zohoSynced ? '✓ Synced' : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <tr key={sub.id} className="border-b border-[#f0f0e8] last:border-0 hover:bg-[#f8fcf6]">
                    <td className="whitespace-nowrap px-5 py-3 text-[#555]">
                      {sub.createdAt.toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1f3a2d]">{sub.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
