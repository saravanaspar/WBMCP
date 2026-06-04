import { z } from "zod";
import {
  MAX_BUTTON_TITLE_LENGTH,
  MAX_CAPTION_LENGTH,
  MAX_INTERACTIVE_BODY_LENGTH,
  MAX_INTERACTIVE_TITLE_LENGTH,
  MAX_LIST_ROWS,
  MAX_TEXT_MESSAGE_LENGTH
} from "../config/constants.js";
import {
  clientMessageIdSchema,
  e164PhoneNumberSchema,
  graphIdSchema,
  mediaUrlSchema
} from "./common.schemas.js";

const baseSendShape = {
  recipient_phone_number: e164PhoneNumberSchema,
  client_message_id: clientMessageIdSchema
};

export const sendTextMessageInputSchema = z
  .object({
    ...baseSendShape,
    message_body: z.string().trim().min(1).max(MAX_TEXT_MESSAGE_LENGTH),
    preview_url: z.boolean().default(false)
  })
  .strict();

const mediaBaseShape = {
  ...baseSendShape,
  media_id: graphIdSchema.optional(),
  media_url: mediaUrlSchema.optional(),
  caption: z.string().trim().min(1).max(MAX_CAPTION_LENGTH).optional()
};

const sendImageMessageShape = mediaBaseShape;
const sendDocumentMessageShape = {
  ...mediaBaseShape,
  filename: z.string().trim().min(1).max(240).optional()
};
const sendAudioMessageShape = {
  ...baseSendShape,
  media_id: graphIdSchema.optional(),
  media_url: mediaUrlSchema.optional()
};
const sendVideoMessageShape = mediaBaseShape;

export const sendImageMessageInputSchema = z.object(sendImageMessageShape).strict().refine(hasExactlyOneMediaReference, {
  message: "provide exactly one of media_id or media_url"
});
export const sendDocumentMessageInputSchema = z.object(sendDocumentMessageShape).strict().refine(hasExactlyOneMediaReference, {
  message: "provide exactly one of media_id or media_url"
});
export const sendAudioMessageInputSchema = z.object(sendAudioMessageShape).strict().refine(hasExactlyOneMediaReference, {
  message: "provide exactly one of media_id or media_url"
});
export const sendVideoMessageInputSchema = z.object(sendVideoMessageShape).strict().refine(hasExactlyOneMediaReference, {
  message: "provide exactly one of media_id or media_url"
});

export const sendLocationMessageInputSchema = z
  .object({
    ...baseSendShape,
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    name: z.string().trim().min(1).max(100).optional(),
    address: z.string().trim().min(1).max(300).optional()
  })
  .strict();

const contactPhoneSchema = z
  .object({
    phone: e164PhoneNumberSchema,
    type: z.enum(["CELL", "MAIN", "IPHONE", "HOME", "WORK"]).optional()
  })
  .strict();

export const sendContactMessageInputSchema = z
  .object({
    ...baseSendShape,
    formatted_name: z.string().trim().min(1).max(256),
    first_name: z.string().trim().min(1).max(128).optional(),
    last_name: z.string().trim().min(1).max(128).optional(),
    phones: z.array(contactPhoneSchema).min(1).max(5)
  })
  .strict();

const buttonReplySchema = z
  .object({
    id: z.string().trim().min(1).max(256),
    title: z.string().trim().min(1).max(MAX_BUTTON_TITLE_LENGTH)
  })
  .strict();

export const sendInteractiveButtonsInputSchema = z
  .object({
    ...baseSendShape,
    body_text: z.string().trim().min(1).max(MAX_INTERACTIVE_BODY_LENGTH),
    header_text: z.string().trim().min(1).max(MAX_INTERACTIVE_TITLE_LENGTH).optional(),
    footer_text: z.string().trim().min(1).max(60).optional(),
    buttons: z.array(buttonReplySchema).min(1).max(3)
  })
  .strict();

const listRowSchema = z
  .object({
    id: z.string().trim().min(1).max(200),
    title: z.string().trim().min(1).max(24),
    description: z.string().trim().min(1).max(72).optional()
  })
  .strict();

const listSectionSchema = z
  .object({
    title: z.string().trim().min(1).max(24).optional(),
    rows: z.array(listRowSchema).min(1).max(MAX_LIST_ROWS)
  })
  .strict();

export const sendInteractiveListInputSchema = z
  .object({
    ...baseSendShape,
    body_text: z.string().trim().min(1).max(MAX_INTERACTIVE_BODY_LENGTH),
    button_text: z.string().trim().min(1).max(20),
    header_text: z.string().trim().min(1).max(MAX_INTERACTIVE_TITLE_LENGTH).optional(),
    footer_text: z.string().trim().min(1).max(60).optional(),
    sections: z.array(listSectionSchema).min(1).max(10)
  })
  .strict();

export const markMessageAsReadInputSchema = z
  .object({
    message_id: graphIdSchema
  })
  .strict();

export type SendTextMessageInput = z.infer<typeof sendTextMessageInputSchema>;
export type SendImageMessageInput = z.infer<typeof sendImageMessageInputSchema>;
export type SendDocumentMessageInput = z.infer<typeof sendDocumentMessageInputSchema>;
export type SendAudioMessageInput = z.infer<typeof sendAudioMessageInputSchema>;
export type SendVideoMessageInput = z.infer<typeof sendVideoMessageInputSchema>;
export type SendLocationMessageInput = z.infer<typeof sendLocationMessageInputSchema>;
export type SendContactMessageInput = z.infer<typeof sendContactMessageInputSchema>;
export type SendInteractiveButtonsInput = z.infer<typeof sendInteractiveButtonsInputSchema>;
export type SendInteractiveListInput = z.infer<typeof sendInteractiveListInputSchema>;
export type MarkMessageAsReadInput = z.infer<typeof markMessageAsReadInputSchema>;

function hasExactlyOneMediaReference(value: {
  media_id?: string | undefined;
  media_url?: string | undefined;
}): boolean {
  return Boolean(value.media_id) !== Boolean(value.media_url);
}
