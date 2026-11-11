# Requirements Traceability

| Requirement area | Frontend source/evidence | Proposed backend owner | Current status |
|---|---|---|---|
| Authentication/session | `session.jsx` | Auth controllers/Sanctum | VERIFIED FROM CODE / PROPOSED DESIGN |
| Buyer/KYC | `AuthPages.jsx`, `mockStore.js` | Buyer/KYC actions and policies | VERIFIED FROM CODE |
| Pricing/MOQ | `domain/pricing.js` | Pricing service | VERIFIED FROM CODE |
| Direct Buy | `domain/directPurchase.js`, `erpStore.jsx` | Transactional direct purchase action | VERIFIED FROM CODE / NOT SERVER-AUTHORITATIVE |
| RFQ/quotation | `mockStore.js`, `QuoteWorkspace.jsx` | RFQ/quotation services | VERIFIED FROM CODE |
| Inventory | `domain/inventory.js`, `erpStore.jsx` | Inventory transaction service | VERIFIED FROM CODE / NOT CONCURRENT-SAFE |
| Finance | `domain/finance.js`, finance pages | Finance services | VERIFIED FROM CODE / NOT SERVER-AUTHORITATIVE |
| Shipment | `domain/shipments.js`, logistics pages | Shipment service | VERIFIED FROM CODE |
| Reports/commission | `domain/reports.js`, `commissions.js` | Query/report services | VERIFIED FROM CODE |
| Audit | `domain/audit.js`, ERP state | Append-only audit events | VERIFIED FROM CODE / CLIENT-FORGEABLE |
