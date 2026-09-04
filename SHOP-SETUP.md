# Shop setup

The ecommerce module is fully built. Everything below is credentials and
dashboard configuration — no more code is needed.

Until a service has its keys, the shop degrades rather than crashes: `/shop`,
`/account` and `/admin` each render a checklist naming the exact variables
still missing, and the rest of the portfolio site is unaffected.

Start by copying the template:

```bash
cp .env.example .env.local
```

Then work through the five services below. Restart `npm run dev` after each —
Next.js reads environment variables at boot.

---

## 1. MongoDB Atlas — the database

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access** → add a user with *Read and write to any database*.
3. **Network Access** → add your IP. For a deployed app, add your host's egress
   IPs, or `0.0.0.0/0` if your host has no fixed IP.
4. **Database → Connect → Drivers** → copy the connection string.

```
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=joyce_shop
```

If the password contains `@ : / ?` or `#`, URL-encode it (`@` → `%40`).

Collections and indexes are created automatically on first write — there is
nothing to migrate.

---

## 2. Clerk — sign-in and admin access

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. **API keys** → copy both keys.

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ADMIN_EMAILS=joyce@example.com
```

`ADMIN_EMAILS` is a comma-separated list — it is how the first admin gets in
before any metadata exists. The durable route is to open the user in Clerk →
**Metadata → Public** and set:

```json
{ "role": "admin" }
```

Either one grants `/admin`. Everyone else who signs in is an ordinary customer
and gets `/account` only.

> Buying does **not** require an account. Guest checkout works; signing in just
> gives the customer a permanent home for their orders and downloads.

---

## 3. Stripe — payments

1. **Developers → API keys** → copy the secret key (`sk_test_…` while testing).
2. **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-domain.com/api/commerce/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
     - `charge.refunded`
3. Copy the endpoint's **Signing secret**.

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### The webhook is not optional

Orders are only marked paid, stock only moves, download links only exist, and
receipts only send **from the webhook**. The success page the customer lands on
is just a URL — anyone could visit it — so it grants nothing. Without a working
webhook, payments succeed at Stripe and nothing happens in the shop.

**Testing locally**, run the Stripe CLI in a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/commerce/webhooks/stripe
```

It prints its own `whsec_…`. Use *that* one in `.env.local` while developing —
it is different from the dashboard endpoint's secret.

### Shipping rates

Flat rate, free over a threshold, editable in one place:
`src/lib/commerce/shipping.ts`.

---

## 4. Cloudinary — images and digital goods

1. Sign up at [cloudinary.com](https://cloudinary.com).
2. **Settings → Product Environment Credentials** → copy all three values.

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Nothing else to configure — uploads are signed per-request by the server, so no
upload preset is needed.

Two storage modes are used deliberately:

| What | Cloudinary type | Why |
|---|---|---|
| Product images | `upload` (public) | They need to load in the shop and in emails. |
| Files you sell | `private` | Cloudinary refuses to serve these from a plain URL. |

Paid files are streamed through `/api/commerce/download/[token]` after the
token is checked, so the customer never sees a Cloudinary URL at all.

---

## 5. ZeptoMail — receipts and download links

1. In ZeptoMail, verify your sending domain (DKIM + SPF).
2. **Mail Agents** → open your agent → **SMTP & API** → **Send Mail Token**.

```
ZEPTOMAIL_TOKEN=Zoho-enczapikey wSsV...
ZEPTOMAIL_HOST=api.zeptomail.eu
ZEPTOMAIL_FROM_ADDRESS=shop@yourverifieddomain.com
ZEPTOMAIL_FROM_NAME=Joyce Wadawasina
```

- `ZEPTOMAIL_HOST` is `api.zeptomail.eu` for EU accounts, `api.zeptomail.com`
  for US. Using the wrong one fails authentication.
- `ZEPTOMAIL_FROM_ADDRESS` **must** be on a domain verified in ZeptoMail.

Three emails are sent: the order receipt (with download buttons), a shipping
notification when you mark an order shipped, and a new-order alert to the first
address in `ADMIN_EMAILS`.

Email failures never roll back a payment — they are logged, and an order whose
receipt did not send shows "Receipt: Not sent" in the admin, with a re-send
button.

---

## 6. Site URL

```
NEXT_PUBLIC_SITE_URL=https://joycewadawasina.com
```

This builds the Stripe return URLs and the download links inside emails. If it
is wrong in production, customers get emailed `localhost` links. No trailing
slash.

---

## First run

```bash
npm run dev
```

1. Go to `/sign-up` and create your account with an address in `ADMIN_EMAILS`.
2. Go to `/admin` — the dashboard should open.
3. **Products → New product**, fill it in, upload an image (and a file, for a
   download), set status to **Live**, save.
4. Visit `/shop` — it is there.
5. Add to basket, check out with Stripe's test card `4242 4242 4242 4242`, any
   future expiry, any CVC.
6. With `stripe listen` running, the order flips to **paid**, the receipt
   arrives, and the download link works.

---

## Going live

- Swap `sk_test_…` for `sk_live_…` and create a **live-mode** webhook endpoint
  (its signing secret is different again).
- Move Clerk to a production instance and add your domain.
- Set `NEXT_PUBLIC_SITE_URL` to the real origin.
- Add every variable to your host's environment settings — `.env.local` is not
  deployed.
- Add your host's IPs to Atlas Network Access.

---

## How it fits together

```
Shopper                    This app                     Services
───────                    ────────                     ────────
/shop            ──────►   listPublicProducts()  ─────► MongoDB
add to basket    ──────►   localStorage (ids only)
/cart            ──────►   POST /api/commerce/cart ───► MongoDB (re-price)
checkout         ──────►   POST /api/commerce/checkout
                             ├─ re-price from DB  ────► MongoDB
                             ├─ write pending order ──► MongoDB
                             └─ create session    ────► Stripe
                 ◄──────   redirect to Stripe Checkout
pays at Stripe
                           POST /api/commerce/webhooks/stripe  ◄── Stripe
                             ├─ verify signature
                             ├─ order → paid       ───► MongoDB
                             ├─ decrement stock    ───► MongoDB
                             ├─ mint download tokens ─► MongoDB
                             └─ send receipt       ───► ZeptoMail
/shop/success    ──────►   reads the order (grants nothing)
/account         ──────►   orders + live download links
click download   ──────►   GET /api/commerce/download/[token]
                             ├─ check paid / expiry / count
                             ├─ claim one use      ───► MongoDB
                             └─ stream the file    ◄─── Cloudinary (private)
```

### Key files

| Path | What it does |
|---|---|
| `src/lib/commerce/env.ts` | Reads config; reports what is missing |
| `src/lib/commerce/checkout.ts` | Re-prices the cart, creates the Stripe session |
| `src/lib/commerce/fulfillment.ts` | What happens once Stripe confirms payment |
| `src/lib/commerce/auth.ts` | `requireAdmin()` — the authorisation boundary |
| `src/lib/commerce/shipping.ts` | Shipping rates, all of them |
| `src/lib/commerce/email.ts` | ZeptoMail client and the three templates |
| `src/proxy.ts` | Clerk middleware (Next 16 renamed `middleware` → `proxy`) |

### Security notes

- **Prices are never taken from the browser.** The cart holds product ids and
  quantities only; every price is re-read from Mongo at checkout.
- **Only the webhook grants anything.** The success page is unauthenticated and
  read-only.
- **`requireAdmin()` runs inside every admin page and route handler**, not just
  in the proxy — a route reachable by direct `fetch` has to defend itself.
- **Download tokens** are 24 random bytes, single-order, use-counted and
  time-limited, and the counter is claimed with a conditional update so two
  tabs cannot both spend the last use.
