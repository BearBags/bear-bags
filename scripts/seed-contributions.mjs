// Loads the contributions made before the admin "Contributions" section
// existed. Safe to run more than once: each entry is matched on NGO + month
// and left alone if it is already there.
//
// Usage (reads MONGODB_URI from .env.local):
//   node scripts/seed-contributions.mjs
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local', quiet: true });

const CONTRIBUTIONS = [
  {
    month: '2026-05',
    ngo: 'Gnana Jyothi Trust',
    amount: 20000,
    funded: 'Welfare of blind students at the hostel',
    receiptUrl: '/images/receipts/gnana-jyothi-receipt-may-2026.jpg',
  },
  {
    month: '2025-10',
    ngo: 'Samarthanam Trust',
    amount: 15000,
    funded: 'Skills training for one student',
    receiptUrl: '/images/receipts/samarthanam-receipt-oct-2025.jpg',
  },
];

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const collection = mongoose.connection.collection('contributions');

for (const c of CONTRIBUTIONS) {
  const result = await collection.updateOne(
    { ngo: c.ngo, month: c.month },
    { $setOnInsert: { ...c, createdAt: new Date() } },
    { upsert: true },
  );
  console.log(`${result.upsertedCount ? 'added  ' : 'exists '} ${c.month} ${c.ngo}`);
}

await mongoose.disconnect();
