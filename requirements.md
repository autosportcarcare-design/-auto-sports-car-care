# Deployment requirements and gates
Required: managed PostgreSQL, APP_ORIGIN and ADMIN_ORIGIN, an email API endpoint/key/from identity, application secret configuration, verified catalogue import, confirmed fulfilment options and fees, authorized first admin.
Current payment implementation is a signed development simulator. It is explicitly blocked in production. No real card is accepted. Stripe remains the selected production adapter target and must be configured and verified before production checkout is enabled.
Run the worker for reservation expiry and email jobs. Customer messages are not sent if a provider is missing; jobs remain queued.
Vercel storefront/admin deployment requires a separately running worker or authenticated scheduled job. Do not deploy the worker as a permanently running Vercel request handler.
No catalogue seed runs automatically. Synthetic test records are isolated and must never be imported into production.
No production deployment or live commerce operation is claimed by this package.
