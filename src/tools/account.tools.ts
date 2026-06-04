import { paginationInputSchema, emptyInputSchema } from "../schemas/common.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createAccountTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_health_check",
      title: "WhatsApp Health Check",
      description: "Checks configured WhatsApp Cloud API access by reading the configured phone number.",
      inputSchema: emptyInputSchema,
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (_input, context) => successResult(await context.services.account.healthCheck())
    }),
    defineTool({
      name: "whatsapp_get_business_account",
      title: "Get WhatsApp Business Account",
      description: "Reads metadata for the configured WhatsApp Business Account.",
      inputSchema: emptyInputSchema,
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (_input, context) => successResult(await context.services.account.getBusinessAccount())
    }),
    defineTool({
      name: "whatsapp_get_phone_number",
      title: "Get WhatsApp Phone Number",
      description: "Reads metadata for the configured WhatsApp Business phone number.",
      inputSchema: emptyInputSchema,
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (_input, context) => successResult(await context.services.phoneNumbers.getPhoneNumber())
    }),
    defineTool({
      name: "whatsapp_list_phone_numbers",
      title: "List WhatsApp Phone Numbers",
      description: "Lists phone numbers attached to the configured WhatsApp Business Account.",
      inputSchema: paginationInputSchema,
      inputShape: paginationInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) =>
        successResult(await context.services.phoneNumbers.listPhoneNumbers(input.limit, input.after))
    }),
    defineTool({
      name: "whatsapp_get_business_profile",
      title: "Get WhatsApp Business Profile",
      description: "Reads the configured WhatsApp Business profile.",
      inputSchema: emptyInputSchema,
      inputShape: emptyInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (_input, context) => successResult(await context.services.profile.getBusinessProfile())
    })
  ];
}
