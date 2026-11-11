# PhsarDom — Final Delivery Notes

This repository contains a React/Vite frontend and a Laravel 12 API backed by PostgreSQL.

## Verified real-data modules

- Laravel authentication, Sanctum cookie session and RBAC.
- Buyer business registration and pending KYC persistence.
- Product catalog, categories, MOQ and pricing-tier APIs.
- Procurement vertical slice: approved buyer RFQ → admin quotation → buyer acceptance → idempotent PO.

The RFQ/quotation/PO API uses PostgreSQL. Older inventory, finance and logistics demo screens remain localStorage-based unless explicitly marked as API-backed.

## Commands

```powershell
cd backend
php artisan test --env=testing
cd ..
npm.cmd test -- --run
npm.cmd run build
```

Do not run migrations against `PhsaDom` in automated tests. Tests must use `phsardom_test`.

## Known limitation

The PHPUnit-only CSRF assertion is not a valid substitute for a real browser cookie round-trip and currently reports a false negative in the feature harness. Real browser HTTP verification is documented in `TEST_RESULTS.md`; production CSRF remains enabled.
