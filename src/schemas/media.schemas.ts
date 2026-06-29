import { z } from "zod";
import { confirmationControlShape, graphIdSchema } from "./common.schemas.js";

export const mediaIdInputSchema = z
  .object({
    media_id: graphIdSchema,
    ...confirmationControlShape
  })
  .strict();

export type MediaIdInput = z.infer<typeof mediaIdInputSchema>;
