# Implementation plan
Build Phase 1 only, as requested. Retain existing monorepo and Prisma schema; replace placeholder routes in vertical slices.
1. Establish model, typed API, visual specification and route map.
2. Implement secure account lifecycle and ownership checks.
3. Implement catalogue queries, search, product variants and core admin writes.
4. Implement persisted cart/wishlist and exact server-side totals.
5. Implement transactional checkout, idempotency, stock ledger and signed payment test flow.
6. Test failure paths, private resource access, mobile journey and production builds.
Production provider credentials, PostgreSQL hosting, outbound email and verified catalogue import are deployment dependencies. Test mode must never accept real payment.
