import { z } from "zod";
import {
  clientMessageIdSchema,
  confirmationControlShape,
  graphIdSchema,
  httpsUrlSchema,
  languageCodeSchema,
  paginationInputSchema,
  safeTextSchema,
  sendControlShape
} from "./common.schemas.js";

export const flowIdInputSchema = z
  .object({
    flow_id: graphIdSchema,
    ...confirmationControlShape
  })
  .strict();

export const listFlowsInputSchema = paginationInputSchema
  .extend({
    status: z.enum(["DRAFT", "PUBLISHED", "DEPRECATED", "BLOCKED", "THROTTLED"]).optional()
  })
  .strict();

export const createFlowInputSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    categories: z.array(z.string().trim().min(1).max(64)).min(1).max(10),
    endpoint_uri: httpsUrlSchema.optional(),
    ...confirmationControlShape
  })
  .strict();

export const updateFlowInputSchema = z
  .object({
    flow_id: graphIdSchema,
    name: z.string().trim().min(1).max(200).optional(),
    categories: z.array(z.string().trim().min(1).max(64)).min(1).max(10).optional(),
    endpoint_uri: httpsUrlSchema.optional(),
    ...confirmationControlShape
  })
  .strict();

export const flowJsonInputSchema = z
  .object({
    flow_id: graphIdSchema,
    flow_json: z.record(z.string(), z.unknown()),
    ...confirmationControlShape
  })
  .strict();

export const sendFlowMessageInputSchema = z
  .object({
    recipient_phone_number: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
    flow_id: graphIdSchema,
    flow_token: z.string().trim().min(1).max(1024),
    flow_cta: z.string().trim().min(1).max(30),
    body_text: safeTextSchema,
    header_text: z.string().trim().min(1).max(60).optional(),
    footer_text: z.string().trim().min(1).max(60).optional(),
    mode: z.enum(["draft", "published"]).optional(),
    language_code: languageCodeSchema.optional(),
    client_message_id: clientMessageIdSchema,
    ...sendControlShape
  })
  .strict();

export type FlowIdInput = z.infer<typeof flowIdInputSchema>;
export type ListFlowsInput = z.infer<typeof listFlowsInputSchema>;
export type CreateFlowInput = z.infer<typeof createFlowInputSchema>;
export type UpdateFlowInput = z.infer<typeof updateFlowInputSchema>;
export type FlowJsonInput = z.infer<typeof flowJsonInputSchema>;
export type SendFlowMessageInput = z.infer<typeof sendFlowMessageInputSchema>;
