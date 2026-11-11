# Test Results

## Backend

Command:

```powershell
cd backend
php artisan test --env=testing
```

Result: 25 passed, 1 failed, 74 assertions. The only failure is `SecurityIntegrationTest::test_cookie_csrf_flow_rejects_missing_and_invalid_tokens`, where the PHPUnit request harness receives 200 instead of the expected 419. This is not used to weaken production CSRF.

Targeted procurement command:

```powershell
php artisan test --env=testing tests/Feature/ProcurementApiTest.php --testdox
```

Result: 2 passed, 9 assertions.

## Frontend

- `npm.cmd test -- --run`: 24 passed.
- `npm.cmd run build`: passed.

## Real browser session evidence

Using a clean browser cookie context against the local Laravel/Vite servers:

| Request | Result |
|---|---:|
| CSRF cookie | 204 |
| Admin login | 200 |
| Admin `/api/auth/me` | 200 |
| Admin KYC listing | 200 |
| Buyer KYC listing | 403 |
| Logout | 200 |
| `/api/auth/me` after logout | 401 |

No password, cookie value or session identifier is stored in this document.
