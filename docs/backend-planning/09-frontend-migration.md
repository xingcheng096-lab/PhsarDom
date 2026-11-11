# Frontend Migration Strategy

1. Add an API client and auth/session adapter without removing current demo mode.
2. Migrate read-only catalog and buyer profile first.
3. Migrate RFQ/quotation/PO behind feature flags.
4. Migrate inventory, shipment and finance transactions only after API integration tests pass.
5. Replace ERP localStorage authority with server responses; retain localStorage only for theme, filters and drafts.
6. Reconcile seed/demo IDs through an explicit import mapping and dry run.
7. Remove direct mutation fallbacks only after production-like acceptance passes.

Never import arbitrary browser localStorage into a real database automatically.
