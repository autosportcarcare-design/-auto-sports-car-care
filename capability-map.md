# Phase 1 capability map
User's 2026-10-06 specification governs implementation; previously selected architecture: new monorepo, self-managed sessions, PostgreSQL/Prisma, Stripe adapter target, Vercel.

| Module | Responsibility | Depends on |
|---|---|---|
| config | Confirmed identity and environment validation | — |
| database | Prisma persistence, constraints, migrations | — |
| auth | Password hashing, verification/reset, sessions, RBAC | database |
| catalog | Active products, variants, brands, categories, search | database |
| pricing | Exact decimal totals and immutable tax snapshots | catalog |
| commerce | Cart, wishlist, checkout, stock reservation | auth, pricing |
| payments | Signed test-provider webhook, replay protection | commerce |
| orders | Private order history and immutable snapshots | payments |
| admin | Authorized catalogue management and audit | auth, catalog |

Build order: schema/contracts → auth → catalog → cart/wishlist → checkout/order → payment webhook → admin → end-to-end verification.
No production catalogue seed. Synthetic products belong only in isolated automated tests.
