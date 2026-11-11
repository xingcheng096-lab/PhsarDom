# Risk Register

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Browser state treated as authority | Fraudulent orders/stock | Server validation and transactions |
| R2 | Legacy records lack foreign keys | Incorrect ownership | Mapping/import validation |
| R3 | Money rounding mismatch | Finance reconciliation failure | Decimal/minor-unit policy |
| R4 | Concurrent reservations | Overselling | Row locks and idempotency |
| R5 | KYC file leakage | Privacy/compliance | Private storage and signed access |
| R6 | Status migration mismatch | Broken workflows | Explicit status mapping and contract tests |
| R7 | Big-bang frontend migration | Regression | Feature flags and module increments |
| R8 | Unsupported external integrations | Scope/time risk | Keep simulated payment/carrier behavior |
