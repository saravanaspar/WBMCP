import { z } from "zod";
import { confirmationControlShape, httpsUrlSchema } from "../schemas/common.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

const updateBusinessProfileShape = {
  ...confirmationControlShape,
  about: z.string().trim().min(1).max(139).optional(),
  address: z.string().trim().min(1).max(256).optional(),
  description: z.string().trim().min(1).max(512).optional(),
  email: z.email().trim().optional(),
  websites: z.array(httpsUrlSchema).max(2).optional(),
  vertical: z
    .enum([
      "UNDEFINED",
      "OTHER",
      "AUTO",
      "BEAUTY",
      "APPAREL",
      "EDU",
      "ENTERTAIN",
      "EVENT_PLAN",
      "FINANCE",
      "GROCERY",
      "GOVT",
      "HOTEL",
      "HEALTH",
      "NONPROFIT",
      "PROF_SERVICES",
      "RETAIL",
      "TRAVEL",
      "RESTAURANT"
    ])
    .optional()
};

const updateBusinessProfileInputSchema = z
  .object(updateBusinessProfileShape)
  .strict()
  .refine((value) => Object.keys(value).some((key) => key !== "confirm"), {
    message: "provide at least one profile field"
  });

export function createProfileTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_update_business_profile",
      title: "Update WhatsApp Business Profile",
      description: "Updates externally visible WhatsApp Business profile fields. Requires dangerous tools to be enabled.",
      inputSchema: updateBusinessProfileInputSchema,
      group: "profile",
      inputShape: updateBusinessProfileShape,
      permission: "dangerous",
      execute: async (input, context) => {
        const profileInput = Object.fromEntries(Object.entries(input).filter(([key]) => key !== "confirm"));
        return successResult(await context.services.profile.updateBusinessProfile(profileInput));
      }
    })
  ];
}
