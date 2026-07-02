import { z } from "zod";
import { confirmationControlShape } from "./common.schemas.js";

export const webhookAppControlInputSchema = z
  .object({
    ...confirmationControlShape
  })
  .strict();

export type WebhookAppControlInput = z.infer<typeof webhookAppControlInputSchema>;
