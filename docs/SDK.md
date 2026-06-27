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
  enableDangerousTools: true
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
  | { ok: false; error: JsonObject };
```

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
