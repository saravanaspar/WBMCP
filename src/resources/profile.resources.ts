import type { ToolContext } from "../tools/types.js";
import type { ResourceDefinition } from "./types.js";

export function createProfileResources(): ResourceDefinition[] {
  return [
    {
      name: "whatsapp_business_profile",
      uri: "whatsapp://business-profile",
      title: "WhatsApp Business Profile",
      description: "Read-only WhatsApp Business profile fields.",
      read: async (context: ToolContext) => context.services.profile.getBusinessProfile()
    }
  ];
}
