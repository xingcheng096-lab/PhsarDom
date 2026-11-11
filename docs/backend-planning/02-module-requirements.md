# Module Requirements Matrix

| Module | Current frontend evidence | Backend requirement |
|---|---|---|
| Identity/RBAC | session and RoleGuard | users, roles, permissions, policies, sessions |
| Buyers/KYC | buyers seed, registration, approval UI | businesses, users, KYC submissions, private documents |
| Catalog/Pricing | products seed, `pricing.js` | products, SKUs, tiers, price history, publication |
| RFQ/Quotation | mockStore actions, QuoteWorkspace | RFQs, lines, quotations, revisions, approvals, expiry |
| Direct Buy/PO | `directPurchase.js`, ERP action | transactional PO + items, price snapshots, idempotency |
| Inventory | `inventory.js`, ERP actions | warehouses, balances, reservations, movements, locks |
| Fulfillment | picking/packing/shipment domains | allocations, fulfillment lines, shipment reconciliation |
| Finance | `finance.js`, invoices/payments/credits | decimal money, invoices, payments, credit notes, exposure |
| Commission/Reports | commission and reports domains | derived/report queries, payment-linked commission ledger |
| Audit/Notifications | audit arrays and UI timelines | append-only audit, notifications, jobs |
