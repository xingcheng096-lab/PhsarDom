# Testing

On Windows/Codex, use the external preview runner because the default Playwright-managed Vite webServer can remain alive after tests finish.

```powershell
.\scripts\run-e2e-external.ps1
```

The runner builds the app, requires port 4415 to be free, starts its own Vite preview, waits for HTTP readiness, runs the desktop suite with `playwright.external.config.js`, and stops only the process it started. It returns exit code 0 only when Playwright passes and port 4415 is released. A non-zero exit code indicates build, readiness, test, or owned-process cleanup failure.
## Phase 4 quality gate

Unit tests: `npm.cmd test`

Dedicated Phase 4 browser tests use the desktop project and include reporting,
commission authorization/idempotency, five viewport smoke checks, and keyboard
label/focus checks. The full suite is run through:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/run-e2e-external.ps1
```

The external runner builds `dist`, owns preview port 4415, waits for readiness,
runs Playwright, and cleans up only its child preview process. Port 4415 must be
free before starting. These are frontend simulation tests; they do not prove
production authentication, accounting or payment settlement.

## Buyer portal checks

The buyer portal browser coverage is split between `buyer-portal.spec.js` and
`buyer-sidebar-dashboard.spec.js`. The latter verifies the session-linked buyer
business/status card, buyer-only navigation labels, active catalog navigation,
sidebar collapse, mobile Escape handling, quick-action routing, and compact
viewport overflow. Run the same external command above to include these tests
in the full desktop regression. The buyer dashboard reads buyer-owned records
from the existing localStorage-backed ERP/mock stores; it does not create a
second source of truth.
