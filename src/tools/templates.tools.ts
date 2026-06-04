import {
  createMessageTemplateInputSchema,
  deleteMessageTemplateInputSchema,
  getMessageTemplateInputSchema,
  listMessageTemplatesInputSchema,
  validateTemplatePayloadInputSchema
} from "../schemas/template.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createTemplateTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_list_message_templates",
      title: "List WhatsApp Message Templates",
      description: "Lists message templates for the configured WhatsApp Business Account.",
      inputSchema: listMessageTemplatesInputSchema,
      inputShape: listMessageTemplatesInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.templates.listTemplates(input))
    }),
    defineTool({
      name: "whatsapp_get_message_template",
      title: "Get WhatsApp Message Template",
      description: "Reads one WhatsApp message template by template ID.",
      inputSchema: getMessageTemplateInputSchema,
      inputShape: getMessageTemplateInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.templates.getTemplate(input.template_id))
    }),
    defineTool({
      name: "whatsapp_create_message_template",
      title: "Create WhatsApp Message Template",
      description: "Creates a WhatsApp message template for Meta review. Requires dangerous tools to be enabled.",
      inputSchema: createMessageTemplateInputSchema,
      inputShape: createMessageTemplateInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.templates.createTemplate(input))
    }),
    defineTool({
      name: "whatsapp_delete_message_template",
      title: "Delete WhatsApp Message Template",
      description: "Deletes a WhatsApp message template by name and optional template ID. Requires dangerous tools to be enabled.",
      inputSchema: deleteMessageTemplateInputSchema,
      inputShape: deleteMessageTemplateInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.templates.deleteTemplate(input))
    }),
    defineTool({
      name: "whatsapp_validate_template_payload",
      title: "Validate WhatsApp Template Payload",
      description: "Locally validates a template send payload without sending a message or calling Meta.",
      inputSchema: validateTemplatePayloadInputSchema,
      inputShape: validateTemplatePayloadInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: (input, context) => successResult(context.services.templates.validatePayload(input))
    })
  ];
}
