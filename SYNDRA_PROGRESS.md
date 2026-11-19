# Syndra Progress

## Current Task

Task 3: cloud API and dashboard, complete.

## Completed

- Created a local Git stash checkpoint before cleanup: `pre-integration-lab-foundation checkpoint`.
- Replaced the active CRA marketplace frontend configuration with a React, TypeScript, Vite, Tailwind, and Vitest foundation.
- Added Rust workspace crates for the Axum API and Clap CLI.
- Added local PostgreSQL Compose configuration and initial relational migrations.
- Ran the API against local PostgreSQL; startup migrations and the database-backed `/health` endpoint succeeded.
- Preserved Firebase project, Firestore rules, Firebase config, and ignored local credentials.
- Added an app-shell test and concise local setup documentation.
- Implemented real local HTTP execution and `syndra init`, `syndra test`, and `syndra report`.
- Added YAML config parsing, environment expansion, bearer/basic auth, JSON request bodies, response assertions, bounded timeouts/response sizes, secret redaction, and JSON reports.
- Added and ran a real loopback POST integration test covering auth, body serialization, environment expansion, response headers, body text, and nested JSON validation.
- Verified the generated config against the local Axum API, including both passing and intentionally failing assertions with correct exit status and report output.
- Added database-backed authentication, owner-scoped project/test-run/result APIs, hashed keys, request-event analytics, four date ranges, profile/theme updates, session revocation, account deletion, and admin-only totals.
- Added dashboard Overview/Analytics charts, project activity and run inspection, theme preference, session management, account deletion confirmation, and project rename/delete controls.
- Configured local admin bootstrap by email after successful password login; the requested email has no account in the local database yet, so no password was used or account created.
- Added owner-scoped project rename/delete and confirmed deleting a project cascades to its test runs/results.
- Added explicit empty-data analytics states, system/light/dark preferences with pre-paint preference loading, and an API connection state driven by actual fetch results.

## Architectural Decisions

- Start as a Rust modular monolith with separate API and CLI crates.
- Keep integration execution local; do not execute submitted code in the cloud.
- Use PostgreSQL as the primary structured cloud-data schema.
- Keep builds in `dist/` so the ignored legacy `build/` artifact is not overwritten.

## Files Changed

Updated the root npm/Vite setup and frontend entry points, added the Rust workspace (`api/`, `cli/`), HTTP engine, PostgreSQL migration and Compose config, sample `syndra.yaml`, and replaced obsolete marketplace docs/handlers. Existing pre-task edits and untracked files are saved in the checkpoint stash.

## Tests and Checks

- `npm test`: passed (2 dashboard tests, including theme persistence).
- `npm run build`: passed (TypeScript check and Vite production build).
- `docker compose config`: passed.
- `cargo fmt --all -- --check`: passed after final formatting.
- `cargo test --workspace`: passed (5 CLI tests, 2 API tests).
- `cargo test -p syndra`: passed (five CLI tests, including a real loopback HTTP request).
- CLI end-to-end pass: one test passed against the local API; JSON report was read back successfully.
- CLI failure path: incorrect expected status reported `expected 201, got 200`, wrote a report, and returned exit code 1.
- `npm audit`: 0 vulnerabilities.
- `npm audit`: 0 vulnerabilities.
- Live PostgreSQL/API lifecycle passed with disposable accounts: all four analytics ranges, request/failure aggregation, project create/rename/delete, ownership checks, theme persistence, password/session security, API-key revocation, and account deletion.
- Admin bootstrap passed with a disposable account: configured-email promotion occurred only after successful login, and the admin-only endpoint returned database totals. The disposable account was deleted.
- All five migrations are applied; no disposable test accounts remain.
- Local Vite preview remains available at `http://localhost:5173/`; API health returns database-connected.
- Preview/API/proxy returned 200/200/401 (expected protected-route response); `docker compose up -d postgres` and health check passed.

## Known Issues

- Firebase rules and Firestore data remain marketplace-era infrastructure and are not used by the new application.
- Billing, quota limits, browser verification, and hosted CLI test execution remain outside the verified Task 3 scope.

## Next Action

Begin Task 4: CI, installation/example docs, security review, responsive verification, and private-beta readiness. Billing remains intentionally unimplemented.