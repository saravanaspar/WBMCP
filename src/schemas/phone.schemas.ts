import { z } from "zod";
import { confirmationControlShape, graphIdSchema } from "./common.schemas.js";

export const phoneNumberIdInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional()
  })
  .strict();

export const requestVerificationCodeInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional(),
    code_method: z.enum(["SMS", "VOICE"]),
    locale: z.string().trim().regex(/^[a-z]{2}(?:_[A-Z]{2})?$/).default("en_US"),
    ...confirmationControlShape
  })
  .strict();

export const verifyCodeInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional(),
    code: z.string().trim().regex(/^\d{4,8}$/),
    ...confirmationControlShape
  })
  .strict();

export const registerPhoneNumberInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional(),
    pin: z.string().trim().regex(/^\d{6}$/),
    ...confirmationControlShape
  })
  .strict();

export const deregisterPhoneNumberInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional(),
    ...confirmationControlShape
  })
  .strict();

export const twoStepPinInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional(),
    pin: z.string().trim().regex(/^\d{6}$/),
    ...confirmationControlShape
  })
  .strict();

export const updatePhoneNumberSettingsInputSchema = z
  .object({
    phone_number_id: graphIdSchema.optional(),
    webhook_configuration: z
      .object({
        application: z.string().trim().min(1).max(128).optional()
      })
      .strict()
      .optional(),
    ...confirmationControlShape
  })
  .strict();

export type PhoneNumberIdInput = z.infer<typeof phoneNumberIdInputSchema>;
export type RequestVerificationCodeInput = z.infer<typeof requestVerificationCodeInputSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeInputSchema>;
export type RegisterPhoneNumberInput = z.infer<typeof registerPhoneNumberInputSchema>;
export type DeregisterPhoneNumberInput = z.infer<typeof deregisterPhoneNumberInputSchema>;
export type TwoStepPinInput = z.infer<typeof twoStepPinInputSchema>;
export type UpdatePhoneNumberSettingsInput = z.infer<typeof updatePhoneNumberSettingsInputSchema>;
