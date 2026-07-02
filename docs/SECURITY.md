# Security Policy

## Supported Versions

This project is pre-1.0. Security fixes currently target the latest commit on the main development branch.

## Reporting a Vulnerability

Use GitHub's private vulnerability reporting flow if it is enabled for this repository: <https://github.com/saravanaspar/WBMCP/security/advisories/new>. If private reporting is unavailable, open a minimal issue at <https://github.com/saravanaspar/WBMCP/issues> that does not include secrets, customer data, message bodies, exploit payloads, or other sensitive details.

Include:

- Affected version or commit
- Impact summary
- Reproduction steps
- Whether any real tokens, phone numbers, message bodies, or media URLs were exposed

Do not include real access tokens, app secrets, customer phone numbers, or private message bodies in reports.

## Secret Handling

- Never commit `.env` files.
- Never paste real `WHATSAPP_ACCESS_TOKEN` values into issues, tests, docs, examples, logs, or prompts.
- Pass secrets through MCP client environment configuration or a secret manager.
- For SDK/web-app integrations, initialize WBMCP only in backend/server code. Never expose WhatsApp access tokens, app secrets, WABA IDs, or phone number IDs to browser JavaScript.
- Configure `WHATSAPP_APP_SECRET` or the SDK `appSecret` option when available so Graph API calls include `appsecret_proof`.
- The server redacts token-like fields and Authorization headers from audit events and safe errors.
- Optional secrets should be omitted when unused; empty optional secret environment variables are rejected rather than silently accepted.
- Logs go to stderr so stdio MCP traffic on stdout is not polluted.

## SDK Safety

- Use `readOnly: true` for dashboards, audits, and testing flows that should not mutate WhatsApp state.
- Use `requireConfirmation: true` when an AI agent can call dangerous tools.
- Prefer `dryRun: true` before final send-message calls.
- Treat all model-provided tool arguments as untrusted input. WBMCP validates tool schemas, but your application is still responsible for opt-in, tenancy, authorization, and business policy checks before passing `confirm: true`.
- Do not return raw tokens, full phone numbers, message bodies, or webhook payloads to the browser unless your product has an explicit safe-display policy.

## Transport Security

- stdio is the default transport and is the production path for local `npx` MCP clients.
- Local stdio mode does not require a certificate, domain, reverse proxy, or inbound port.
- Plaintext HTTP transport is not supported.
- Native HTTPS mode is retained for explicit hosted MCP deployments and requires operator-supplied certificate and key files.
- HTTPS transport requires a bearer token configured with `MCP_HTTPS_AUTH_TOKEN`.
- HTTPS request bodies are size-limited before MCP parsing.
- HTTPS sessions have a configurable maximum count and idle timeout.
- Bind public interfaces only for hosted deployments and only behind an explicit production access-control layer. Prefer a reverse proxy or platform gateway for certificate lifecycle, access logs, IP policy, and abuse monitoring.
- Future work includes allowed-origin controls for browser-based clients.

## Responsible Disclosure

Please provide maintainers of <https://github.com/saravanaspar/WBMCP> time to validate and patch reported vulnerabilities before public disclosure. Reports involving token leakage, unauthorized message sends, resource data exfiltration, or dangerous-tool bypasses are treated as high severity.

## Official WhatsApp Platform Only

Do not use this project with personal WhatsApp accounts, WhatsApp Web automation, QR login automation, scraping, unofficial clients, reverse-engineered APIs, or session hijacking.

This server is designed only for the official WhatsApp Business Platform / WhatsApp Cloud API through Meta Graph API.
