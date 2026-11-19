# Security Notes

The API uses Argon2 password hashes, random API/session keys whose SHA-256 hashes are stored, authenticated owner-scoped routes, password-confirmed account changes/deletion, and rate-limited login/registration. It binds to loopback by default and checks PostgreSQL readiness. Admin endpoints require a persisted admin role; self-service registration cannot assign roles. Initial administrator provisioning remains disabled until verified-email ownership and one-time bootstrap are implemented.

Never commit `.env` files, API keys, passwords, or service-account credentials. Never pass passwords through chat, source code, or shell history. Integration requests execute locally; the cloud API must not execute arbitrary user code.

Existing Firebase project settings, Firestore rules, domain configuration, and Vercel connection are preserved. No deployment has been performed.