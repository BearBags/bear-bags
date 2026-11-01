// Adds or removes dummy orders, newsletter subscribers and contributions so the
// admin dashboard and /impact can be previewed with data. Every record is
// tagged `dummy: true` (orders and subscribers also use an @example.com email),
// and `remove` deletes only those. Real contributions saved from the admin
// dashboard never have a `dummy` field, so they are never matched.
//
// Dummy contributions add to the "contributed so far" total on the home page.
// The public pages refresh within 5 minutes (or on the next admin save).
//
// Usage (reads MONGODB_URI from .env.local):
//   node scripts/dummy-data.mjs add contributions      # 8 ledger rows (npm run dummy:add:contributions)
//   node scripts/dummy-data.mjs remove contributions   # (npm run dummy:remove:contributions)
//   node scripts/dummy-data.mjs add orders [count]     # orders + subscribers, default 25 of each
//   node scripts/dummy-data.mjs remove orders
//
// Refuses to touch the production database (`test`).
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local', quiet: true });

const PRODUCTION_DB = 'test';
const [mode, target, countArg] = process.argv.slice(2);
const count = Math.max(1, Number(countArg) || 25);

if ((mode !== 'add' && mode !== 'remove') || (target !== 'contributions' && target !== 'orders')) {
  console.error('Usage: node scripts/dummy-data.mjs <add|remove> <contributions|orders> [count]');
  process.exit(1);
}

const FIRST = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Ishaan', 'Meera', 'Kabir', 'Diya', 'Aditya', 'Neha', 'Rahul', 'Pooja'];
const LAST = ['Sharma', 'Patel', 'Verma', 'Iyer', 'Reddy', 'Gupta', 'Nair', 'Joshi', 'Mehta', 'Rao', 'Chouhan', 'Singh'];
const PLACES = [
  ['Ratlam', '457001'], ['Indore', '452001'], ['Bhopal', '462001'], ['Mumbai', '400001'], ['Pune', '411001'],
  ['Bengaluru', '560001'], ['Delhi', '110001'], ['Jaipur', '302001'], ['Ahmedabad', '380001'], ['Hyderabad', '500001'],
];
const STREETS = ['MG Road', 'Station Road', 'Park Street', 'Nehru Nagar', 'Civil Lines', 'Gandhi Chowk', 'Lake View Colony'];
const COUPONS = [[null, 0], [null, 0], [null, 0], ['FIRSTBEAR', 7], ['BEARBACK', 5], ['FESTIVAL19', 19]];
const UNIT_PRICE = 239;
const NGOS = ['Akshaya Patra', 'Goonj', 'CRY', 'Smile Foundation', 'Pratham', 'HelpAge India', 'Teach For India', 'Give India'];
const FUNDED = [
  'Mid-day meals for 200 children',
  'Winter clothing drive',
  'School supplies for 40 students',
  'Health camp for senior citizens',
  'Library books for a village school',
  'Clean drinking water filters',
  'Scholarships for two students',
  'Tree plantation drive',
];
const CONTRIBUTION_COUNT = 8;

const pick = (list, i) => list[i % list.length];
const daysAgo = (days, hour) => new Date(Date.now() - days * 86_400_000 - hour * 3_600_000);

function makeOrder(i) {
  const first = pick(FIRST, i * 7 + 3);
  const last = pick(LAST, i * 5 + 1);
  const [city, pincode] = pick(PLACES, i * 3);
  const quantity = (i % 3) + 1;
  const [couponCode, discountPercent] = pick(COUPONS, i);
  const unitPrice = Math.round(UNIT_PRICE * (1 - discountPercent / 100));
  const subtotal = UNIT_PRICE * quantity;
  const total = unitPrice * quantity;
  return {
    dummy: true,
    customerName: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    phone: `9${String(800000000 + i * 1234567).slice(0, 9)}`,
    address: `${(i * 13) % 200 + 1}, ${pick(STREETS, i)}`,
    city,
    pincode,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    razorpayOrderId: `order_DUMMY${1000 + i}`,
    razorpayPaymentId: `pay_DUMMY${1000 + i}`,
    subtotal,
    shipping: 0,
    total,
    discountPercent,
    discountAmount: subtotal - total,
    couponCode,
    items: [{ productId: 2, productName: 'Bear Bags — Medium', price: unitPrice, quantity }],
    createdAt: daysAgo(i, i % 10),
    __v: 0,
  };
}

function makeSubscriber(i) {
  const first = pick(FIRST, i * 3 + 5).toLowerCase();
  return { dummy: true, email: `${first}.news${i}@example.com`, createdAt: daysAgo(i * 1.5, i % 7), __v: 0 };
}

// One per month going back from two months before the oldest real one, so the
// dummy rows sort after the real contributions in the /impact table.
function makeContribution(i) {
  const date = new Date(2025, 7 - i, 1);
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return {
    dummy: true,
    month,
    ngo: pick(NGOS, i),
    amount: 5000 + ((i * 3) % 8) * 2500,
    funded: pick(FUNDED, i),
    receiptUrl: '',
    createdAt: new Date(),
    __v: 0,
  };
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
const db = mongoose.connection.db;

if (db.databaseName === PRODUCTION_DB) {
  console.error(`Refusing to run against "${PRODUCTION_DB}" — that is the live site's database.`);
  await mongoose.disconnect();
  process.exit(1);
}

const orders = db.collection('orders');
const subscribers = db.collection('newslettersubscribers');
const contributions = db.collection('contributions');

if (target === 'contributions') {
  if (mode === 'add') {
    // Replace any earlier dummy rows so running `add` twice doesn't double them up.
    await contributions.deleteMany({ dummy: true });
    await contributions.insertMany(Array.from({ length: CONTRIBUTION_COUNT }, (_, i) => makeContribution(i)));
    console.log(`Added ${CONTRIBUTION_COUNT} dummy contributions to "${db.databaseName}".`);
  } else {
    const c = await contributions.deleteMany({ dummy: true });
    console.log(`Removed ${c.deletedCount} dummy contributions from "${db.databaseName}".`);
  }
} else if (mode === 'add') {
  // Replace earlier dummy rows: their ids and emails would hit the unique indexes.
  const dummyOnly = { dummy: true, email: /@example\.com$/ };
  await orders.deleteMany(dummyOnly);
  await subscribers.deleteMany(dummyOnly);
  await orders.insertMany(Array.from({ length: count }, (_, i) => makeOrder(i)));
  await subscribers.insertMany(Array.from({ length: count }, (_, i) => makeSubscriber(i)));
  console.log(`Added ${count} dummy orders and ${count} dummy subscribers to "${db.databaseName}".`);
} else {
  const dummyOnly = { dummy: true, email: /@example\.com$/ };
  const o = await orders.deleteMany(dummyOnly);
  const s = await subscribers.deleteMany(dummyOnly);
  console.log(`Removed ${o.deletedCount} dummy orders and ${s.deletedCount} dummy subscribers from "${db.databaseName}".`);
}

await mongoose.disconnect();
