# Verification and release status

## Passed
- Strict TypeScript compilation and production builds for storefront/admin; all domain packages and worker compile.
- 12 unit checks across password credentials, decimal pricing/tax rounding, order transitions, webhook HMAC and input boundaries.
- 25 database/API integration checks: registration/verification, hashed passwords, guest-cart persistence/merge, live catalogue/SKU search, wishlist, addresses without coordinates, server prices/VAT, stock rejection, checkout replay, reservation creation, pending state before trusted payment event, unsigned webhook rejection, duplicate payment event, one inventory sale, immutable historical price/tax, admin authorization/audit, stock changes at checkout, expiry release, private order access, password reset/session revocation.
- Mobile browser customer journey at 390 × 844: register → verify → login → search → product → cart → address → checkout → simulated payment → confirmation → refresh → order history. No horizontal overflow or page JavaScript errors in that journey.

- Missing product image and failed product video show readable fallbacks, including errors before hydration.

## Test environment
Isolated in-memory PGlite with the official socket multiplexer; Prisma is configured for the test multiplexer with prepared statement caching disabled. Test fixtures are named synthetic, use example.test emails, and are not part of the production catalogue. Email credentials are disabled in the test runner. The browser uses Chromium; the test supports a configured executable path.

## Unverified launch requirements
- Native PostgreSQL concurrency/load behaviour, including simultaneous buyers of the last unit and concurrent webhooks.
- Real email provider delivery, retries and sender identity.
- Real payment provider credentials and signed live-provider webhooks. Current simulator is development-only and production checkout is blocked.
- Production hosting, real inventory import and confirmed fulfilment configuration.
- Real catalogue/media, company/legal invoice data, technical documents and pricing import.
- External penetration testing and operational monitoring.

Advanced knowledge/AI, B2B, coupons/offers, reviews, native packaging and delivery schedules are later phases. Phase 1 must not be presented as the complete 105-section platform or as a launched store.
