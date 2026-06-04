# WBMCP

`wbmcp` is an MCP-only TypeScript server for the official WhatsApp Business Platform / WhatsApp Cloud API through Meta Graph API.

Source repository: <https://github.com/saravanaspar/WBMCP>

The GitHub project is named `WBMCP`. The npm package and CLI executable are lowercase `wbmcp`, which is the correct form for npm and shell usage.

It exposes WhatsApp Business account operations as MCP tools and read-only MCP resources. Local `npx` installs use stdio by default and need no inbound HTTPS setup. Native TLS MCP Streamable HTTP remains available as an explicit hosted deployment mode. Plaintext HTTP transport is intentionally not supported. It does not include a dashboard, webhook host, CRM integration, campaign system, or user REST API.

## Official API Only

This project integrates only with the official WhatsApp Business Platform / WhatsApp Cloud API through Meta Graph API.

It never uses WhatsApp Web scraping, QR login automation, browser automation, unofficial clients, personal WhatsApp account automation, session hijacking, or reverse-engineered APIs.

## Status

This package is structured for npm distribution and direct MCP client usage through `npx`. The production default is local stdio transport; HTTPS is opt-in for hosted MCP deployments only.

## Setup

Requirements:

- Node.js 20+
- A WhatsApp Business Platform app and Cloud API access token
- A WhatsApp Business Account ID
- A WhatsApp phone number ID

For npm users, add WBMCP to Codex and save credentials locally:

```bash
codex mcp add WBMCP -- npx -y wbmcp@latest
npx -y wbmcp@latest auth
```

The `auth` and `setup` prompts show a short credential guide before asking for values. The guide points users to Meta for Developers, WhatsApp > API Setup, the production System User token location, and this repository setup section.

Or let WBMCP write the Codex MCP config directly:

```bash
npx -y wbmcp@latest setup codex
```

The setup command saves credentials to `~/.config/wbmcp/config.json`. Environment variables still work and override saved config values. Do not commit real tokens. Local `npx` MCP clients communicate with WBMCP over stdio, so users do not need certificates, domains, reverse proxies, or inbound ports. WBMCP still calls Meta Graph API over outbound HTTPS.

For local development from GitHub:

```bash
git clone https://github.com/saravanaspar/WBMCP.git
cd WBMCP
npm install
```

## Local Config and Environment Variables

`wbmcp auth` and `wbmcp setup codex` save this local config file:

```text
~/.config/wbmcp/config.json
```

Set `WBMCP_CONFIG_FILE=/absolute/path/to/config.json` to use a different config file. Environment variables override saved config values.

Do not set optional secrets to empty strings in environments that load `.env` literally; omit the variable when unused.

WBMCP does not throttle WhatsApp sends locally. WhatsApp Business Platform throughput, messaging tiers, and abuse controls are enforced by Meta. If Meta rejects a request for rate, policy, quality, or quota reasons, WBMCP returns the sanitized Graph API error.

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | yes | none | Meta Graph API bearer token. Never logged or exposed. |
| `WHATSAPP_PHONE_NUMBER_ID` | yes | none | Configured WhatsApp phone number ID. |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | yes | none | WhatsApp Business Account ID. |
| `WHATSAPP_GRAPH_API_VERSION` | no | `v24.0` | Pinned supported stable version in this package. |
| `WHATSAPP_APP_SECRET` | no | none | Optional reserved app secret for future webhook verification. Omit this variable unless you intentionally have a non-empty value. |
| `MCP_LOG_LEVEL` | no | `info` | `silent`, `error`, `warn`, `info`, or `debug`. Logs go to stderr. |
| `MCP_ENABLE_DANGEROUS_TOOLS` | no | `false` | Must be true for sends, deletes, template creation, and profile mutation. |
| `MCP_TRANSPORT` | no | `stdio` | `stdio` for local `npx` MCP clients, or `https` for hosted MCP deployments. Plaintext `http` is rejected. |
| `MCP_HTTPS_HOST` | hosted HTTPS only | `127.0.0.1` | Bind host for native HTTPS MCP transport. Ignored in stdio mode. |
| `MCP_HTTPS_PORT` | hosted HTTPS only | `3443` | Native HTTPS MCP transport port. Ignored in stdio mode. |
| `MCP_HTTPS_PATH` | hosted HTTPS only | `/mcp` | MCP Streamable HTTP endpoint path served over TLS. Ignored in stdio mode. |
| `MCP_HTTPS_AUTH_TOKEN` | for hosted HTTPS | none | Bearer token required for HTTPS transport; minimum 32 characters. Ignored in stdio mode. |
| `MCP_HTTPS_MAX_BODY_BYTES` | hosted HTTPS only | `1048576` | Maximum MCP HTTPS request body size. Ignored in stdio mode. |
| `MCP_HTTPS_MAX_SESSIONS` | hosted HTTPS only | `100` | Maximum active Streamable HTTP sessions. Ignored in stdio mode. |
| `MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS` | hosted HTTPS only | `900000` | Idle session TTL before automatic close. Ignored in stdio mode. |
| `MCP_HTTPS_CERT_FILE` | for hosted HTTPS | none | PEM certificate path for native HTTPS mode. Ignored in stdio mode. |
| `MCP_HTTPS_KEY_FILE` | for hosted HTTPS | none | PEM private key path for native HTTPS mode. Ignored in stdio mode. |

## MCP Client Configuration

### Codex

Primary Codex setup:

```bash
codex mcp add WBMCP -- npx -y wbmcp@latest
npx -y wbmcp@latest auth
```

One-command helper setup:

```bash
npx -y wbmcp@latest setup codex
```

The helper writes this Codex entry to `~/.codex/config.toml`:

```toml
[mcp_servers.WBMCP]
command = "npx"
args = ["-y", "wbmcp@latest"]
startup_timeout_sec = 20
```

`codex mcp login WBMCP` is not used for the local `npx` setup because this package runs as a stdio MCP server by default. Codex reserves `mcp login` for OAuth-capable Streamable HTTP servers.

### Other MCP clients

Use the package directly from any MCP client with `npx`:

```json
{
  "mcpServers": {
    "WBMCP": {
      "command": "npx",
      "args": ["-y", "wbmcp@latest"]
    }
  }
}
```

Run this once before starting the MCP client. The prompt prints where to get the required Meta values before asking for them:

```bash
npx -y wbmcp@latest auth
```

For local development from a cloned checkout, build first and point the client at the local compiled entry point:

```bash
npm run build
```

```json
{
  "mcpServers": {
    "WBMCP": {
      "command": "node",
      "args": ["/absolute/path/to/wbmcp/dist/index.js"]
    }
  }
}
```

### Hosted HTTPS mode

Most users should not set this for `npx` local MCP usage. Keep the default stdio transport unless WBMCP is intentionally deployed as a remote MCP endpoint for a hosted/team environment. Native HTTPS mode requires explicit TLS files and bearer authentication. Plaintext HTTP is not available in production builds.

```bash
MCP_TRANSPORT=https \
MCP_HTTPS_AUTH_TOKEN=replace-with-at-least-32-random-characters \
MCP_HTTPS_HOST=0.0.0.0 \
MCP_HTTPS_PORT=3443 \
MCP_HTTPS_CERT_FILE=/absolute/path/to/cert.pem \
MCP_HTTPS_KEY_FILE=/absolute/path/to/key.pem \
npm start
```

The HTTPS listener exposes only the configured MCP endpoint path, default `/mcp`, and requires `Authorization: Bearer <MCP_HTTPS_AUTH_TOKEN>`. HTTPS mode is not a user REST API; it is MCP Streamable HTTP over TLS.

When manually testing Streamable HTTP with curl or another generic HTTP client, include both accepted MCP response types:

```bash
curl -i https://127.0.0.1:3443/mcp \
  -H "Authorization: Bearer $MCP_HTTPS_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"manual-smoke","version":"0.0.0"}}}'
```

MCP clients normally set this header automatically.

## Local Development

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
```

## npm Packaging

The package exposes `wbmcp` as the main executable and keeps `whatsapp-business-mcp` as a compatibility alias through the `bin` field. `npm pack` and `npm publish` run `npm run build` first through the `prepack` script so the published tarball contains current compiled files under `dist/`.

Check the publish contents before release:

```bash
npm run pack:dry-run
```

Publish after the package name, metadata, security review, and release checklist are final. The package metadata points to `saravanaspar/WBMCP` as the canonical source repository.

```bash
npm publish
```

## Tools

See [docs/TOOLS.md](docs/TOOLS.md) for the complete implemented and deferred tool inventory.

Read/account:

- `whatsapp_health_check`
- `whatsapp_get_business_account`
- `whatsapp_get_phone_number`
- `whatsapp_list_phone_numbers`
- `whatsapp_get_business_profile`

Profile:

- `whatsapp_update_business_profile` dangerous

Messaging:

- `whatsapp_send_text_message` dangerous
- `whatsapp_send_template_message` dangerous
- `whatsapp_send_image_message` dangerous
- `whatsapp_send_document_message` dangerous
- `whatsapp_send_audio_message` dangerous
- `whatsapp_send_video_message` dangerous
- `whatsapp_send_location_message` dangerous
- `whatsapp_send_contact_message` dangerous
- `whatsapp_send_interactive_buttons` dangerous
- `whatsapp_send_interactive_list` dangerous
- `whatsapp_mark_message_as_read` dangerous

Templates:

- `whatsapp_list_message_templates`
- `whatsapp_get_message_template`
- `whatsapp_create_message_template` dangerous
- `whatsapp_delete_message_template` dangerous
- `whatsapp_validate_template_payload`

Media:

- `whatsapp_get_media`
- `whatsapp_delete_media` dangerous

Safety/admin:

- `whatsapp_redact_debug_payload`
- `whatsapp_validate_phone_number`
- `whatsapp_explain_tool_permissions`
- `whatsapp_list_available_tools`

## Action Confirmation Semantics

WBMCP returns the sanitized WhatsApp Graph API response for every action. A successful tool result means Meta accepted or applied the synchronous API request; it does not mean all downstream asynchronous effects have completed.

- Message send tools return the WhatsApp message ID from Meta when the send request is accepted. Delivery, read, and failure outcomes are asynchronous and require WhatsApp webhooks, which are intentionally not hosted by this MCP server in v1.
- Template create/delete, media delete, profile update, and mark-as-read tools return success only after the corresponding Graph API call succeeds. If Meta rejects the action, WBMCP returns a safe structured error.
- WBMCP does not hide Meta throttling, policy, quota, or quality errors. Those errors are returned as sanitized `WhatsAppApiError` results.

## Repository

- Source: <https://github.com/saravanaspar/WBMCP>
- Issues: <https://github.com/saravanaspar/WBMCP/issues>
- README: <https://github.com/saravanaspar/WBMCP#readme>

## Resources

- `whatsapp://account`
- `whatsapp://phone-number`
- `whatsapp://business-profile`
- `whatsapp://templates`

Resources are read-only and never include access tokens.

## Security Model

- Environment variables are validated at startup.
- stdio remains the default transport and is the intended local `npx` mode.
- HTTPS support is retained for explicit hosted MCP deployments and is MCP Streamable HTTP over native TLS only, not a user REST API.
- HTTPS transport requires bearer authentication.
- HTTPS requests are rejected when the body exceeds `MCP_HTTPS_MAX_BODY_BYTES`.
- HTTPS mode requires certificate and key files.
- Dangerous tools fail closed unless `MCP_ENABLE_DANGEROUS_TOOLS=true`.
- Tool inputs are validated with strict Zod schemas before Meta API calls.
- Recipient phone numbers must be E.164.
- Send tools allow one recipient per call only.
- Access tokens, Authorization headers, app secrets, full phone numbers, message bodies, and media URL query strings are redacted from logs and safe errors.
- Audit events are structured and emitted to stderr.
- Meta Graph API errors are wrapped in safe `WhatsAppApiError` objects.
- WhatsApp throughput, messaging tiers, and abuse controls are delegated to Meta; no local send throttling is applied.

## Limitations

- No webhook hosting.
- No inbound message processing.
- No dashboard or web app.
- No REST API for users.
- No campaign or bulk messaging features.
- No CRM integrations.
- No local media download.
- No media upload from local disk in v1 because a safe path policy is not defined yet.

## Roadmap

Future work is tracked in [docs/ROADMAP.md](docs/ROADMAP.md), with an actionable checklist in [docs/TODO.md](docs/TODO.md).
