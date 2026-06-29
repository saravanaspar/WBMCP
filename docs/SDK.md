# WBMCP SDK

WBMCP can be used in two ways:

1. as an MCP server/CLI for AI clients
2. as an importable TypeScript SDK for application backends

The SDK reuses the same tool registry, validation schemas, dangerous-tool gate, audit logger, and Graph API client used by the MCP server. If a new MCP tool is registered in WBMCP, it should also be exposed through `client.tools.<tool_name>`.

## Install

```bash
npm install wbmcp
```

## Create a client

```ts
import { createWhatsAppBusinessClient } from "wbmcp/sdk";

const whatsapp = createWhatsAppBusinessClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
  graphApiVersion: "v24.0",
  enableDangerousTools: true,
  requireConfirmation: false,
  readOnly: false
});
```

SDK configuration is passed directly as values, so SaaS backends can create one client per tenant/account without relying on `~/.config/wbmcp/config.json`.

## Convenience namespaces

```ts
await whatsapp.account.healthCheck();

await whatsapp.messages.sendText({
  recipient_phone_number: "+15551234567",
  message_body: "Hello from WBMCP SDK"
});

await whatsapp.templates.listMessageTemplates({ limit: 25 });

await whatsapp.safety.validatePhoneNumber({
  phone_number: "+15551234567"
});
```

Convenience namespace methods unwrap successful tool responses and throw `WhatsAppSdkToolError` for failed tool responses.

## One-to-one MCP tool methods

Every MCP tool is also exposed by its exact tool name under `client.tools`:

```ts
const result = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Hello from the exact MCP tool wrapper"
});

if (!result.ok) {
  console.error(result.error);
}
```

These methods return the same structured payload shape used by MCP tools:

```ts
type ToolPayload =
  | { ok: true; data: JsonValue; meta?: JsonObject }
  | { ok: false; error: JsonObject; meta?: JsonObject };
```

## Dry-run previews

Send tools support `dryRun: true`. A dry run validates input and returns a preview without calling Meta:

```ts
const preview = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Hello from preview mode",
  dryRun: true
});

console.log(preview);
// {
//   ok: true,
//   data: { dryRun: true, wouldSend: { type: "text", to: "+15551234567", ... } },
//   meta: { mode: "dry_run" }
// }
```

## Confirmation mode

Set `requireConfirmation: true` to require `confirm: true` for dangerous tools. Calls without confirmation return a structured `confirmation_required` failure and do not call Meta.

```ts
const whatsapp = createWhatsAppBusinessClient({
  accessToken,
  phoneNumberId,
  businessAccountId,
  enableDangerousTools: true,
  requireConfirmation: true
});

const blocked = await whatsapp.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "Needs approval first"
});

const sent = await whatsapp.messages.sendText({
  recipient_phone_number: "+15551234567",
  message_body: "Approved message",
  confirm: true
});
```

## Read-only mode

Set `readOnly: true` to block all dangerous tools while keeping read and safety tools available:

```ts
const safeClient = createWhatsAppBusinessClient({
  accessToken,
  phoneNumberId,
  businessAccountId,
  enableDangerousTools: true,
  readOnly: true
});
```

## Dangerous tools

Tools that send messages, delete media/templates, or update externally visible state are disabled unless `enableDangerousTools` is true.

```ts
const safeClient = createWhatsAppBusinessClient({
  accessToken,
  phoneNumberId,
  businessAccountId
});

const blocked = await safeClient.tools.whatsapp_send_text_message({
  recipient_phone_number: "+15551234567",
  message_body: "This will not send"
});

console.log(blocked.ok); // false
```

## Normalized errors

Tool failures include normalized `error.code` values so agents and host apps can branch predictably:

```ts
if (!result.ok && result.error.code === "rate_limited") {
  // wait for result.error.retry_after_seconds, then retry if appropriate
}
```

Common codes include `invalid_credentials`, `permission_denied`, `rate_limited`, `network_timeout`, `template_not_found`, `template_rejected`, `invalid_phone_number`, `outside_customer_service_window`, `media_upload_failed`, `dangerous_tool_disabled`, `read_only_mode_enabled`, and `confirmation_required`.

## Dynamic tool invocation

Use `callTool` when the tool name is chosen at runtime:

```ts
const result = await whatsapp.callTool("whatsapp_validate_phone_number", {
  phone_number: "+15551234567"
});
```

Use `callToolData` to unwrap success or throw on failure:

```ts
const data = await whatsapp.callToolData("whatsapp_get_business_account", {});
```

## Tool catalog and prompt snippets

```ts
const catalog = whatsapp.listTools();
const promptSnippets = await whatsapp.safety.getPromptSnippets();
```

The catalog includes group, permission, enabled status, confirmation requirement, and dry-run support for each MCP tool.

## Test hooks

The SDK accepts the same runtime hooks as the MCP server internals:

```ts
const whatsapp = createWhatsAppBusinessClient(config, {
  fetchFn: mockFetch,
  timeoutMs: 10_000,
  maxRetries: 1
});
```

This makes it straightforward to use WBMCP from another project, including a multi-tenant CRM, while still injecting a custom fetch implementation for tests.
