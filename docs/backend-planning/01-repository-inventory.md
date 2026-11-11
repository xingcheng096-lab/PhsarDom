# Repository Inventory

## Entry points and routing

- `src/main.jsx`: React bootstrap.
- `src/App.jsx`: providers and role/public routes.
- `src/layouts/`: public, buyer, staff, department and dashboard layouts.
- `src/routes/navigation.js`: role navigation definitions.

## State and persistence

- `src/services/session.jsx`: demo session, buyer selection, local session persistence.
- `src/services/mockStore.js`: module record CRUD in `meridian-demo-*` keys.
- `src/services/erpStore.jsx`: ERP provider, state hydration/persistence and mutations in `phsardom-erpv1`.
- `src/domain/`: pure pricing, inventory, finance, shipment, report, commission, audit and workflow rules.

## UI modules

- Public catalog/detail: `src/pages/public/products/`, `src/pages/public/PublicPages.jsx`.
- Buyer: `src/pages/buyer/`, `BuyerLayout.jsx`.
- Shared RFQ/quotation/detail forms: `src/pages/shared/`, `src/components/b2b/rfq/`.
- Operations: warehouse, inventory, logistics and finance page folders.

## Tests

- Vitest: `tests/domain.test.js`, `tests/erp-utils.test.js`.
- Playwright: `tests/e2e/` covering public, buyer, Phase 2–4 workflows.
- External preview runner: `scripts/run-e2e-external.ps1` and `playwright.external.config.js`.

## Current mismatch

No backend directory, migrations, API client, environment contract or server integration exists in the inspected repository.
