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
      description: "Redacts secrets, phone numbers, message bodies, and sensitive URL query strings from a debug payload.",
      inputSchema: redactDebugPayloadInputSchema,
      inputShape: redactDebugPayloadShape,
      permission: "read",
      idempotent: true,
      execute: (input) => successResult({ redacted: redactSensitive(input.payload) })
    }),
    defineTool({
      name: "whatsapp_validate_phone_number",
      title: "Validate WhatsApp Phone Number",
      description: "Validates whether a phone number is in strict E.164 format and returns only a masked representation.",
      inputSchema: validatePhoneNumberInputSchema,
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
      description: "Explains read and dangerous WhatsApp MCP tool classifications.",
      inputSchema: explainToolPermissionsInputSchema,
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
      description: "Lists registered WhatsApp MCP tools and their permission classifications.",
      inputSchema: emptyInputSchema,
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: (_input, context) => successResult({ tools: context.toolCatalog })
    })
  ];
}
