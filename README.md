# Syndra Integration Lab

Local-first integration testing infrastructure for developers. Syndra runs real HTTP checks in the Rust CLI and stores account, project, test-run, result, usage, and analytics data in PostgreSQL. The React dashboard includes real project history, analytics, account settings, sessions, and API-key management.

## Requirements

- Node.js 20.19+ or 22.12+
- Rust and Cargo
- Docker Compose (for local PostgreSQL)

## Start the web shell

```sh
npm install
npm run dev
```

## Start the API locally

```sh
docker compose up -d postgres
cp .env.example .env
set -a && . ./.env && set +a
cargo run -p syndra-api
npm run dev
```

The API applies checked-in SQL migrations on startup. Its `/health` endpoint checks the live database connection. The local Vite proxy and `.env.example` use port 18080. The admin overview endpoint is restricted to persisted `admin` roles; initial admin provisioning is intentionally disabled until a verified-email bootstrap flow is configured. Normal registration cannot choose or change a role.

## Run local HTTP tests

Install the CLI from the repository:

```sh
cargo install --path cli
syndra init
export API_BASE_URL=http://127.0.0.1:18080
syndra test
syndra report
```

`syndra init` refuses to overwrite an existing config. Tests make real HTTP requests from the local machine and need no Syndra cloud account. `syndra test --config syndra.yaml --report report.json` selects the config and JSON report paths. Failed assertions are shown in the terminal, saved to the report, and return a nonzero exit code.

The YAML config supports GET, POST, PUT, PATCH, and DELETE; request headers; bearer or basic authentication; JSON bodies; `${ENV_VAR}` expansion in URLs, headers, auth, and JSON values; timeouts; status/header/body/JSON assertions; and nested JSON paths such as `data.users[0].id`. Per-request timeouts are limited to two minutes and response bodies to 10 MiB.

Example:

```yaml
project:
  name: example-api
tests:
  - name: create-user
    request:
      method: POST
      url: ${API_BASE_URL}/users
      auth:
        type: bearer
        token: ${API_TOKEN}
      body:
        name: Example
        invite: ${TEST_INVITE}
      timeout_ms: 5000
    expect:
      status: 201
      headers:
        content-type: application/json
      body_contains: created
      json:
        - path: data.id
          equals: 42
```

Run frontend checks with `npm test` and `npm run build`. Rust checks use `cargo test --workspace`.

## Dashboard API

The API exposes authenticated project CRUD, test-run and result storage, usage and analytics ranges (`24h`, `7d`, `30d`, `90d`), API key/session management, account settings, and a role-protected admin overview. Analytics are derived from stored test results and authenticated request events; missing history is shown as empty rather than fabricated. Billing, quotas, cloud test execution, and server-side CLI run preview are not implemented.

No deployment or external infrastructure changes are part of local development. Existing Firebase, DNS, domain, and Vercel settings are retained.