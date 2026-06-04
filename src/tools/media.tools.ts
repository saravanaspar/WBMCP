import { mediaIdInputSchema } from "../schemas/media.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createMediaTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_get_media",
      title: "Get WhatsApp Media",
      description: "Reads WhatsApp media metadata by Meta media ID. This does not download media to disk.",
      inputSchema: mediaIdInputSchema,
      inputShape: mediaIdInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.media.getMedia(input.media_id))
    }),
    defineTool({
      name: "whatsapp_delete_media",
      title: "Delete WhatsApp Media",
      description: "Deletes uploaded WhatsApp media by Meta media ID. Requires dangerous tools to be enabled.",
      inputSchema: mediaIdInputSchema,
      inputShape: mediaIdInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.media.deleteMedia(input.media_id))
    })
  ];
}
