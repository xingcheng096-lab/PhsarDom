# PhsarDom Backend Planning — Phase 0

## Status

**WAITING FOR APPROVAL** — analysis only. No Laravel, database, API, or frontend business-code changes were made.

## Verified from code

- React + Vite application with React Router.
- Demo authentication and role switching are client-side (`src/services/session.jsx`).
- ERP state is persisted in `localStorage` under `phsardom-erpv1` (`src/services/erpStore.jsx`).
- Legacy record helpers persist module records under `meridian-demo-*` (`src/services/mockStore.js`).
- Domain modules cover pricing, direct purchase, RFQ/quotation workflows, inventory, finance, shipments, reporting, commissions and audit.
- Current authorization is frontend-only and cannot be trusted in production.

## Proposed direction

Laravel API + PostgreSQL, Sanctum for SPA authentication, server-side policies, database transactions, idempotency keys and immutable audit events. Migrate module by module; keep localStorage only for UI preferences/drafts after backend acceptance.

## Critical risks

1. Browser storage can be edited by the user; prices, stock, credit and approval cannot be authoritative there.
2. Seed records use mixed identifiers and some legacy records lack stable foreign keys.
3. Client-side route guards do not protect API data.
4. Money is represented as JavaScript numbers; backend must use decimal/integer minor units.
5. Multi-record operations need database transactions and concurrency controls.
