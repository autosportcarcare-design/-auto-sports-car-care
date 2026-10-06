# AUTO SPORT Commerce — Phase 1 development build

Next.js, React and strict TypeScript modular monolith with separate storefront, admin and worker applications. PostgreSQL/Prisma is the commerce source of truth. Uses the supplied original logo without modification.

Implemented: account registration, email verification, password reset, session revocation, guest/customer carts and guest-cart merge, active catalogue/search/variants, wishlist, address book, decimal server pricing, stock reservations and ledger, transactional pending orders, signed development payment simulator, webhook replay protection, private order history, admin catalogue editing with audit records, and offline PWA shell.

## Local setup
Requires Node.js 24+, pnpm 11.25 and an isolated PostgreSQL database.

```sh
pnpm install
pnpm db:generate
# Set DATABASE_URL in the shell (Prisma migrations read the package environment).
pnpm --filter @autosport/database exec prisma migrate deploy
# Export the environment values from .env.example before starting apps.
pnpm dev
```

Verification emails require configured EMAIL_API_URL, EMAIL_API_KEY and EMAIL_FROM. The adapter sends JSON `{from,to,subject,text}` with Bearer authentication and an Idempotency-Key header. No email is sent when configuration is absent.

Development checkout requires ENABLE_TEST_PAYMENTS=true, a nonempty PAYMENT_WEBHOOK_SECRET, a confirmed FULFILMENT_METHOD and SHIPPING_FEE with two decimal places. Test checkout and simulated payments are blocked under NODE_ENV=production. No real card details are accepted.

## Checks

```sh
pnpm test
pnpm build
pnpm --filter @autosport/storefront lint
pnpm --filter @autosport/admin lint
pnpm exec playwright install chromium
pnpm test:journey
```

Journey tests create an isolated, in-memory PostgreSQL-compatible PGlite database and explicitly synthetic fixtures. They never seed the real catalogue or send emails. PGlite multiplexing does not prove native PostgreSQL concurrency semantics; load/race tests on real PostgreSQL remain a launch gate. Browser execution can use CHROMIUM_EXECUTABLE_PATH when a system browser is available.

## Deployment status
This is source code with a development payment flow, not a live store. Managed PostgreSQL hosting, email delivery, verified product/media/price/stock import, business fulfilment configuration and a real payment adapter are required before launch. Stripe is the previously selected target; its production integration is not implemented here.

Advanced knowledge, AI advice, B2B quotations, offers/coupons, reviews, scheduled delivery and native apps remain later phases. Do not claim this build satisfies those phases.

See docs/deployment/requirements.md and docs/verification.md for evidence and remaining checks.

## First administrator
Register and verify the owner's account first. An operator with database access can then provision it without storing a default administrator password:

```sh
ADMIN_EMAIL='CONFIRMED_OWNER_EMAIL' pnpm --filter @autosport/worker exec node --import tsx ../../infrastructure/scripts/promote-admin.ts
```

This operator action records an audit entry. The admin app has its own sign-in form and uses the same user database; production deployments on different hostnames can sign in independently.

## Shopify catalogue sync

The connected commerce catalogue can be mirrored into PostgreSQL without inventing missing product data. Set `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, and `DATABASE_URL`, then run:

```bash
pnpm db:generate
pnpm shopify:sync
```

The sync paginates the full Shopify catalogue, preserves Shopify product status, imports product title, handle, vendor/brand, product type/category, description, variants, SKU/barcode, prices, inventory and Shopify-hosted media. Missing SKUs receive a stable internal key based on the Shopify variant ID. Archived Shopify products remain archived and are not shown by the active storefront catalogue query.
