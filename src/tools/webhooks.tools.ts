import { webhookAppControlInputSchema } from "../schemas/webhook.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createWebhookTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_list_subscribed_apps",
      title: "List WhatsApp Subscribed Apps",
      description: "Lists apps subscribed to the configured WhatsApp Business Account webhooks.",
      inputSchema: webhookAppControlInputSchema,
      group: "webhooks",
      inputShape: webhookAppControlInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (_input, context) => successResult(await context.services.webhooks.listSubscribedApps())
    }),
    defineTool({
      name: "whatsapp_subscribe_app",
      title: "Subscribe App To WhatsApp Webhooks",
      description: "Subscribes the current app to WhatsApp Business Account webhooks. Requires dangerous tools to be enabled.",
      inputSchema: webhookAppControlInputSchema,
      group: "webhooks",
      inputShape: webhookAppControlInputSchema.shape,
      permission: "dangerous",
      execute: async (_input, context) => successResult(await context.services.webhooks.subscribeApp())
    }),
    defineTool({
      name: "whatsapp_unsubscribe_app",
      title: "Unsubscribe App From WhatsApp Webhooks",
      description: "Unsubscribes the current app from WhatsApp Business Account webhooks. Requires dangerous tools to be enabled.",
      inputSchema: webhookAppControlInputSchema,
      group: "webhooks",
      inputShape: webhookAppControlInputSchema.shape,
      permission: "dangerous",
      execute: async (_input, context) => successResult(await context.services.webhooks.unsubscribeApp())
    })
  ];
}
