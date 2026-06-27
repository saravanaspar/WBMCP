# WBMCP

**WBMCP** is an MCP server for the official WhatsApp Business Cloud API. It lets MCP-compatible AI clients use WhatsApp Business tools for sending messages, managing templates, working with media, reading account details, and updating business profile information.

- GitHub: https://github.com/saravanaspar/WBMCP
- npm: https://www.npmjs.com/package/wbmcp

```bash
npx -y wbmcp@latest setup
```

## Important note about WhatsApp Cloud API

WBMCP uses the **WhatsApp Business Cloud API**.

When you use the Cloud API for a WhatsApp Business number, do not expect the normal WhatsApp Business app or WhatsApp Web experience for that API-connected workflow. The API gives software access to the WhatsApp Business account, but it does not provide an inbox UI by itself.

If you want to receive customer messages, view conversations, and reply from a screen, you need one of these:

- your own SaaS or business app with a chat interface
- a third-party inbox/chat platform that accepts WhatsApp Business API credentials
- your own webhook receiver, message database, and reply UI

WBMCP is the AI/MCP tool layer. It can help an AI client perform WhatsApp Business API actions, but it is not a full inbox, CRM, support dashboard, or WhatsApp Business app replacement.

## What it can do

WBMCP exposes WhatsApp Business Cloud API actions as MCP tools.

Main capabilities:

- send text messages
- send template messages
- send image, document, audio, and video messages
- send location and contact messages
- send interactive button and list messages
- mark messages as read
- list and inspect message templates
- create and delete templates
- get and delete media
- get and update business profile information
- get WhatsApp Business account information
- list phone numbers
- validate phone numbers and template payloads
- expose read-only account resources to MCP clients

## What it does not do

WBMCP does not provide:

- WhatsApp Business app login
- WhatsApp Web login
- a customer inbox UI
- a team inbox
- conversation storage
- webhook hosting
- CRM features
- campaign or bulk messaging software
- a public REST API for users
- a way to bypass Meta or WhatsApp policy limits

If your product needs inbound messages and replies, build or use a chat interface that supports WhatsApp Business API credentials.

## Install

Run:

```bash
npx -y wbmcp@latest setup
```

The setup command saves credentials locally to:

```text
~/.config/wbmcp/config.json
```

After setup, MCP clients can start WBMCP with:

```bash
npx -y wbmcp@latest
```

## Setup

The setup wizard asks for:

1. WhatsApp access token
2. WhatsApp phone number ID
3. WhatsApp Business Account ID

You can get these from Meta:

- Meta for Developers: https://developers.facebook.com/apps/
- WhatsApp Cloud API guide: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- Production System User tokens: https://business.facebook.com/settings/system-users

For quick testing, use the temporary token shown in **WhatsApp > API Setup** inside your Meta app.

For production, use a permanent System User token with these permissions:

```text
whatsapp_business_messaging
whatsapp_business_management
```

Do not commit real tokens to GitHub.

## MCP client setup

WBMCP can be configured in two ways:

1. **Saved local config**: run `npx -y wbmcp@latest setup` once, then keep MCP client configs free of secrets. This is recommended for local development.
2. **MCP env config**: put WhatsApp credentials in the MCP client config `env` block. This is useful for CI, containers, hosted agents, or machines where you do not want to run the setup wizard.

WBMCP reads credentials from process environment variables first, then falls back to `~/.config/wbmcp/config.json`. So env values passed by an MCP client override saved setup values.

Required env values:

```text
WHATSAPP_ACCESS_TOKEN=your-meta-system-user-or-temporary-token
WHATSAPP_PHONE_NUMBER_ID=your-meta-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-meta-business-account-id
```

Common optional env values:

```text
WHATSAPP_GRAPH_API_VERSION=v24.0
MCP_ENABLE_DANGEROUS_TOOLS=false
MCP_LOG_LEVEL=info
WHATSAPP_APP_SECRET=your-meta-app-secret
```

`MCP_ENABLE_DANGEROUS_TOOLS=true` is required for tools that send, create, update, or delete data. Leave it `false` for read-only usage.

### OpenCode

Saved-config mode:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "WBMCP": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "wbmcp@latest"
      ],
      "enabled": true,
      "timeout": 15000
    }
  }
}
```

Env-config mode:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "WBMCP": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "wbmcp@latest"
      ],
      "enabled": true,
      "timeout": 15000,
      "env": {
        "WHATSAPP_ACCESS_TOKEN": "replace-with-your-access-token",
        "WHATSAPP_PHONE_NUMBER_ID": "replace-with-your-phone-number-id",
        "WHATSAPP_BUSINESS_ACCOUNT_ID": "replace-with-your-business-account-id",
        "WHATSAPP_GRAPH_API_VERSION": "v24.0",
        "MCP_ENABLE_DANGEROUS_TOOLS": "false"
      }
    }
  }
}
```

Then start OpenCode:

```bash
opencode
```

Example prompt:

```text
Use WBMCP and list the available WhatsApp tools.
```

Start with read-only checks before sending messages:

```text
Use WBMCP to get my WhatsApp Business account information.
```

### Codex CLI

Saved-config mode:

```bash
npx -y wbmcp@latest setup
codex mcp add WBMCP -- npx -y wbmcp@latest
```

Or let WBMCP update the Codex MCP config:

```bash
npx -y wbmcp@latest setup codex
```

Env-config mode for `~/.codex/config.toml`:

```toml
[mcp_servers.WBMCP]
command = "npx"
args = ["-y", "wbmcp@latest"]
startup_timeout_sec = 20

[mcp_servers.WBMCP.env]
WHATSAPP_ACCESS_TOKEN = "replace-with-your-access-token"
WHATSAPP_PHONE_NUMBER_ID = "replace-with-your-phone-number-id"
WHATSAPP_BUSINESS_ACCOUNT_ID = "replace-with-your-business-account-id"
WHATSAPP_GRAPH_API_VERSION = "v24.0"
MCP_ENABLE_DANGEROUS_TOOLS = "false"
```

The `setup codex` helper writes a clean command-based config that uses the saved WBMCP config file. If you prefer env-config mode, edit `~/.codex/config.toml` manually.

### Claude Desktop / Cursor-style clients

Saved-config mode:

```json
{
  "mcpServers": {
    "WBMCP": {
      "command": "npx",
      "args": [
        "-y",
        "wbmcp@latest"
      ]
    }
  }
}
```

Env-config mode:

```json
{
  "mcpServers": {
    "WBMCP": {
      "command": "npx",
      "args": [
        "-y",
        "wbmcp@latest"
      ],
      "env": {
        "WHATSAPP_ACCESS_TOKEN": "replace-with-your-access-token",
        "WHATSAPP_PHONE_NUMBER_ID": "replace-with-your-phone-number-id",
        "WHATSAPP_BUSINESS_ACCOUNT_ID": "replace-with-your-business-account-id",
        "WHATSAPP_GRAPH_API_VERSION": "v24.0",
        "MCP_ENABLE_DANGEROUS_TOOLS": "false"
      }
    }
  }
}
```

## SDK usage

WBMCP is also importable as a TypeScript SDK for backend applications that want to pass WhatsApp credentials directly instead of starting a local MCP server process.

```bash
npm install wbmcp
```

```ts
import { createWhatsAppBusinessClient } from "wbmcp/sdk";

const whatsapp = createWhatsAppBusinessClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
  graphApiVersion: "v24.0",
  enableDangerousTools: true
});

await whatsapp.messages.sendText({
  recipient_phone_number: "+15551234567",
  message_body: "Hello from WBMCP SDK"
});
```

Every MCP tool is exposed one-to-one under `client.tools.<tool_name>`, and typed convenience namespaces are available for `account`, `profile`, `messages`, `templates`, `media`, `contacts`, `phoneNumbers`, `analytics`, `safety`, and `registration`. See [`docs/SDK.md`](docs/SDK.md) for full details.

## Configuration

Saved local config is recommended for normal local usage. Environment variables are also supported and override saved config values.

Required:

```bash
WHATSAPP_ACCESS_TOKEN=replace-with-your-access-token
WHATSAPP_PHONE_NUMBER_ID=replace-with-your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=replace-with-your-business-account-id
```

Optional:

```bash
WHATSAPP_GRAPH_API_VERSION=v24.0
MCP_ENABLE_DANGEROUS_TOOLS=false
WHATSAPP_APP_SECRET=replace-with-your-app-secret
```

Default local transport:

```bash
MCP_TRANSPORT=stdio
```

Do not set optional secrets as empty strings. Omit unused optional variables.

## Dangerous tools

Read-only tools are available by default. Actions that send, delete, create, or mutate data are treated as dangerous tools.

Examples of dangerous actions:

- sending WhatsApp messages
- creating templates
- deleting templates
- deleting media
- updating business profile data
- marking messages as read

Enable dangerous tools only when needed:

```bash
MCP_ENABLE_DANGEROUS_TOOLS=true npx -y wbmcp@latest
```

Use these tools only with clear business authorization.

## Message confirmation

WBMCP returns Meta's synchronous Graph API response.

For send-message tools:

- success means Meta accepted the send request
- the response includes a WhatsApp message ID when Meta provides one
- success does not mean delivered
- success does not mean read

Delivery, read, and failed statuses are asynchronous webhook events. WBMCP does not host webhooks.

For template, media, profile, and mark-as-read actions:

- success means Meta accepted or applied the API request
- if Meta rejects the action, WBMCP returns a sanitized error
- WBMCP does not bypass Meta review, policy, quality, quota, or rate controls

## Receiving messages

To receive customer messages and reply from a UI, your application needs:

- WhatsApp webhook configuration in Meta
- a public webhook endpoint
- webhook verification and signature validation
- message storage
- conversation state
- a chat UI
- logic that decides when a human or AI should reply

WBMCP can be used for outbound AI actions in that system, but it is not the complete messaging backend.

## Hosted HTTPS mode

Most users should use the default local stdio mode.

Hosted HTTPS mode is only for deployments where a remote MCP client connects to a hosted WBMCP server. It requires TLS certificate files and bearer authentication.

Plain HTTP is not supported.

## Security

Do not expose WhatsApp credentials in logs, screenshots, GitHub issues, chat transcripts, or committed files.

Recommended controls:

- use least-privilege Meta System User tokens
- rotate tokens regularly
- keep `~/.config/wbmcp/config.json` private
- avoid storing secrets directly in MCP client config
- review dangerous tool calls before enabling them in production workflows

Report security issues through GitHub private advisories if available:

```text
https://github.com/saravanaspar/WBMCP/security/advisories
```

If private advisories are unavailable, open a minimal GitHub issue without secrets, tokens, customer data, phone numbers, or message contents.

## Development

Clone:

```bash
git clone https://github.com/saravanaspar/WBMCP.git
cd WBMCP
npm install
```

Run checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run locally:

```bash
node dist/index.js --help
node dist/index.js setup
node dist/index.js
```

Check package contents:

```bash
npm pack --dry-run
```

## Disclaimer

WBMCP is an independent project. It is not affiliated with, endorsed by, or sponsored by Meta, WhatsApp, OpenAI, Anthropic, OpenCode, Cursor, or any other AI client vendor.

Use the WhatsApp Business Cloud API according to Meta's platform terms, WhatsApp Business policies, and applicable laws.

## License

See [LICENSE](./LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

