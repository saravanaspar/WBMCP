import { z } from "zod";
import { graphIdSchema } from "./common.schemas.js";

export const mediaIdInputSchema = z
  .object({
    media_id: graphIdSchema
  })
  .strict();

export type MediaIdInput = z.infer<typeof mediaIdInputSchema>;
