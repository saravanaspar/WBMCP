# WBMCP SDK

WBMCP can be used in two ways:

1. as an MCP server/CLI for MCP clients
2. as an importable TypeScript SDK for your own backend

For a web app AI chat, use the SDK on your server. Your browser should talk to your backend, your backend should run the AI/tool-calling loop, and WBMCP should call Meta Graph API from that backend.

Do not expose WhatsApp credentials to browser JavaScript.

## Install

```bash
npm install wbmcp
```

## Required Secrets

Store these in your backend secret manager or server environment:

```bash
WHATSAPP_ACCESS_TOKEN=replace-with-your-meta-system-user-token
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012346
```

Optional:

```bash
WHATSAPP_GRAPH_API_VERSION=v24.0
WHATSAPP_APP_SECRET=replace-with-your-meta-app-secret
```

`WHATSAPP_APP_SECRET` is optional, but recommended. When configured, WBMCP adds Meta Graph API `appsecret_proof` to outbound Graph API calls.

For production, use a Meta System User token with the least permissions your tools need. Common permissions are:

```text
whatsapp_business_messaging
whatsapp_business_management
```

## Create A Client

```ts
import { createWhatsAppBusinessClient } from "wbmcp/sdk";

export const whatsapp = createWhatsAppBusinessClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
  graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION ?? "v24.0",
  appSecret: process.env.WHATSAPP_APP_SECRET,
  enableDangerousTools: true,
  requireConfirmation: true,
  readOnly: false,
  logLevel: "info"
});
```

SDK configuration is passed directly as values, so SaaS backends can create one client per tenant/account without relying on `~/.config/wbmcp/config.json`.

## Web App AI Chat Pattern

The recommended shape is:

1. Browser sends user chat messages to your backend.
2. Backend loads tenant-specific WhatsApp credentials.
3. Backend creates a WBMCP SDK client.
4. Backend passes WBMCP tool descriptors to your AI model.
5. Model selects a tool and arguments.
6. Backend calls `whatsapp.callTool(...)`.
7. Backend returns a safe result to the browser.

Minimal server-side wiring:

```ts
import {
  createWhatsAppBusinessClient,
  type WhatsAppToolName,
  type WhatsAppSdkToolInputs
} from "wbmcp/sdk";

const whatsapp = createWhatsAppBusinessClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
  appSecret: process.env.WHATSAPP_APP_SECRET,
  enableDangerousTools: true,
  requireConfirmation: true
});

const toolsForAgent = whatsapp.agent.tools({
  descriptions: "compact",
  includeDangerous: true,
  enabledOnly: true
});

const systemPrompt = whatsapp.agent.systemPrompt();

export async function callWhatsAppTool(
  toolName: WhatsAppToolName,
  args: WhatsAppSdkToolInputs[WhatsAppToolName]
) {
  return await whatsapp.callTool(toolName, args);
}
```

`toolsForAgent` is framework-neutral metadata. Convert it to your model provider's tool/function format in your application.

Each descriptor includes:

```ts
{
  name: string;
  description: string;
  permission: "read" | "dangerous";
  group: string;
  enabled: boolean;
  dangerous: boolean;
  dryRunSupported: boolean;
}
```

## Agent Safety Defaults

Recommended production settings for AI chat:

```ts
createWhatsAppBusinessClient({
  accessToken,
  phoneNumberId,
  businessAccountId,
  appSecret,
  enableDangerousTools: true,
  requireConfirmation: true
});
```

With `requireConfirmation: true`, dangerous tool calls return `confirmation_required` until the backend calls again with `confirm: true`. This lets your UI show a preview and require user approval before sending, deleting, publishing, registering, or updating WhatsApp state.

For read-only screens or testing:

```ts
createWhatsAppBusinessClient({
  accessToken,
  phoneNumberId,
  businessAccountId,
  readOnly: true
});
```

## Calling Tools

Every MCP tool is exposed by exact name under `client.tools`:

```ts
const result = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Hello from WBMCP",
  dryRun: true
});

if (!result.ok) {
  console.error(result.error);
}
```

Dynamic invocation:

```ts
const result = await whatsapp.callTool("whatsapp_validate_phone_number", {
  phone_number: "+15551234567"
});
```

Non-throwing dynamic alias:

```ts
const result = await whatsapp.tryCallTool("whatsapp_get_business_account", {});
```

Convenience namespace methods unwrap success and throw `WhatsAppSdkToolError` on failure:

```ts
await whatsapp.account.healthCheck();

await whatsapp.messages.sendText({
  recipient_phone_number: "+15551234567",
  message_body: "Approved message",
  confirm: true
});

await whatsapp.templates.listMessageTemplates({ limit: 25 });
```

## Result Shape

One-to-one tool calls return:

```ts
type ToolPayload =
  | { ok: true; data: JsonValue; meta?: JsonObject }
  | { ok: false; error: JsonObject; meta?: JsonObject };
```

Common error codes include:

```text
invalid_credentials
permission_denied
rate_limited
network_timeout
template_not_found
template_rejected
invalid_phone_number
outside_customer_service_window
media_upload_failed
dangerous_tool_disabled
read_only_mode_enabled
confirmation_required
```

## Dry Run And Confirmation

Send tools support `dryRun: true`. A dry run validates input and returns a preview without calling Meta:

```ts
const preview = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Hello from preview mode",
  dryRun: true
});
```

When confirmation mode is enabled:

```ts
const blocked = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Needs approval first"
});

// blocked.ok === false
// blocked.error.code === "confirmation_required"

const sent = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Approved by operator",
  confirm: true
});
```

## Tool Input Values

### Global SDK Config

| Value | Required | Purpose |
| --- | --- | --- |
| `accessToken` | yes | Meta Graph API access token |
| `phoneNumberId` | yes | Default WhatsApp phone number ID used by message/profile/phone tools |
| `businessAccountId` | yes | Default WABA ID used by templates, catalogs, Flows, webhooks, analytics |
| `graphApiVersion` | no | Defaults to the package default, currently `v24.0` |
| `appSecret` | no | Adds Graph API `appsecret_proof` |
| `enableDangerousTools` | no | Enables send/create/update/delete/register/publish tools |
| `requireConfirmation` | no | Requires `confirm: true` for dangerous tools |
| `readOnly` | no | Blocks dangerous tools even if enabled |

### Common Tool Fields

| Field | Used by | Notes |
| --- | --- | --- |
| `confirm` | dangerous tools | Required when `requireConfirmation` is true |
| `dryRun` | send tools | Preview without calling Meta |
| `limit`, `after` | list tools | Pagination |
| `recipient_phone_number` | send tools | Strict E.164, for example `+15551234567` |
| `client_message_id` | send tools | Optional callback/idempotency hint stored in Meta callback data |

### Account And Profile

Most account reads use `{}`. Phone listing accepts:

```ts
{ limit?: number; after?: string }
```

Profile update fields:

```ts
{
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  websites?: string[];
  vertical?: string;
  confirm?: boolean;
}
```

### Messages

Text:

```ts
{
  recipient_phone_number: "+15551234567";
  message_body: "Message text";
  preview_url?: boolean;
  dryRun?: boolean;
  confirm?: boolean;
}
```

Template:

```ts
{
  recipient_phone_number: "+15551234567";
  template_name: "order_update";
  language_code: "en_US";
  components?: unknown[];
  dryRun?: boolean;
  confirm?: boolean;
}
```

Media messages require exactly one of `media_id` or `media_url`:

```ts
{
  recipient_phone_number: "+15551234567";
  media_id?: string;
  media_url?: string;
  caption?: string;
  filename?: string;
  dryRun?: boolean;
  confirm?: boolean;
}
```

Reaction:

```ts
{
  recipient_phone_number: "+15551234567";
  message_id: "wamid...";
  emoji: "\u{1F44D}";
  dryRun?: boolean;
  confirm?: boolean;
}
```

Product message:

```ts
{
  recipient_phone_number: "+15551234567";
  catalog_id: "catalog-id";
  product_retailer_id: "sku-123";
  body_text?: "Optional text";
  dryRun?: boolean;
  confirm?: boolean;
}
```

Flow message:

```ts
{
  recipient_phone_number: "+15551234567";
  flow_id: "flow-id";
  flow_token: "token-from-your-app";
  flow_cta: "Start";
  body_text: "Open this flow";
  dryRun?: boolean;
  confirm?: boolean;
}
```

### Templates

List:

```ts
{
  limit?: number;
  after?: string;
  status?: "APPROVED" | "PENDING" | "REJECTED" | "PAUSED" | "DISABLED";
  category?: "AUTHENTICATION" | "MARKETING" | "UTILITY";
  name?: string;
}
```

Get/delete:

```ts
{ template_id: string }
{ name: string; template_id?: string; confirm?: boolean }
```

Create:

```ts
{
  name: string;
  category: "AUTHENTICATION" | "MARKETING" | "UTILITY";
  language: "en_US";
  components: unknown[];
  confirm?: boolean;
}
```

### Media

```ts
{ media_id: string; confirm?: boolean }
```

Current media tools read metadata and delete media. Local upload/download-to-disk are intentionally not implemented yet.

### Commerce

Catalogs:

```ts
{ business_id?: string; limit?: number; after?: string }
{ catalog_id: string }
```

Products:

```ts
{ catalog_id: string; limit?: number; after?: string }
{ product_id: string; confirm?: boolean }
```

Create product:

```ts
{
  catalog_id: string;
  retailer_id: string;
  name: string;
  price: number;
  currency: "USD";
  image_url: "https://example.com/image.jpg";
  description?: string;
  url?: string;
  brand?: string;
  confirm?: boolean;
}
```

### Phone Lifecycle

```ts
{ phone_number_id?: string; code_method: "SMS" | "VOICE"; locale?: "en_US"; confirm?: boolean }
{ phone_number_id?: string; code: string; confirm?: boolean }
{ phone_number_id?: string; pin: "123456"; confirm?: boolean }
{ phone_number_id?: string; confirm?: boolean }
```

If `phone_number_id` is omitted, the SDK uses the configured `phoneNumberId`.

### Webhook Subscriptions

```ts
{}
{ confirm: true }
```

These tools manage app subscription state on the WABA. They do not host a webhook receiver.

### Flows

```ts
{ limit?: number; after?: string; status?: "DRAFT" | "PUBLISHED" | "DEPRECATED" | "BLOCKED" | "THROTTLED" }
{ flow_id: string; confirm?: boolean }
{ name: string; categories: string[]; endpoint_uri?: string; confirm?: boolean }
{ flow_id: string; flow_json: Record<string, unknown>; confirm?: boolean }
```

### Analytics

```ts
{
  start_date: "2026-01-01";
  end_date: "2026-01-31";
  granularity?: "DAY" | "MONTH";
}
```

### Safety

```ts
{ phone_number: "+15551234567" }
{ payload: unknown }
{ tool_name?: string }
{}
```

## Current Tool Count

The SDK currently exposes the same **61 tools** as the MCP server. Use:

```ts
const catalog = whatsapp.listTools();
```

or:

```ts
const agentTools = whatsapp.agent.tools({ descriptions: "compact" });
```

## Test Hooks

The SDK accepts runtime hooks:

```ts
const whatsapp = createWhatsAppBusinessClient(config, {
  fetchFn: mockFetch,
  timeoutMs: 10_000,
  maxRetries: 1
});
```

`maxRetries` only retries safe GET requests. Message sends and mutations are not retried automatically.
