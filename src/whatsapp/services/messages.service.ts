import type { AppConfig } from "../../config/env.js";
import type {
  MarkMessageAsReadInput,
  SendAudioMessageInput,
  SendContactMessageInput,
  SendDocumentMessageInput,
  SendProductListMessageInput,
  SendProductMessageInput,
  SendReactionMessageInput,
  SendImageMessageInput,
  SendInteractiveButtonsInput,
  SendInteractiveListInput,
  SendLocationMessageInput,
  SendStickerMessageInput,
  SendTextMessageInput,
  SendVideoMessageInput
} from "../../schemas/message.schemas.js";
import type { SendFlowMessageInput } from "../../schemas/flow.schemas.js";
import type { SendTemplateMessageInput } from "../../schemas/template.schemas.js";
import type { GraphClient } from "../graphClient.js";
import type { JsonObject, SendMessageResponse } from "../types.js";
import { toJsonObject, toJsonValue } from "../types.js";
import { normalizePhoneForWhatsApp } from "../validators.js";

interface MediaInput {
  readonly recipient_phone_number: string;
  readonly client_message_id?: string | undefined;
  readonly media_id?: string | undefined;
  readonly media_url?: string | undefined;
  readonly caption?: string | undefined;
  readonly filename?: string | undefined;
}

export class MessagesService {
  public constructor(
    private readonly client: GraphClient,
    private readonly config: AppConfig
  ) {}

  public async sendText(input: SendTextMessageInput): Promise<SendMessageResponse> {
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "text",
      text: {
        preview_url: input.preview_url,
        body: input.message_body
      }
    });
  }

  public async sendTemplate(input: SendTemplateMessageInput): Promise<SendMessageResponse> {
    const template: JsonObject = {
      name: input.template_name,
      language: { code: input.language_code }
    };
    if (input.components.length > 0) {
      template.components = toJsonValue(input.components);
    }
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "template",
      template
    });
  }

  public async sendImage(input: SendImageMessageInput): Promise<SendMessageResponse> {
    return this.sendMedia("image", input);
  }

  public async sendDocument(input: SendDocumentMessageInput): Promise<SendMessageResponse> {
    return this.sendMedia("document", input);
  }

  public async sendAudio(input: SendAudioMessageInput): Promise<SendMessageResponse> {
    return this.sendMedia("audio", input);
  }

  public async sendVideo(input: SendVideoMessageInput): Promise<SendMessageResponse> {
    return this.sendMedia("video", input);
  }

  public async sendReaction(input: SendReactionMessageInput): Promise<SendMessageResponse> {
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "reaction",
      reaction: {
        message_id: input.message_id,
        emoji: input.emoji
      }
    });
  }

  public async sendSticker(input: SendStickerMessageInput): Promise<SendMessageResponse> {
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "sticker",
      sticker: this.mediaPayload(input)
    });
  }

  public async sendLocation(input: SendLocationMessageInput): Promise<SendMessageResponse> {
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "location",
      location: {
        latitude: input.latitude,
        longitude: input.longitude,
        name: input.name ?? "",
        address: input.address ?? ""
      }
    });
  }

  public async sendContact(input: SendContactMessageInput): Promise<SendMessageResponse> {
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "contacts",
      contacts: [
        {
          name: {
            formatted_name: input.formatted_name,
            first_name: input.first_name ?? input.formatted_name,
            last_name: input.last_name ?? ""
          },
          phones: input.phones.map((phone) => ({
            phone: normalizePhoneForWhatsApp(phone.phone),
            type: phone.type ?? "CELL"
          }))
        }
      ]
    });
  }

  public async sendInteractiveButtons(input: SendInteractiveButtonsInput): Promise<SendMessageResponse> {
    return this.postMessage(toJsonObject({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "interactive",
      interactive: {
        type: "button",
        header: input.header_text ? { type: "text", text: input.header_text } : undefined,
        body: { text: input.body_text },
        footer: input.footer_text ? { text: input.footer_text } : undefined,
        action: {
          buttons: input.buttons.map((button) => ({
            type: "reply",
            reply: button
          }))
        }
      }
    }));
  }

  public async sendInteractiveList(input: SendInteractiveListInput): Promise<SendMessageResponse> {
    return this.postMessage(toJsonObject({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "interactive",
      interactive: {
        type: "list",
        header: input.header_text ? { type: "text", text: input.header_text } : undefined,
        body: { text: input.body_text },
        footer: input.footer_text ? { text: input.footer_text } : undefined,
        action: {
          button: input.button_text,
          sections: toJsonValue(input.sections)
        }
      }
    }));
  }

  public async sendProduct(input: SendProductMessageInput): Promise<SendMessageResponse> {
    return this.postMessage(toJsonObject({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "interactive",
      interactive: {
        type: "product",
        body: input.body_text ? { text: input.body_text } : undefined,
        footer: input.footer_text ? { text: input.footer_text } : undefined,
        action: {
          catalog_id: input.catalog_id,
          product_retailer_id: input.product_retailer_id
        }
      }
    }));
  }

  public async sendProductList(input: SendProductListMessageInput): Promise<SendMessageResponse> {
    return this.postMessage(toJsonObject({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "interactive",
      interactive: {
        type: "product_list",
        header: input.header_text ? { type: "text", text: input.header_text } : undefined,
        body: { text: input.body_text },
        footer: input.footer_text ? { text: input.footer_text } : undefined,
        action: {
          catalog_id: input.catalog_id,
          sections: input.sections.map((section) => ({
            ...(section.title ? { title: section.title } : {}),
            product_items: section.product_retailer_ids.map((productRetailerId) => ({
              product_retailer_id: productRetailerId
            }))
          }))
        }
      }
    }));
  }

  public async sendFlow(input: SendFlowMessageInput): Promise<SendMessageResponse> {
    return this.postMessage(toJsonObject({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type: "interactive",
      interactive: {
        type: "flow",
        header: input.header_text ? { type: "text", text: input.header_text } : undefined,
        body: { text: input.body_text },
        footer: input.footer_text ? { text: input.footer_text } : undefined,
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_id: input.flow_id,
            flow_token: input.flow_token,
            flow_cta: input.flow_cta,
            ...(input.mode ? { mode: input.mode } : {}),
            ...(input.language_code ? { flow_action_payload: { language: input.language_code } } : {})
          }
        }
      }
    }));
  }

  public async markMessageAsRead(input: MarkMessageAsReadInput): Promise<JsonObject> {
    return this.client.postJson(`/${this.config.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      status: "read",
      message_id: input.message_id
    });
  }

  private async sendMedia(type: "image" | "document" | "audio" | "video", input: MediaInput): Promise<SendMessageResponse> {
    return this.postMessage({
      ...this.basePayload(input.recipient_phone_number, input.client_message_id),
      type,
      [type]: this.mediaPayload(input)
    });
  }

  private mediaPayload(input: MediaInput): JsonObject {
    const payload: Record<string, string> = {};
    if (input.media_id) {
      payload.id = input.media_id;
    }
    if (input.media_url) {
      payload.link = input.media_url;
    }
    if ("caption" in input && input.caption) {
      payload.caption = input.caption;
    }
    if ("filename" in input && input.filename) {
      payload.filename = input.filename;
    }
    return payload;
  }

  private basePayload(recipientPhoneNumber: string, clientMessageId?: string): JsonObject {
    const payload: Record<string, string> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhoneForWhatsApp(recipientPhoneNumber)
    };
    if (clientMessageId) {
      payload.biz_opaque_callback_data = clientMessageId;
    }
    return payload;
  }

  private async postMessage(payload: JsonObject): Promise<SendMessageResponse> {
    return this.client.postJson<SendMessageResponse>(`/${this.config.phoneNumberId}/messages`, payload);
  }
}
