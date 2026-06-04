import type { ToolContext } from "../tools/types.js";
import type { ResourceDefinition } from "./types.js";

export function createAccountResources(): ResourceDefinition[] {
  return [
    {
      name: "whatsapp_account",
      uri: "whatsapp://account",
      title: "WhatsApp Business Account",
      description: "Read-only metadata for the configured WhatsApp Business Account.",
      read: async (context: ToolContext) => context.services.account.getBusinessAccount()
    },
    {
      name: "whatsapp_phone_number",
      uri: "whatsapp://phone-number",
      title: "WhatsApp Phone Number",
      description: "Read-only metadata for the configured WhatsApp Business phone number.",
      read: async (context: ToolContext) => context.services.phoneNumbers.getPhoneNumber()
    }
  ];
}
