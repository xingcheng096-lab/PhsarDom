# Lecturer Demo Guide

1. Start Laravel from `backend` and Vite from the project root.
2. Use the local demo seeder only when its password environment variables are configured.
3. Sign in as an approved buyer through the real Laravel session.
4. Submit an RFQ with a published product quantity at or above MOQ.
5. Sign in as an administrator and issue a quotation for that RFQ.
6. Sign in again as the owning buyer and accept the quotation.
7. Verify the resulting PO in PostgreSQL and repeat acceptance to demonstrate idempotency.

The current verified vertical slice ends at purchase-order creation. Inventory reservation, invoice, shipment and commission screens should be demonstrated as separate existing frontend demo modules unless their API integration is explicitly enabled.
