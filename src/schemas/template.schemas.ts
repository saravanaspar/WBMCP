import { z } from "zod";
import {
  MAX_TEMPLATE_COMPONENTS,
  MAX_TEMPLATE_PARAMETER_LENGTH,
  MAX_TEMPLATE_PARAMETERS
} from "../config/constants.js";
import {
  clientMessageIdSchema,
  e164PhoneNumberSchema,
  graphIdSchema,
  httpsUrlSchema,
  languageCodeSchema,
  mediaUrlSchema,
  paginationInputSchema,
  templateNameSchema
} from "./common.schemas.js";

const textParameterSchema = z
  .object({
    type: z.literal("text"),
    text: z.string().trim().min(1).max(MAX_TEMPLATE_PARAMETER_LENGTH)
  })
  .strict();

const mediaParameterSchema = z
  .object({
    type: z.enum(["image", "document", "video"]),
    id: graphIdSchema.optional(),
    link: mediaUrlSchema.optional()
  })
  .strict()
  .refine((value) => Boolean(value.id) !== Boolean(value.link), {
    message: "provide exactly one of id or link"
  });

const currencyParameterSchema = z
  .object({
    type: z.literal("currency"),
    currency: z
      .object({
        fallback_value: z.string().trim().min(1).max(128),
        code: z.string().trim().regex(/^[A-Z]{3}$/),
        amount_1000: z.number().int()
      })
      .strict()
  })
  .strict();

const dateTimeParameterSchema = z
  .object({
    type: z.literal("date_time"),
    date_time: z
      .object({
        fallback_value: z.string().trim().min(1).max(128)
      })
      .strict()
  })
  .strict();

export const templateParameterSchema = z.union([
  textParameterSchema,
  mediaParameterSchema,
  currencyParameterSchema,
  dateTimeParameterSchema
]);

export const templateComponentSchema = z
  .object({
    type: z.enum(["header", "body", "button"]),
    sub_type: z.enum(["quick_reply", "url"]).optional(),
    index: z.string().trim().regex(/^\d+$/).optional(),
    parameters: z.array(templateParameterSchema).max(MAX_TEMPLATE_PARAMETERS).default([])
  })
  .strict();

export const sendTemplateMessageInputSchema = z
  .object({
    recipient_phone_number: e164PhoneNumberSchema,
    template_name: templateNameSchema,
    language_code: languageCodeSchema,
    components: z.array(templateComponentSchema).max(MAX_TEMPLATE_COMPONENTS).default([]),
    client_message_id: clientMessageIdSchema
  })
  .strict();

const createTemplateButtonTextSchema = z.string().trim().min(1).max(25);

const quickReplyTemplateButtonSchema = z
  .object({
    type: z.literal("QUICK_REPLY"),
    text: createTemplateButtonTextSchema
  })
  .strict();

const urlTemplateButtonSchema = z
  .object({
    type: z.literal("URL"),
    text: createTemplateButtonTextSchema,
    url: httpsUrlSchema
  })
  .strict();

const phoneNumberTemplateButtonSchema = z
  .object({
    type: z.literal("PHONE_NUMBER"),
    text: createTemplateButtonTextSchema,
    phone_number: z.string().trim().min(1).max(32)
  })
  .strict();

const createTemplateButtonSchema = z.discriminatedUnion("type", [
  quickReplyTemplateButtonSchema,
  urlTemplateButtonSchema,
  phoneNumberTemplateButtonSchema
]);

const createTemplateComponentSchema = z
  .object({
    type: z.enum(["HEADER", "BODY", "FOOTER", "BUTTONS"]),
    format: z.enum(["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "LOCATION"]).optional(),
    text: z.string().trim().min(1).max(1024).optional(),
    example: z.unknown().optional(),
    buttons: z.array(createTemplateButtonSchema).max(10).optional()
  })
  .strict();

export const createMessageTemplateInputSchema = z
  .object({
    name: templateNameSchema,
    category: z.enum(["AUTHENTICATION", "MARKETING", "UTILITY"]),
    language: languageCodeSchema,
    components: z.array(createTemplateComponentSchema).min(1).max(MAX_TEMPLATE_COMPONENTS)
  })
  .strict();

export const deleteMessageTemplateInputSchema = z
  .object({
    name: templateNameSchema,
    template_id: graphIdSchema.optional()
  })
  .strict();

export const getMessageTemplateInputSchema = z
  .object({
    template_id: graphIdSchema
  })
  .strict();

export const listMessageTemplatesInputSchema = paginationInputSchema.extend({
  status: z.enum(["APPROVED", "PENDING", "REJECTED", "PAUSED", "DISABLED"]).optional(),
  category: z.enum(["AUTHENTICATION", "MARKETING", "UTILITY"]).optional(),
  name: templateNameSchema.optional()
});

export const validateTemplatePayloadInputSchema = sendTemplateMessageInputSchema;

export type SendTemplateMessageInput = z.infer<typeof sendTemplateMessageInputSchema>;
export type CreateMessageTemplateInput = z.infer<typeof createMessageTemplateInputSchema>;
export type DeleteMessageTemplateInput = z.infer<typeof deleteMessageTemplateInputSchema>;
export type GetMessageTemplateInput = z.infer<typeof getMessageTemplateInputSchema>;
export type ListMessageTemplatesInput = z.infer<typeof listMessageTemplatesInputSchema>;
export type ValidateTemplatePayloadInput = z.infer<typeof validateTemplatePayloadInputSchema>;
