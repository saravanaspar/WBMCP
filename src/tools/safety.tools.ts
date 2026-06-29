import { z } from "zod";
import { emptyInputSchema } from "../schemas/common.schemas.js";
import { PERMISSION_EXPLANATIONS } from "../security/permissions.js";
import { redactSensitive } from "../security/redact.js";
import { isE164PhoneNumber, maskPhoneNumber } from "../whatsapp/validators.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

const redactDebugPayloadShape = {
  payload: z.unknown()
};

const redactDebugPayloadInputSchema = z.object(redactDebugPayloadShape).strict();

const validatePhoneNumberShape = {
  phone_number: z.string().trim()
};

const validatePhoneNumberInputSchema = z.object(validatePhoneNumberShape).strict();

const explainToolPermissionsShape = {
  tool_name: z.string().trim().min(1).optional()
};

const explainToolPermissionsInputSchema = z.object(explainToolPermissionsShape).strict();

export function createSafetyTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_redact_debug_payload",
      title: "Redact WhatsApp Debug Payload",
      description:
        "Redacts tokens, phone numbers, message bodies, and sensitive URL query strings from a debug payload before sharing logs with humans or AI agents.",
      inputSchema: redactDebugPayloadInputSchema,
      group: "safety",
      inputShape: redactDebugPayloadShape,
      permission: "read",
      idempotent: true,
      execute: (input) => successResult({ redacted: redactSensitive(input.payload) })
    }),
    defineTool({
      name: "whatsapp_validate_phone_number",
      title: "Validate WhatsApp Phone Number",
      description: "Locally validates strict E.164 phone number format and returns only a masked representation.",
      inputSchema: validatePhoneNumberInputSchema,
      group: "safety",
      inputShape: validatePhoneNumberShape,
      permission: "read",
      idempotent: true,
      execute: (input) =>
        successResult({
          valid: isE164PhoneNumber(input.phone_number),
          masked: maskPhoneNumber(input.phone_number)
        })
    }),
    defineTool({
      name: "whatsapp_explain_tool_permissions",
      title: "Explain WhatsApp Tool Permissions",
      description:
        "Explains read versus dangerous WhatsApp MCP tool classifications, including whether a tool is enabled, requires confirmation, or supports dry-run preview.",
      inputSchema: explainToolPermissionsInputSchema,
      group: "safety",
      inputShape: explainToolPermissionsShape,
      permission: "read",
      idempotent: true,
      execute: (input, context) => {
        const tools = input.tool_name
          ? context.toolCatalog.filter((tool) => tool.name === input.tool_name)
          : context.toolCatalog;
        return successResult({
          permissions: PERMISSION_EXPLANATIONS,
          tools
        });
      }
    }),
    defineTool({
      name: "whatsapp_list_available_tools",
      title: "List WhatsApp MCP Tools",
      description:
        "Lists registered WhatsApp MCP tools with group, permission, read-only status, enabled status, confirmation requirement, and dry-run support.",
      inputSchema: emptyInputSchema,
      group: "safety",
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: (_input, context) => successResult({ tools: context.toolCatalog })
    }),
    defineTool({
      name: "whatsapp_get_prompt_snippets",
      title: "Get WhatsApp MCP Prompt Snippets",
      description:
        "Returns recommended system-prompt snippets that help AI agents use WBMCP safely with previews, confirmations, and template fallback behavior.",
      inputSchema: emptyInputSchema,
      group: "safety",
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: () =>
        successResult({
          snippets: [
            {
              name: "safe_preview_first",
              text:
                "Before sending any WhatsApp message, call the send tool with dryRun: true and show the preview to the operator unless they already gave explicit approval."
            },
            {
              name: "dangerous_confirmation",
              text:
                "For tools that send, delete, register, or update externally visible WhatsApp state, only pass confirm: true after explicit operator approval."
            },
            {
              name: "cold_contact_template",
              text:
                "If a contact may be outside the 24-hour customer-service window, prefer an approved template message instead of a free-form text message."
            },
            {
              name: "protect_sensitive_data",
              text:
                "Never reveal access tokens, app secrets, full phone numbers, or raw webhook payloads in user-facing output. Use the redaction tool before sharing diagnostics."
            }
          ]
        })
    })
  ];
}
