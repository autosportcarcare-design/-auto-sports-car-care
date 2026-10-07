# Netlify deployment notes

This package is configured to deploy the storefront application from the monorepo.

Required runtime configuration before the commerce features can be considered fully operational:

- DATABASE_URL: managed PostgreSQL connection string
- APP_ORIGIN: production storefront origin
- ADMIN_ORIGIN: production admin origin
- FULFILMENT_METHOD: confirmed fulfilment mode
- SHIPPING_FEE: decimal shipping fee
- EMAIL_API_URL / EMAIL_API_KEY / EMAIL_FROM: required for verification and reset email delivery

Important: the bundled payment provider is a development simulator and is intentionally blocked in NODE_ENV=production. A real production payment adapter must be implemented before live card checkout is enabled.

The admin application is a separate Next.js app and should be deployed as a second Netlify site/subdomain if required.

## Current production connection

- Netlify project: `autosport-uae`
- Production branch: `main`
- Package directory: `apps/storefront`
- Build status: active continuous deployment

