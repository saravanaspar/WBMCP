import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createDangerousToolDisabledError } from "../security/dangerousTools.js";
import { requiresDangerousTools } from "../security/permissions.js";
import { redactSensitive } from "../security/redact.js";
import { getToolControls, ReadOnlyToolBlockedError, ToolConfirmationRequiredError } from "../security/toolGuards.js";
import { isJsonObject } from "../whatsapp/types.js";
import { createAccountTools } from "../tools/account.tools.js";
import { createMediaTools } from "../tools/media.tools.js";
import { createMessageTools } from "../tools/messages.tools.js";
import { createProfileTools } from "../tools/profile.tools.js";
import { createSafetyTools } from "../tools/safety.tools.js";
import { createTemplateTools } from "../tools/templates.tools.js";
import { errorResult } from "../tools/toolResult.js";
import { isToolReadOnly, type ToolCatalogEntry, type ToolContext, type ToolDefinition } from "../tools/types.js";

export function createToolDefinitions(): ToolDefinition[] {
  return [
    ...createAccountTools(),
    ...createProfileTools(),
    ...createMessageTools(),
    ...createTemplateTools(),
    ...createMediaTools(),
    ...createSafetyTools()
  ];
}

export function createToolCatalog(
  definitions: readonly ToolDefinition[],
  options: { readonly enableDangerousTools: boolean; readonly readOnly?: boolean; readonly requireConfirmation?: boolean } | boolean
): ToolCatalogEntry[] {
  const catalogOptions =
    typeof options === "boolean"
      ? { enableDangerousTools: options, readOnly: false, requireConfirmation: false }
      : { readOnly: false, requireConfirmation: false, ...options };

  return definitions.map((tool) => {
    const dangerous = requiresDangerousTools(tool.permission);
    const enabled = !dangerous || (catalogOptions.enableDangerousTools && !catalogOptions.readOnly);
    return {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      group: tool.group,
      permission: tool.permission,
      dangerous,
      readOnly: isToolReadOnly(tool),
      enabled,
      requiresDangerousToolsEnabled: dangerous,
      requiresConfirmation: dangerous && catalogOptions.requireConfirmation,
      dryRunSupported: tool.supportsDryRun === true
    };
  });
}

export function registerTools(server: McpServer, context: ToolContext): ToolDefinition[] {
  const definitions = createToolDefinitions();
  context.toolCatalog = createToolCatalog(definitions, context.config);

  for (const tool of definitions) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputShape,
        annotations: {
          readOnlyHint: isToolReadOnly(tool),
          destructiveHint: tool.permission === "dangerous",
          idempotentHint: tool.idempotent ?? isToolReadOnly(tool),
          openWorldHint: true
        }
      },
      async (args) => invokeTool(tool, args, context)
    );
  }

  return definitions;
}

export async function invokeTool(
  tool: ToolDefinition,
  args: unknown,
  context: ToolContext
): Promise<ReturnType<ToolDefinition["execute"]> extends Promise<infer TResult> ? TResult : never> {
  const parsed = tool.inputSchema.safeParse(args);
  if (!parsed.success) {
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: "failure",
      metadata: { reason: "validation_failed" }
    });
    return errorResult(parsed.error);
  }

  const redactedInput = redactSensitive(parsed.data);
  context.auditLogger.emit({
    toolName: tool.name,
    permission: tool.permission,
    outcome: "attempt",
    metadata: isJsonObject(redactedInput) ? redactedInput : { input: String(redactedInput) }
  });

  const dangerous = requiresDangerousTools(tool.permission);
  const controls = getToolControls(parsed.data);

  if (dangerous && context.config.readOnly) {
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: "blocked",
      metadata: { reason: "read_only_mode" }
    });
    return errorResult(new ReadOnlyToolBlockedError(tool.name));
  }

  if (dangerous && !context.config.enableDangerousTools) {
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: "blocked",
      metadata: { reason: "dangerous_tools_disabled" }
    });
    return errorResult(createDangerousToolDisabledError(tool.name));
  }

  if (dangerous && context.config.requireConfirmation && !controls.confirm && !controls.dryRun) {
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: "blocked",
      metadata: { reason: "confirmation_required" }
    });
    return errorResult(new ToolConfirmationRequiredError(tool.name, confirmationMessage(tool.name)));
  }

  try {
    const result = await tool.execute(parsed.data, context);
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: result.isError ? "failure" : "success"
    });
    return result;
  } catch (error) {
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: "failure"
    });
    return errorResult(error);
  }
}

function confirmationMessage(toolName: string): string {
  return `${toolName} can send messages, delete data, or change externally visible WhatsApp state. Re-run with confirm: true only after the operator explicitly approves this action.`;
}
