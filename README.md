# Bear Bags

Website and online shop for **Bear Bags**, compostable garbage bags made by
**Eye of Arjuna**. Customers buy through the site and pay online with Razorpay.
An impact page shows every donation the company has made to NGOs, with receipts.
An admin dashboard manages orders, prices, coupons and those donations.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** and
**MongoDB Atlas** (via Mongoose). Hosted on **Vercel**.

> **Heads-up for contributors:** Next.js 16 has breaking changes compared with
> older versions. Before writing Next-specific code, read the relevant guide in
> `node_modules/next/dist/docs/` (see [AGENTS.md](AGENTS.md)).

---

## Contents

- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Project structure](#project-structure)
- [Pages](#pages)
- [Admin dashboard](#admin-dashboard)
- [Impact page and contributions](#impact-page-and-contributions)
- [Shop, pricing and coupons](#shop-pricing-and-coupons)
- [Orders and payments](#orders-and-payments)
- [API routes](#api-routes)
- [Database](#database)
- [Caching and revalidation](#caching-and-revalidation)
- [Security notes](#security-notes)
- [Legal documents](#legal-documents)
- [Deployment](#deployment)

---

## Getting started

Requirements: **Node.js 20+** and access to a MongoDB Atlas cluster.

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open <http://localhost:3000>. The admin dashboard is at <http://localhost:3000/admin>.

There is no migration step. MongoDB creates collections the first time something
is written to them.

To fill the local dashboard and impact page with sample data, see
[npm scripts](#npm-scripts).

---

## Environment variables

Local values go in `.env.local`, which is git-ignored. Production values go in
**Vercel → Settings → Environment Variables**. A template with comments lives in
[`.env.local.example`](.env.local.example).

| Variable | Required | What it's for |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Put the database name in the path (`.../bear_bags?...`); leave it out and Mongo silently uses `test`. |
| `ADMIN_SESSION_SECRET` | Yes | Random 32+ byte string used to sign the admin session cookie (JWT). |
| `ADMIN_PASSWORD` | First login only | Seeds the single admin account the first time anyone logs in. Ignored after that. |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key (use Test Mode keys locally). Sent to the browser to open the checkout widget, which is safe: it isn't the secret. |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay API secret. Used to create orders and verify payment signatures. |
| `GMAIL_USER` | Optional | Gmail account that sends order notifications and admin password-reset codes. |
| `GMAIL_APP_PASSWORD` | Optional | A Google **App Password** for that account, not the normal password. Without these two, no emails are sent. |

**Databases:** production uses the `test` database. Local development
(`.env.local`) uses `bear_bags`. The dev scripts refuse to write dummy data to
`test`.

`DATABASE_URL` is left over from the old Prisma/Postgres setup and is not used.

---

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run dummy:add:contributions` | Add 8 sample contributions to the ledger (local DB only). |
| `npm run dummy:remove:contributions` | Remove those sample contributions. |
| `npm run dummy:orders:add` | Add 25 sample orders and 25 newsletter subscribers (local DB only). |
| `npm run dummy:orders:remove` | Remove them. |

Other scripts in [`scripts/`](scripts):

- **`node scripts/dummy-data.mjs <add|remove> <contributions|orders> [count]`**:
  the script behind the `dummy:*` commands. Every record it creates is tagged
  `dummy: true`, and `remove` deletes only those, so real data is never touched.
  It refuses to run against the production database (`test`).
- **`node scripts/seed-contributions.mjs`**: loads the real contributions made
  before the admin Contributions section existed (Gnana Jyothi Trust and
  Samarthanam Trust). It's safe to run more than once, because each entry is
  matched on NGO + month and skipped if it's already there.

All scripts read `MONGODB_URI` from `.env.local`.

---

## Project structure

```
app/
  page.tsx                 Home page
  impact/                  Impact page (server page + client view + contributions table)
  shop/  products/  medium-size-bag/  cart/  checkout/
  privacy/  terms/  refunds/            Legal pages
  admin/                   Admin dashboard (server page + client managers)
    login/                 Login, forgot password, reset password
  api/                     Route handlers (see "API routes")
  components/              Shared UI sections (Header, Footer, Impact, FAQ, ...)
  context/CartContext.tsx  Cart state (client)
config/
  data-routing.ts          Flags for what gets stored / emailed, and admin settings
lib/
  mongodb.ts               connectToDatabase(): cached connection for serverless
  models/                  Mongoose models (Order, NewsletterSubscriber, Admin, Coupon,
                           ProductPrice, Contribution, Receipt)
  products.ts              Product catalog (slug, title, base price, bag count)
  product-prices.ts        Live prices = catalog price overridden by admin-saved price
  discount.ts              Coupon rules (tier + campaign), shared with the client
  discount-server.ts       Server-side check of first-time vs returning customer discount
  coupon-server.ts         Loads campaign coupons from the DB
  order-pricing.ts         Server-side cart pricing and validation
  order-service.ts         Saves an order and sends the notification email
  order-email.ts           Order notification email
  contributions.ts         Loads contributions from the DB (server only)
  contribution-format.ts   Contribution type + formatting helpers (safe for client code)
  gmail.ts / mailer.ts     Gmail sender and admin reset-code email
  session.ts               Signs/verifies the admin session JWT (jose)
  rate-limit.ts            In-memory per-IP rate limiter
proxy.ts              Protects /admin and /api/admin/* with the session cookie
scripts/                   Dev / data scripts (see "npm scripts")
public/images/             Site images, NGO letters (acknowledgment/) and receipts (receipts/)
docs/legal/                Source and built versions of the legal policies
db.md                      In-depth database notes (read this before touching models)
```

---

## Pages

| Route | Description |
| --- | --- |
| `/` | Home: hero, why Bear Bags, product intro, impact summary (live "contributed so far" total), testimonials, FAQ, newsletter. |
| `/impact` | Impact page: hero, NGO acknowledgement cards (letters + gallery), contributions ledger, "Our Journey So Far" collage. |
| `/shop`, `/products` | Product listing. |
| `/medium-size-bag` | Product detail page, with the live price. |
| `/cart`, `/checkout` | Cart and checkout (Razorpay). |
| `/privacy`, `/terms`, `/refunds` | Legal policies. |
| `/admin`, `/admin/login` | Admin dashboard and login. |

---

## Admin dashboard

`/admin` is a single page, protected by [`proxy.ts`](proxy.ts). It has
these sections:

- **Stats**: total orders and newsletter subscribers.
- **Orders**: paginated, newest first.
- **Newsletter subscribers**: paginated.
- **Product price**: change the price of the medium bag. The per-bag price is
  derived from it automatically. Saving rebuilds the home and product pages.
- **Coupons**: create, pause/resume or delete campaign codes (festival,
  influencer). See [coupons](#shop-pricing-and-coupons).
- **Contributions**: add, edit or delete donations shown on `/impact`. See
  [below](#impact-page-and-contributions).

### Login and password reset

- There is one admin account (`hello@bearbags.in`, set in
  [`config/data-routing.ts`](config/data-routing.ts)). The password is stored as
  a bcrypt hash in the `Admin` collection.
- On the very first login, if no admin exists yet, one is created from
  `ADMIN_PASSWORD`.
- After a successful login, the server sets a signed JWT cookie
  (`bear_admin_session`, valid for 8 hours). The proxy checks it on every
  `/admin` and `/api/admin/*` request without a database lookup.
- **Forgot password:** a 6-digit code is emailed to the fixed recovery address
  in `config/data-routing.ts` (`recoveryEmail`), and the admin can then set a new
  password. The recovery address is hard-coded on purpose, so a stolen session
  can't redirect it. Login, code requests and code checks are all rate-limited
  per IP.

---

## Impact page and contributions

The impact page shows every donation in a **contributions ledger**: date, NGO,
amount, what it funded and a link to the receipt. It shows 3 rows per page with
Previous/Next buttons, and a running total of all contributions. The same total
appears on the home page as "contributed so far".

All contributions are made through **Eye of Arjuna**, the company behind Bear
Bags.

**Managing contributions:** use the **Contributions** section of `/admin`.

| Field | Notes |
| --- | --- |
| Month | The month the donation was made (`YYYY-MM`). |
| NGO | Up to 100 characters. |
| Amount | Whole rupees. |
| What it funded | Up to 60 characters, so it fits on one line in the table. |
| Receipt | Optional. Click **Upload**, or paste a site path (`/images/...`) or an `https://` link. |

Saving, editing or deleting a contribution rebuilds `/impact` and `/` straight
away.

**Receipts:**

- **Uploaded receipts** (JPG, PNG or WebP, up to 4 MB) are stored in MongoDB,
  in the `Receipt` collection, because Vercel's filesystem is read-only. They're
  served publicly from `/api/receipts/<id>`. The server checks a file's actual
  contents, not just its name, before accepting it.
- **Receipts for the first two donations** are static files in
  `public/images/receipts/`.

> Anything linked as a receipt is publicly viewable. Check receipts for personal
> details (PAN, phone numbers, home addresses) before publishing.

The **NGO acknowledgement cards** above the ledger (letters, descriptions,
gallery photos) are hard-coded in [`app/impact/ImpactView.tsx`](app/impact/ImpactView.tsx).
Adding a new NGO card means editing that file. Adding a ledger row does not.

---

## Shop, pricing and coupons

- **Catalog:** products are defined in [`lib/products.ts`](lib/products.ts).
  Currently that's one product, `medium-size-bag`, with a base price of ₹239.
- **Live price:** the admin can override the catalog price. The override is
  stored in the `ProductPrice` collection. If the database is unreachable, the
  site falls back to the catalog price so the shop stays up.
- **Coupons** ([`lib/discount.ts`](lib/discount.ts)). Nothing is discounted until
  the customer applies a code.
  - **Tier coupons** are earned by order history and are built into the code:
    `FIRSTBEAR` gives 7% off a first order, and `BEARBACK` gives 5% off every
    order after that. They can't be created, edited or deleted from the admin.
  - **Campaign coupons** are created in the admin, with an optional start and
    end date. Anyone can use them while they're active, and they're listed at
    checkout under "Available for you".
- **Prices are always recalculated on the server**
  ([`lib/order-pricing.ts`](lib/order-pricing.ts)) when an order is placed. A
  customer can't give themselves a price or discount they haven't earned by
  editing the page in their browser.

---

## Orders and payments

1. At checkout, the browser calls **`POST /api/payment/create-order`**. The
   server prices the cart and creates a Razorpay order. This endpoint is
   rate-limited per IP.
2. The Razorpay widget collects payment.
3. The browser calls **`POST /api/payment/verify`**. The server checks the
   Razorpay signature, then saves the order
   ([`lib/order-service.ts`](lib/order-service.ts)).
4. After saving, depending on the flags in
   [`config/data-routing.ts`](config/data-routing.ts):
   - the order is stored in MongoDB (`Order`, with its items stored inside the
     same document);
   - a notification email goes to the business Gmail.

Newsletter signups (`POST /api/newsletter`) are stored in MongoDB.

---

## API routes

Public:

| Route | Purpose |
| --- | --- |
| `POST /api/newsletter` | Newsletter signup. |
| `GET /api/products/prices` | Live product prices. |
| `POST /api/pricing` | Price a cart, with coupon (used by cart/checkout). |
| `POST /api/coupon` | Check / list coupons available to a buyer. |
| `POST /api/payment/create-order` | Create a Razorpay order (rate-limited). |
| `POST /api/payment/verify` | Verify a payment and save the order. |
| `GET /api/receipts/[id]` | Serve an uploaded contribution receipt. |

Admin (session required, enforced by `proxy.ts`):

| Route | Purpose |
| --- | --- |
| `POST /api/admin/login` | Log in (rate-limited). Logging out is a server action on `/admin`. |
| `POST /api/admin/forgot-password` | Email a reset code to the recovery address (rate-limited). |
| `POST /api/admin/verify-otp` | Check the reset code (rate-limited). |
| `POST /api/admin/reset-password` | Set a new password. |
| `PUT /api/admin/products` | Change a product price. |
| `POST/PATCH/DELETE /api/admin/coupons` | Manage campaign coupons. |
| `POST/PATCH/DELETE /api/admin/contributions` | Manage contributions. |
| `POST /api/admin/receipts` | Upload a receipt image. Returns its URL. |

The login and password-reset routes are reachable without a session. Everything
else under `/api/admin/` needs one.

---

## Database

MongoDB Atlas via Mongoose. Collections:

| Model | Contents |
| --- | --- |
| `Order` | Customer details, items (stored inside the order), totals, discount and payment status. |
| `NewsletterSubscriber` | Email (unique) and signup date. |
| `Admin` | The single admin: email, password hash, reset-code hash and expiry. |
| `Coupon` | Campaign coupons: code, percent, description, start/end dates, active flag. |
| `ProductPrice` | Admin-saved price overrides per product. |
| `Contribution` | Ledger rows: month, NGO, amount, what it funded, receipt URL. |
| `Receipt` | Uploaded receipt files (bytes + content type). |

Key rules (more detail in **[db.md](db.md)**):

- Call `await connectToDatabase()` before any query. The connection is cached,
  so this is cheap when already connected.
- **Never import a model or `lib/contributions.ts` into a Client Component.**
  Mongoose only runs on the server. Shared helpers that client code needs belong
  in a file with no database imports, like `lib/contribution-format.ts`.
- Use `String(doc._id)` for IDs and React keys.
- Don't reintroduce Prisma. Prisma 7 can't connect to MongoDB (explained in `db.md`).

---

## Caching and revalidation

The home page, `/impact` and `/medium-size-bag` are static pages that rebuild
**every 5 minutes** (`export const revalidate = 300`). They're also rebuilt
**immediately** when an admin save calls `revalidatePath`:

| Admin action | Pages rebuilt |
| --- | --- |
| Change product price | `/`, `/medium-size-bag` |
| Add / edit / delete a contribution | `/`, `/impact` |

If the database fails during a background rebuild, Next.js keeps serving the
last good version of the page rather than one showing ₹0. `/admin` and all API
routes are dynamic, so they always read fresh data.

Data written straight to the database by a script doesn't trigger a rebuild.
It shows up on the next 5-minute refresh, or the next time the admin saves
something.

---

## Security notes

- Admin password and reset codes are bcrypt-hashed. Sessions are signed JWTs
  (HS256) in a cookie.
- Login, reset codes, Razorpay order creation and the pricing/coupon endpoints
  are rate-limited per IP ([`lib/rate-limit.ts`](lib/rate-limit.ts)). The limiter
  keeps its counts in memory, so each server instance counts separately. It's
  meant to stop casual abuse, not replace a firewall.
- Every price and discount is recalculated on the server, and Razorpay payment
  signatures are verified on the server.
- Receipt links must be a site path or an `https://` URL; other kinds of link
  are rejected. Uploaded receipts are checked by their actual contents and
  served with `X-Content-Type-Options: nosniff`.
- The recovery email for admin password resets is fixed in code, not editable
  from the dashboard.
- `.env` and `.env.local` are git-ignored. Never commit secrets.

---

## Legal documents

The privacy, terms and refund pages are rendered from
[`app/components/LegalPage.tsx`](app/components/LegalPage.tsx). Downloadable
Word and PDF versions live in [`docs/legal/`](docs/legal), generated from
`content.json`:

```bash
cd docs/legal
python3 build-docs.py   # .docx
python3 build-pdfs.py   # .pdf
```

---

## Deployment

The site deploys to **Vercel**.

1. Set every required variable from [Environment variables](#environment-variables)
   in the Vercel project. `MONGODB_URI` must point at the production database.
2. In MongoDB Atlas, allow access from `0.0.0.0/0`. Vercel's servers don't have
   fixed IP addresses, so the database user's password is what keeps the
   database secure; make it strong.
3. Push to `main`. Vercel builds and deploys automatically.

Because the home and impact pages read contributions at build time, the
production database must be reachable during `next build`.
