# PhsarDom Database ERD — Verified Vertical Slice

Existing Phase 1/2 tables include users, roles, permissions, buyer businesses, KYC, categories, products and pricing tiers.

Procurement tables added by migration `2026_11_11_010000_create_procurement_tables`:

```text
buyer_businesses 1──* rfqs 1──* rfq_items *──1 products
rfqs 1──* quotations 1──* quotation_items *──1 products
quotations 1──0..1 purchase_orders 1──* purchase_order_items *──1 products
users 1──* rfqs (created_by)
users 1──* quotations (issued_by)
```

`purchase_orders.quotation_id` is unique, which prevents duplicate quotation-to-PO conversion. Quantity and unit-price snapshots are stored on quotation and PO line records.
