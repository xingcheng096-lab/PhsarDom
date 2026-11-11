# Proposed REST API Contract

Base path: `/api/v1`; JSON errors use `{ message, code, fields }`.

## Identity and buyers

`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /buyers/me`, `POST /buyers`, `POST /buyers/{buyer}/kyc`, `POST /buyers/{buyer}/decision`.

## Catalog and pricing

`GET /products`, `GET /products/{product}`, `GET /products/{product}/price?quantity=`.

## Purchasing

`POST /rfqs`, `GET /rfqs`, `POST /quotations/{quotation}/counteroffers`, `POST /quotations/{quotation}/revisions`, `POST /quotations/{quotation}/decision`, `POST /quotations/{quotation}/accept`, `POST /direct-purchases`, `GET /purchase-orders`.

## Operations and finance

`POST /purchase-orders/{po}/confirm`, `POST /reservations/release`, `POST /inventory/receipts`, `POST /inventory/transfers`, `POST /fulfillment/picks`, `POST /fulfillment/packs`, `POST /shipments`, `POST /shipments/{shipment}/dispatch`, `POST /shipments/{shipment}/pod`, `POST /invoices/from-purchase-order`, `POST /invoices/{invoice}/payments`, `POST /invoices/{invoice}/credit-notes`.

All writes require authenticated actor, policy authorization, validation and idempotency where the operation can be retried. Final schemas and status codes are **PROPOSED DESIGN**, not implemented.
