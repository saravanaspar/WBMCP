import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DangerousToolDisabledError } from "../security/dangerousTools.js";
import { requiresDangerousTools } from "../security/permissions.js";
import { redactSensitive } from "../security/redact.js";
import { isJsonObject } from "../whatsapp/types.js";
import { createAccountTools } from "../tools/account.tools.js";
import { createMediaTools } from "../tools/media.tools.js";
import { createMessageTools } from "../tools/messages.tools.js";
import { createProfileTools } from "../tools/profile.tools.js";
import { createSafetyTools } from "../tools/safety.tools.js";
import { createTemplateTools } from "../tools/templates.tools.js";
import { errorResult } from "../tools/toolResult.js";
import type { ToolCatalogEntry, ToolContext, ToolDefinition } from "../tools/types.js";

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
  enableDangerousTools: boolean
): ToolCatalogEntry[] {
  return definitions.map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    permission: tool.permission,
    dangerous: requiresDangerousTools(tool.permission),
    enabled: !requiresDangerousTools(tool.permission) || enableDangerousTools
  }));
}

export function registerTools(server: McpServer, context: ToolContext): ToolDefinition[] {
  const definitions = createToolDefinitions();
  context.toolCatalog = createToolCatalog(definitions, context.config.enableDangerousTools);

  for (const tool of definitions) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputShape,
        annotations: {
          readOnlyHint: tool.permission === "read",
          destructiveHint: tool.permission === "dangerous",
          idempotentHint: tool.idempotent ?? tool.permission === "read",
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

  if (requiresDangerousTools(tool.permission) && !context.config.enableDangerousTools) {
    context.auditLogger.emit({
      toolName: tool.name,
      permission: tool.permission,
      outcome: "blocked",
      metadata: { reason: "dangerous_tools_disabled" }
    });
    return errorResult(new DangerousToolDisabledError(tool.name));
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
