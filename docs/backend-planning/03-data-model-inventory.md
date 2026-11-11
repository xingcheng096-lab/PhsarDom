# Data Model Inventory

## Existing logical entities

Products (`id`, `sku`, `name`, `category`, `moq`, `price`, `stock`, `tiers`, `status`); buyers (`id`, `business`, contact, creditLimit, status, group, documents); RFQs; quotations with negotiation history and approval; purchase orders with source, buyer, quantity, pricing and terms; inventory rows; reservations; picking/packing; shipments/POD/discrepancies; invoices/payments/credit notes; commission rules/ledger; audit events.

## Required normalized backend entities

`users`, `roles`, `permissions`, `businesses`, `business_users`, `kyc_submissions`, `kyc_documents`, `products`, `categories`, `product_price_tiers`, `price_versions`, `rfqs`, `rfq_items`, `quotations`, `quotation_revisions`, `quotation_approvals`, `purchase_orders`, `purchase_order_items`, `warehouses`, `inventory_balances`, `stock_movements`, `reservations`, `fulfillment_lines`, `shipments`, `shipment_items`, `proofs_of_delivery`, `discrepancies`, `credit_accounts`, `invoices`, `invoice_items`, `payments`, `credit_notes`, `commission_rules`, `commission_entries`, `audit_events`, `idempotency_keys`, `notifications`.

## Identity rules

Use UUID/ULID primary keys or documented numeric IDs. Buyer ownership must use `business_id`, never display business name. Preserve legacy IDs in migration columns where needed.
