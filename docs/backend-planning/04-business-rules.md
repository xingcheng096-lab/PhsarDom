# Verified Business Rules

- Buyer registration creates Pending status; restricted purchasing requires Approved status.
- RFQ quantity must be a positive integer and meet product MOQ.
- Pricing is resolved from valid quantity tiers and buyer group; browser totals are not authoritative.
- Quotation acceptance requires an allowed status, non-expired quotation and completed mandatory approval.
- Quote-to-PO is idempotent: one quotation may create at most one linked PO.
- Direct Buy validates buyer approval, ownership, product eligibility, quantity, MOQ, tier price, stock, credit hold/limit and idempotency before PO creation.
- Inventory availability is based on available stock and reservations; negative available stock is not allowed unless an explicitly approved backorder policy applies.
- Picking cannot exceed eligible reserved quantity; packing cannot exceed picked quantity.
- Shipment quantities cannot exceed packed/shippable quantities; POD quantities cannot exceed dispatched quantities.
- Finance mutations require finance-authorized roles; payments cannot overpay; credit notes require eligible outstanding balance.
- Successful mutations write actor, action, entity, timestamp and before/after audit data.

These are **VERIFIED FROM CODE** and must be reviewed before backend implementation because some seed/legacy exceptions remain.
