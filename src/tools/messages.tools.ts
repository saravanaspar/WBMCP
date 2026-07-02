import {
  markMessageAsReadInputSchema,
  sendAudioMessageInputSchema,
  sendContactMessageInputSchema,
  sendDocumentMessageInputSchema,
  sendProductListMessageInputSchema,
  sendProductMessageInputSchema,
  sendImageMessageInputSchema,
  sendInteractiveButtonsInputSchema,
  sendInteractiveListInputSchema,
  sendLocationMessageInputSchema,
  sendReactionMessageInputSchema,
  sendStickerMessageInputSchema,
  sendTextMessageInputSchema,
  sendVideoMessageInputSchema
} from "../schemas/message.schemas.js";
import { sendFlowMessageInputSchema } from "../schemas/flow.schemas.js";
import { sendTemplateMessageInputSchema } from "../schemas/template.schemas.js";
import { maskPhoneNumber } from "../whatsapp/validators.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { previewResult, successResult } from "./toolResult.js";



export function createMessageTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_send_text_message",
      title: "Send WhatsApp Text Message",
      description:
        "Sends one free-form WhatsApp text message to one E.164 recipient. Use dryRun: true to preview without sending. Requires dangerous tools to be enabled and may require confirm: true.",
      inputSchema: sendTextMessageInputSchema,
      group: "messages",
      inputShape: sendTextMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("text", input, { message_body: input.message_body, preview_url: input.preview_url })
          : successResult(await context.services.messages.sendText(input))
    }),
    defineTool({
      name: "whatsapp_send_template_message",
      title: "Send WhatsApp Template Message",
      description:
        "Sends one approved WhatsApp template message. Use this for cold contacts or outside the 24-hour customer-service window. Use dryRun: true to preview without sending.",
      inputSchema: sendTemplateMessageInputSchema,
      group: "messages",
      inputShape: sendTemplateMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("template", input, {
              template_name: input.template_name,
              language_code: input.language_code,
              component_count: input.components.length
            })
          : successResult(await context.services.messages.sendTemplate(input))
    }),
    defineTool({
      name: "whatsapp_send_image_message",
      title: "Send WhatsApp Image Message",
      description:
        "Sends one WhatsApp image message by media ID or HTTPS media URL. Use dryRun: true to preview without sending.",
      inputSchema: sendImageMessageInputSchema,
      group: "messages",
      inputShape: sendImageMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun ? sendMediaPreview("image", input) : successResult(await context.services.messages.sendImage(input))
    }),
    defineTool({
      name: "whatsapp_send_document_message",
      title: "Send WhatsApp Document Message",
      description:
        "Sends one WhatsApp document message by media ID or HTTPS media URL. Use dryRun: true to preview without sending.",
      inputSchema: sendDocumentMessageInputSchema,
      group: "messages",
      inputShape: sendDocumentMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun ? sendMediaPreview("document", input) : successResult(await context.services.messages.sendDocument(input))
    }),
    defineTool({
      name: "whatsapp_send_audio_message",
      title: "Send WhatsApp Audio Message",
      description:
        "Sends one WhatsApp audio message by media ID or HTTPS media URL. Use dryRun: true to preview without sending.",
      inputSchema: sendAudioMessageInputSchema,
      group: "messages",
      inputShape: sendAudioMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun ? sendMediaPreview("audio", input) : successResult(await context.services.messages.sendAudio(input))
    }),
    defineTool({
      name: "whatsapp_send_video_message",
      title: "Send WhatsApp Video Message",
      description:
        "Sends one WhatsApp video message by media ID or HTTPS media URL. Use dryRun: true to preview without sending.",
      inputSchema: sendVideoMessageInputSchema,
      group: "messages",
      inputShape: sendVideoMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun ? sendMediaPreview("video", input) : successResult(await context.services.messages.sendVideo(input))
    }),
    defineTool({
      name: "whatsapp_send_reaction_message",
      title: "Send WhatsApp Reaction Message",
      description: "Sends one emoji reaction to a WhatsApp message. Use dryRun: true to preview without sending.",
      inputSchema: sendReactionMessageInputSchema,
      group: "messages",
      inputShape: sendReactionMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("reaction", input, { message_id: input.message_id, emoji: input.emoji })
          : successResult(await context.services.messages.sendReaction(input))
    }),
    defineTool({
      name: "whatsapp_send_sticker_message",
      title: "Send WhatsApp Sticker Message",
      description: "Sends one WhatsApp sticker message by media ID or HTTPS media URL. Use dryRun: true to preview without sending.",
      inputSchema: sendStickerMessageInputSchema,
      group: "messages",
      inputShape: sendStickerMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun ? sendMediaPreview("sticker", input) : successResult(await context.services.messages.sendSticker(input))
    }),
    defineTool({
      name: "whatsapp_send_location_message",
      title: "Send WhatsApp Location Message",
      description:
        "Sends one WhatsApp location message to one E.164 recipient. Use dryRun: true to preview without sending.",
      inputSchema: sendLocationMessageInputSchema,
      group: "messages",
      inputShape: sendLocationMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("location", input, { latitude: input.latitude, longitude: input.longitude, name: input.name })
          : successResult(await context.services.messages.sendLocation(input))
    }),
    defineTool({
      name: "whatsapp_send_contact_message",
      title: "Send WhatsApp Contact Message",
      description:
        "Sends one WhatsApp contact card message to one E.164 recipient. Use dryRun: true to preview without sending.",
      inputSchema: sendContactMessageInputSchema,
      group: "messages",
      inputShape: sendContactMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("contacts", input, { formatted_name: input.formatted_name, phone_count: input.phones.length })
          : successResult(await context.services.messages.sendContact(input))
    }),
    defineTool({
      name: "whatsapp_send_interactive_buttons",
      title: "Send WhatsApp Interactive Buttons",
      description:
        "Sends one WhatsApp interactive button message with up to three buttons. Use dryRun: true to preview without sending.",
      inputSchema: sendInteractiveButtonsInputSchema,
      group: "messages",
      inputShape: sendInteractiveButtonsInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("interactive_buttons", input, { button_count: input.buttons.length, body_text: input.body_text })
          : successResult(await context.services.messages.sendInteractiveButtons(input))
    }),
    defineTool({
      name: "whatsapp_send_interactive_list",
      title: "Send WhatsApp Interactive List",
      description:
        "Sends one WhatsApp interactive list message to one E.164 recipient. Use dryRun: true to preview without sending.",
      inputSchema: sendInteractiveListInputSchema,
      group: "messages",
      inputShape: sendInteractiveListInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("interactive_list", input, { section_count: input.sections.length, body_text: input.body_text })
          : successResult(await context.services.messages.sendInteractiveList(input))
    }),
    defineTool({
      name: "whatsapp_send_product_message",
      title: "Send WhatsApp Product Message",
      description: "Sends one WhatsApp single-product commerce message. Use dryRun: true to preview without sending.",
      inputSchema: sendProductMessageInputSchema,
      group: "messages",
      inputShape: sendProductMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("product", input, { catalog_id: input.catalog_id, product_retailer_id: input.product_retailer_id })
          : successResult(await context.services.messages.sendProduct(input))
    }),
    defineTool({
      name: "whatsapp_send_product_list_message",
      title: "Send WhatsApp Product List Message",
      description: "Sends one WhatsApp multi-product commerce message. Use dryRun: true to preview without sending.",
      inputSchema: sendProductListMessageInputSchema,
      group: "messages",
      inputShape: sendProductListMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("product_list", input, { catalog_id: input.catalog_id, section_count: input.sections.length })
          : successResult(await context.services.messages.sendProductList(input))
    }),
    defineTool({
      name: "whatsapp_send_flow_message",
      title: "Send WhatsApp Flow Message",
      description: "Sends one WhatsApp Flow interactive message. Use dryRun: true to preview without sending.",
      inputSchema: sendFlowMessageInputSchema,
      group: "messages",
      inputShape: sendFlowMessageInputSchema.shape,
      permission: "dangerous",
      supportsDryRun: true,
      execute: async (input, context) =>
        input.dryRun
          ? sendPreview("flow", input, { flow_id: input.flow_id, flow_cta: input.flow_cta, body_text: input.body_text })
          : successResult(await context.services.messages.sendFlow(input))
    }),
    defineTool({
      name: "whatsapp_mark_message_as_read",
      title: "Mark WhatsApp Message As Read",
      description: "Marks one inbound WhatsApp message as read. Requires dangerous tools and may require confirm: true.",
      inputSchema: markMessageAsReadInputSchema,
      group: "messages",
      inputShape: markMessageAsReadInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.messages.markMessageAsRead(input))
    })
  ];
}

function sendMediaPreview(
  type: "image" | "document" | "audio" | "video" | "sticker",
  input: {
    readonly recipient_phone_number: string;
    readonly media_id?: string | undefined;
    readonly media_url?: string | undefined;
    readonly caption?: string | undefined;
    readonly filename?: string | undefined;
  }
) {
  return sendPreview(type, input, {
    media_id: input.media_id,
    media_url: input.media_url,
    ...("caption" in input && input.caption ? { caption: input.caption } : {}),
    ...("filename" in input && input.filename ? { filename: input.filename } : {})
  });
}

function sendPreview(
  type: string,
  input: { readonly recipient_phone_number: string },
  details: Record<string, unknown> = {}
) {
  return previewResult({
    dryRun: true,
    wouldSend: {
      type,
      to: input.recipient_phone_number,
      to_masked: maskPhoneNumber(input.recipient_phone_number),
      ...details
    }
  });
}
