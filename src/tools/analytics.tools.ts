import { analyticsInputSchema } from "../schemas/analytics.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createAnalyticsTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_get_conversation_analytics",
      title: "Get WhatsApp Conversation Analytics",
      description: "Reads WhatsApp conversation analytics for the configured WhatsApp Business Account.",
      inputSchema: analyticsInputSchema,
      group: "analytics",
      inputShape: analyticsInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.analytics.getConversationAnalytics(input))
    }),
    defineTool({
      name: "whatsapp_get_template_analytics",
      title: "Get WhatsApp Template Analytics",
      description: "Reads WhatsApp template analytics for the configured WhatsApp Business Account.",
      inputSchema: analyticsInputSchema,
      group: "analytics",
      inputShape: analyticsInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.analytics.getTemplateAnalytics(input))
    })
  ];
}
