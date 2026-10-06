# Typed Phase 1 API
All mutating requests require same-origin validation, JSON validation and authenticated ownership except registration/login/reset and signed provider webhooks. Prices are never accepted from the browser.
GET /api/catalog?q=&brand=&category= : bounded active product results.
GET /api/catalog/:slug : active product, variants, source media.
POST /api/auth/register : email, password, firstName, lastName.
POST /api/auth/login : email, password. Sets HttpOnly session.
POST /api/auth/logout : revokes current session.
POST /api/auth/verify : token. Single use.
POST /api/auth/forgot : email. Enumeration-safe reply.
POST /api/auth/reset : token, password. Revokes all sessions.
GET /api/account : authenticated profile and active sessions.
GET/POST/DELETE /api/cart : authenticated cart; POST variantId, quantity; DELETE variantId.
GET/POST/DELETE /api/wishlist : authenticated saved variants.
POST /api/checkout : idempotencyKey, addressId, fulfilmentMethod. Transactionally recalculates and reserves; returns pending order.
GET /api/orders : owned orders.
POST /api/payments/test : owned pending order; available only with explicit test mode outside production.
POST /api/payments/webhook : HMAC signature over exact body; event ID and provider reference verified.
Admin writes require role/permission and record audit events.
Errors have stable codes and request IDs; no secrets or stack traces are returned.
