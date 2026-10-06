# Phase 1 Architecture

## Boundary
A modular monolith with two Next.js applications and domain packages. PostgreSQL is the source of truth.

## Trust rules
1. Browser input is untrusted.
2. Pricing, tax, availability and totals are resolved server-side.
3. Payment state changes only after trusted provider confirmation/webhook handling.
4. Order line and address snapshots are immutable historical records.
5. Technical product data is never invented.

## Authorization
Routine actions do not ask for repeat approval once the server has validated a role/permission.
SUPER_ADMIN short-circuits application permission checks to true.
Security-sensitive actions still require authentication, permission checks, validation, and audit logging.

## Payment
Phase 1 includes a mock provider implementing the stable PaymentProvider contract.
Stripe is the intended next provider; provider-specific production code remains isolated.

## Search
Start with PostgreSQL search while preserving a transport/service contract that can move to Meilisearch/OpenSearch later.

## Deployment
Target Vercel for storefront/admin and a managed PostgreSQL database. Secrets remain server-side.
