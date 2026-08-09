# Database — MongoDB Atlas via Mongoose

Bear Bags stores newsletter signups and orders in **MongoDB Atlas**, accessed with
**Mongoose**. What gets written is governed by [`config/data-routing.ts`](config/data-routing.ts) —
flip the flags there, not in the route handlers.

## Why not Prisma

This project previously used Prisma 7 + PostgreSQL. Prisma was removed, because
**Prisma 7 cannot connect to MongoDB**:

- Prisma 7 requires a driver adapter for every connection. The client's type is
  `adapter: SqlDriverAdapterFactory` — SQL only.
- There is no Mongo adapter. `@prisma/adapter-mongodb` does not exist on npm, and the
  official adapter list is planetscale / neon / libsql / better-sqlite3 / d1 / pg / mssql / mariadb.
- A `provider = "mongodb"` schema still **validates and generates without error** — this is
  a trap. It fails only at runtime with:
  `Missing configured driver adapter. Engine type 'client' requires an active driver adapter.`

Prisma 6 supported Mongo via the Rust query engine, which is exactly what Prisma 7 removed.
So Mongo on Prisma means pinning to a superseded major forever. Mongoose was chosen instead:
it restores the schema validation and generated types that Prisma provided.

**Do not reintroduce Prisma for Mongo.** If you want Prisma back, it means going back to Postgres.

## Setup

### 1. Create the Atlas cluster

1. <https://cloud.mongodb.com> → create a free **M0** cluster.
2. **Database Access** → add a user with *Read and write to any database*.
3. **Network Access** → add an IP allowlist entry.
   Vercel serverless has no static egress IPs, so this must be `0.0.0.0/0` unless you
   pay for Vercel static IPs or Atlas Private Endpoint. The database user + password is
   the actual security boundary — make the password strong.
4. **Connect → Drivers** → copy the SRV connection string.

### 2. Set the connection string

Add to `.env` (local) and to **Vercel → Settings → Environment Variables** (prod):

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/bear_bags?retryWrites=true&w=majority
```

- The database name (`bear_bags`) goes in the **path**. Omit it and you silently write to `test`.
- URL-encode the password if it contains `@ : / ? # [ ]` (e.g. `@` → `%40`).
- `MONGODB_URI` replaces the old `DATABASE_URL`, which is now unused.

### 3. Run

```bash
npm run dev
```

There is no migration or `generate` step — Mongo creates collections on first write.
(The old `postinstall: prisma generate` script was removed.)

## Code layout

| File | Role |
| --- | --- |
| [`lib/mongodb.ts`](lib/mongodb.ts) | Connection helper — `connectToDatabase()` |
| [`lib/models/Order.ts`](lib/models/Order.ts) | `Order` model, with items embedded |
| [`lib/models/NewsletterSubscriber.ts`](lib/models/NewsletterSubscriber.ts) | `NewsletterSubscriber` model |
| [`config/data-routing.ts`](config/data-routing.ts) | Flags for what is stored / sent to Zoho |

Call `await connectToDatabase()` before any query. It's cheap when already connected.

## Connection handling (serverless)

`lib/mongodb.ts` caches the connection promise on `globalThis`. This matters on Vercel:
each warm function invocation reuses the module scope, so without the cache every request
would open a new connection and exhaust the Atlas M0 pool (500 connections).

Two deliberate options:

- `bufferCommands: false` — fail fast rather than silently queueing commands against a
  dead connection.
- `serverSelectionTimeoutMS: 10_000` — surface connection errors instead of hanging until
  the platform timeout.

A rejected connection promise is cleared so the next request retries rather than caching
the failure forever.

## Schema

`Order` embeds its items — an order and its items are always read and written together,
so they are one document. This replaced the relational `Order → OrderItem` join.

```
Order {
  _id, customerName, email, phone, address, city, pincode,
  paymentMethod, subtotal, shipping, total,
  hasSubscription, zohoSynced, createdAt,
  items: [{ productId, productName, price, quantity, purchaseType }]
}

NewsletterSubscriber { _id, email (unique), createdAt }
```

Consequences of embedding:

- No `include` / join on read — items arrive with the order.
- Items are not independently queryable. Cross-order product analytics ("how many of
  product 3 sold?") needs an aggregation pipeline with `$unwind`, not a simple find.
- Deleting an order deletes its items automatically — no cascade needed.

`createdAt` is declared explicitly rather than via Mongoose's `timestamps` option, because
`InferSchemaType` does not pick up timestamp-generated fields, which broke the types in
the admin page.

Models are registered through a `mongoose.models.X ?? mongoose.model(...)` guard — dev hot
reload re-runs the module, and compiling a model twice throws `OverwriteModelError`.

### `_id`, not `id`

Documents key on `_id` (an ObjectId), not `id`. Use `String(doc._id)` for React keys.

## Gotchas

- **The unique index on `email` is created by Mongoose's `autoIndex`, which is on by
  default.** It is *not* guaranteed to exist the instant the app first boots. The
  newsletter upsert filters on `email`, so duplicates are unlikely, but two truly
  concurrent signups before the index exists could double-insert. To be certain, run
  `NewsletterSubscriber.syncIndexes()` once against prod, or create the index in Atlas.
  Consider setting `autoIndex: false` in prod once indexes are established, since building
  indexes on every cold start costs latency.
- **`next build` does not need a live database.** `/admin` is `force-dynamic` and the API
  routes are dynamic, so nothing connects at build time. A missing `MONGODB_URI` will fail
  at request time, not build time.
- **`mongoose` is auto-externalized by Next 16** (it's on the built-in
  `serverExternalPackages` list), so no `next.config.ts` change is needed.
- **Never import models into a Client Component.** Mongoose is server-only; keep it in
  route handlers and Server Components.

## Verified

Against MongoDB 7, exercising the real `lib/` code: connect, `Order.create` with embedded
items, newsletter upsert twice → 1 document, admin read back with `createdAt` as a `Date`
and `_id` stringifying to 24 chars. `npx tsc --noEmit`, `eslint`, and `next build` all pass.
