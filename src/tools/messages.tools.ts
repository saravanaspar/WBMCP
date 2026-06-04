import {
  markMessageAsReadInputSchema,
  sendAudioMessageInputSchema,
  sendContactMessageInputSchema,
  sendDocumentMessageInputSchema,
  sendImageMessageInputSchema,
  sendInteractiveButtonsInputSchema,
  sendInteractiveListInputSchema,
  sendLocationMessageInputSchema,
  sendTextMessageInputSchema,
  sendVideoMessageInputSchema
} from "../schemas/message.schemas.js";
import { sendTemplateMessageInputSchema } from "../schemas/template.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createMessageTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_send_text_message",
      title: "Send WhatsApp Text Message",
      description: "Sends one WhatsApp text message to one E.164 recipient. Requires dangerous tools to be enabled.",
      inputSchema: sendTextMessageInputSchema,
      inputShape: sendTextMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendText(input))
    }),
    defineTool({
      name: "whatsapp_send_template_message",
      title: "Send WhatsApp Template Message",
      description: "Sends one approved WhatsApp template message to one E.164 recipient. Requires dangerous tools to be enabled.",
      inputSchema: sendTemplateMessageInputSchema,
      inputShape: sendTemplateMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendTemplate(input))
    }),
    defineTool({
      name: "whatsapp_send_image_message",
      title: "Send WhatsApp Image Message",
      description: "Sends one WhatsApp image message by media ID or HTTPS media URL. Requires dangerous tools to be enabled.",
      inputSchema: sendImageMessageInputSchema,
      inputShape: sendImageMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendImage(input))
    }),
    defineTool({
      name: "whatsapp_send_document_message",
      title: "Send WhatsApp Document Message",
      description: "Sends one WhatsApp document message by media ID or HTTPS media URL. Requires dangerous tools to be enabled.",
      inputSchema: sendDocumentMessageInputSchema,
      inputShape: sendDocumentMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendDocument(input))
    }),
    defineTool({
      name: "whatsapp_send_audio_message",
      title: "Send WhatsApp Audio Message",
      description: "Sends one WhatsApp audio message by media ID or HTTPS media URL. Requires dangerous tools to be enabled.",
      inputSchema: sendAudioMessageInputSchema,
      inputShape: sendAudioMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendAudio(input))
    }),
    defineTool({
      name: "whatsapp_send_video_message",
      title: "Send WhatsApp Video Message",
      description: "Sends one WhatsApp video message by media ID or HTTPS media URL. Requires dangerous tools to be enabled.",
      inputSchema: sendVideoMessageInputSchema,
      inputShape: sendVideoMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendVideo(input))
    }),
    defineTool({
      name: "whatsapp_send_location_message",
      title: "Send WhatsApp Location Message",
      description: "Sends one WhatsApp location message to one E.164 recipient. Requires dangerous tools to be enabled.",
      inputSchema: sendLocationMessageInputSchema,
      inputShape: sendLocationMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendLocation(input))
    }),
    defineTool({
      name: "whatsapp_send_contact_message",
      title: "Send WhatsApp Contact Message",
      description: "Sends one WhatsApp contact message to one E.164 recipient. Requires dangerous tools to be enabled.",
      inputSchema: sendContactMessageInputSchema,
      inputShape: sendContactMessageInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendContact(input))
    }),
    defineTool({
      name: "whatsapp_send_interactive_buttons",
      title: "Send WhatsApp Interactive Buttons",
      description: "Sends one WhatsApp interactive button message with up to three buttons. Requires dangerous tools to be enabled.",
      inputSchema: sendInteractiveButtonsInputSchema,
      inputShape: sendInteractiveButtonsInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendInteractiveButtons(input))
    }),
    defineTool({
      name: "whatsapp_send_interactive_list",
      title: "Send WhatsApp Interactive List",
      description: "Sends one WhatsApp interactive list message to one E.164 recipient. Requires dangerous tools to be enabled.",
      inputSchema: sendInteractiveListInputSchema,
      inputShape: sendInteractiveListInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "send",
      execute: async (input, context) => successResult(await context.services.messages.sendInteractiveList(input))
    }),
    defineTool({
      name: "whatsapp_mark_message_as_read",
      title: "Mark WhatsApp Message As Read",
      description: "Marks one inbound WhatsApp message as read. Requires dangerous tools to be enabled.",
      inputSchema: markMessageAsReadInputSchema,
      inputShape: markMessageAsReadInputSchema.shape,
      permission: "dangerous",
      rateLimitKind: "mutation",
      execute: async (input, context) => successResult(await context.services.messages.markMessageAsRead(input))
    })
  ];
}
