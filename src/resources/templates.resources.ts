import type { ToolContext } from "../tools/types.js";
import type { ResourceDefinition } from "./types.js";

export function createTemplateResources(): ResourceDefinition[] {
  return [
    {
      name: "whatsapp_templates",
      uri: "whatsapp://templates",
      title: "WhatsApp Message Templates",
      description: "Read-only list of WhatsApp message templates.",
      read: async (context: ToolContext) => context.services.templates.listTemplates({ limit: 25 })
    }
  ];
}
