#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { runCli } from "./cli/main.js";
import { redactSensitive } from "./security/redact.js";

export { runCli, runConfiguredServer } from "./cli/main.js";
export { createServer } from "./server/createServer.js";
export { createToolContext, type ToolContextOptions } from "./server/context.js";
export { createToolDefinitions, invokeTool, createToolCatalog } from "./server/registerTools.js";
export {
  createWhatsAppBusinessClient,
  WhatsAppBusinessClient,
  WhatsAppSdkToolError,
  type EmptyInput,
  type ExplainToolPermissionsInput,
  type RedactDebugPayloadInput,
  type ValidatePhoneNumberInput,
  type WhatsAppBusinessClientConfig,
  type WhatsAppBusinessClientOptions,
  type WhatsAppSdkToolInputs,
  type WhatsAppSdkToolMethods,
  type WhatsAppToolName
} from "./sdk/client.js";
export { GraphClient, type GraphClientOptions, type RequestOptions } from "./whatsapp/graphClient.js";
export { WhatsAppApiError, type WhatsAppApiErrorOptions } from "./whatsapp/errors.js";
export type { JsonObject, JsonPrimitive, JsonValue, GraphPage, SendMessageResponse } from "./whatsapp/types.js";
export type { McpToolResult, ToolFailure, ToolPayload, ToolSuccess } from "./tools/toolResult.js";
export type { ToolCatalogEntry, ToolContext, ToolDefinition, ToolServices } from "./tools/types.js";

if (isDirectCliInvocation(import.meta.url, process.argv[1])) {
  try {
    await runCli();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ error: redactSensitive(message) }));
    process.exitCode = 1;
  }
}

function isDirectCliInvocation(moduleUrl: string, argvPath: string | undefined): boolean {
  if (argvPath === undefined) {
    return false;
  }

  const directUrl = pathToFileURL(argvPath).href;
  if (moduleUrl === directUrl) {
    return true;
  }

  try {
    return moduleUrl === pathToFileURL(realpathSync(argvPath)).href;
  } catch {
    return false;
  }
}
