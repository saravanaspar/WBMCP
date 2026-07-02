import { z } from "zod";

const isoDateSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/);

export const analyticsInputSchema = z
  .object({
    start_date: isoDateSchema,
    end_date: isoDateSchema,
    granularity: z.enum(["DAY", "MONTH"]).default("DAY")
  })
  .strict();

export type AnalyticsInput = z.infer<typeof analyticsInputSchema>;
