// Adds or removes dummy orders and newsletter subscribers so the admin
// dashboard can be previewed with data. Every record is tagged `dummy: true`
// and uses an @example.com email, and `remove` deletes only those.
//
// Usage (reads MONGODB_URI from .env.local):
//   node scripts/dummy-data.mjs add [count]   # default 25 of each
//   node scripts/dummy-data.mjs remove
//
// Refuses to touch the production database (`test`).
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local', quiet: true });

const PRODUCTION_DB = 'test';
const [mode, countArg] = process.argv.slice(2);
const count = Math.max(1, Number(countArg) || 25);

if (mode !== 'add' && mode !== 'remove') {
  console.error('Usage: node scripts/dummy-data.mjs add [count] | remove');
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
  const paid = i % 4 !== 3;
  return {
    dummy: true,
    customerName: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    phone: `9${String(800000000 + i * 1234567).slice(0, 9)}`,
    address: `${(i * 13) % 200 + 1}, ${pick(STREETS, i)}`,
    city,
    pincode,
    paymentMethod: paid ? 'online' : 'cod',
    paymentStatus: paid ? 'paid' : 'cod',
    ...(paid && { razorpayOrderId: `order_DUMMY${1000 + i}`, razorpayPaymentId: `pay_DUMMY${1000 + i}` }),
    subtotal,
    shipping: 0,
    total,
    discountPercent,
    discountAmount: subtotal - total,
    couponCode,
    zohoSynced: i % 5 !== 0,
    items: [{ productId: 2, productName: 'Bear Bags — Medium', price: unitPrice, quantity }],
    createdAt: daysAgo(i, i % 10),
    __v: 0,
  };
}

function makeSubscriber(i) {
  const first = pick(FIRST, i * 3 + 5).toLowerCase();
  return { dummy: true, email: `${first}.news${i}@example.com`, createdAt: daysAgo(i * 1.5, i % 7), __v: 0 };
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

if (mode === 'add') {
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
