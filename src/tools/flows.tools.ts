import {
  createFlowInputSchema,
  flowIdInputSchema,
  flowJsonInputSchema,
  listFlowsInputSchema,
  updateFlowInputSchema
} from "../schemas/flow.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createFlowTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_list_flows",
      title: "List WhatsApp Flows",
      description: "Lists WhatsApp Flows for the configured WhatsApp Business Account.",
      inputSchema: listFlowsInputSchema,
      group: "flows",
      inputShape: listFlowsInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.flows.listFlows(input))
    }),
    defineTool({
      name: "whatsapp_get_flow",
      title: "Get WhatsApp Flow",
      description: "Reads one WhatsApp Flow by ID.",
      inputSchema: flowIdInputSchema,
      group: "flows",
      inputShape: flowIdInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.flows.getFlow(input.flow_id))
    }),
    defineTool({
      name: "whatsapp_create_flow",
      title: "Create WhatsApp Flow",
      description: "Creates a WhatsApp Flow. Requires dangerous tools to be enabled.",
      inputSchema: createFlowInputSchema,
      group: "flows",
      inputShape: createFlowInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.flows.createFlow(input))
    }),
    defineTool({
      name: "whatsapp_update_flow",
      title: "Update WhatsApp Flow",
      description: "Updates WhatsApp Flow metadata. Requires dangerous tools to be enabled.",
      inputSchema: updateFlowInputSchema,
      group: "flows",
      inputShape: updateFlowInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.flows.updateFlow(input))
    }),
    defineTool({
      name: "whatsapp_update_flow_json",
      title: "Update WhatsApp Flow JSON",
      description: "Updates a WhatsApp Flow JSON asset. Requires dangerous tools to be enabled.",
      inputSchema: flowJsonInputSchema,
      group: "flows",
      inputShape: flowJsonInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.flows.updateFlowJson(input))
    }),
    defineTool({
      name: "whatsapp_publish_flow",
      title: "Publish WhatsApp Flow",
      description: "Publishes one WhatsApp Flow. Requires dangerous tools to be enabled.",
      inputSchema: flowIdInputSchema,
      group: "flows",
      inputShape: flowIdInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.flows.publishFlow(input.flow_id))
    }),
    defineTool({
      name: "whatsapp_deprecate_flow",
      title: "Deprecate WhatsApp Flow",
      description: "Deprecates one WhatsApp Flow. Requires dangerous tools to be enabled.",
      inputSchema: flowIdInputSchema,
      group: "flows",
      inputShape: flowIdInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.flows.deprecateFlow(input.flow_id))
    }),
    defineTool({
      name: "whatsapp_delete_flow",
      title: "Delete WhatsApp Flow",
      description: "Deletes one WhatsApp Flow. Requires dangerous tools to be enabled.",
      inputSchema: flowIdInputSchema,
      group: "flows",
      inputShape: flowIdInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.flows.deleteFlow(input.flow_id))
    })
  ];
}
