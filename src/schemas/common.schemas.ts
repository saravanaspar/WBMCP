import { z } from "zod";
import { MAX_CLIENT_MESSAGE_ID_LENGTH } from "../config/constants.js";

export const emptyInputSchema = z.object({}).strict();

export const e164PhoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "must be an E.164 phone number such as +15551234567");

export const graphIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_.:-]{1,128}$/, "must be a safe Meta Graph identifier");

export const clientMessageIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_CLIENT_MESSAGE_ID_LENGTH)
  .regex(/^[A-Za-z0-9_.:-]+$/, "must contain only URL-safe identifier characters")
  .optional();

export const httpsUrlSchema = z
  .url()
  .trim()
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:";
  }, "must be an HTTPS URL");

export const mediaUrlSchema = httpsUrlSchema;

export const paginationInputSchema = z
  .object({
    limit: z.number().int().min(1).max(100).default(25),
    after: z.string().trim().min(1).max(512).optional()
  })
  .strict();

export const languageCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2,3}(?:_[A-Z]{2})?$/, "must look like en_US or es");

export const templateNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(512)
  .regex(/^[a-z0-9_]+$/, "must use lowercase letters, numbers, and underscores");

export const safeTextSchema = z.string().trim().min(1).max(1024);
