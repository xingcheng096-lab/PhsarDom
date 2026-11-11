# Security Gap Analysis

| Risk | Severity | Current evidence | Backend control |
|---|---|---|---|
| localStorage tampering | Critical | ERP and buyer records are browser writable | Server authority, signed session, validation |
| Client-only RBAC | Critical | RoleGuard and store checks run in browser | Policies/middleware on every endpoint |
| Open/unsafe return destinations | High | Login uses `from` route allowlist logic | Strict internal route allowlist |
| Price/stock/credit tampering | Critical | Seed/storage values feed actions | Recalculate and lock server-side |
| KYC document exposure | Critical | Demo documents are client records | Private object storage + authorization |
| Duplicate commands | High | Frontend idempotency exists | Unique idempotency constraints + transactions |
| Cross-buyer access | Critical | UI/store ownership checks | Query scoping and policies |
| Money precision | High | JavaScript number calculations | PostgreSQL numeric or integer minor units |
| Audit forgery | High | Audit is client-persisted | Append-only server audit with protected actor |
| Concurrent stock operations | High | No database lock available | Transactions, row locks, consistent ordering |

No production security claim is made for the current frontend prototype.
