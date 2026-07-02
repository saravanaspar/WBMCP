import {
  deregisterPhoneNumberInputSchema,
  phoneNumberIdInputSchema,
  registerPhoneNumberInputSchema,
  requestVerificationCodeInputSchema,
  twoStepPinInputSchema,
  updatePhoneNumberSettingsInputSchema,
  verifyCodeInputSchema
} from "../schemas/phone.schemas.js";
import { defineTool, type ToolDefinition } from "./types.js";
import { successResult } from "./toolResult.js";

export function createPhoneTools(): ToolDefinition[] {
  return [
    defineTool({
      name: "whatsapp_request_phone_verification_code",
      title: "Request WhatsApp Phone Verification Code",
      description: "Requests a WhatsApp phone number verification code. Requires dangerous tools to be enabled.",
      inputSchema: requestVerificationCodeInputSchema,
      group: "phone",
      inputShape: requestVerificationCodeInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.phoneRegistration.requestVerificationCode(input))
    }),
    defineTool({
      name: "whatsapp_verify_phone_code",
      title: "Verify WhatsApp Phone Code",
      description: "Verifies a WhatsApp phone number code. Requires dangerous tools to be enabled.",
      inputSchema: verifyCodeInputSchema,
      group: "phone",
      inputShape: verifyCodeInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.phoneRegistration.verifyCode(input))
    }),
    defineTool({
      name: "whatsapp_register_phone_number",
      title: "Register WhatsApp Phone Number",
      description: "Registers a WhatsApp Cloud API phone number with a two-step PIN. Requires dangerous tools to be enabled.",
      inputSchema: registerPhoneNumberInputSchema,
      group: "phone",
      inputShape: registerPhoneNumberInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.phoneRegistration.register(input))
    }),
    defineTool({
      name: "whatsapp_deregister_phone_number",
      title: "Deregister WhatsApp Phone Number",
      description: "Deregisters a WhatsApp Cloud API phone number. Requires dangerous tools to be enabled.",
      inputSchema: deregisterPhoneNumberInputSchema,
      group: "phone",
      inputShape: deregisterPhoneNumberInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.phoneRegistration.deregister(input))
    }),
    defineTool({
      name: "whatsapp_set_two_step_pin",
      title: "Set WhatsApp Two-Step PIN",
      description: "Sets the two-step verification PIN for a WhatsApp phone number. Requires dangerous tools to be enabled.",
      inputSchema: twoStepPinInputSchema,
      group: "phone",
      inputShape: twoStepPinInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.phoneRegistration.setTwoStepPin(input))
    }),
    defineTool({
      name: "whatsapp_get_phone_number_settings",
      title: "Get WhatsApp Phone Number Settings",
      description: "Reads settings for the configured or supplied WhatsApp phone number.",
      inputSchema: phoneNumberIdInputSchema,
      group: "phone",
      inputShape: phoneNumberIdInputSchema.shape,
      permission: "read",
      idempotent: true,
      execute: async (input, context) => successResult(await context.services.phoneRegistration.getSettings(input.phone_number_id))
    }),
    defineTool({
      name: "whatsapp_update_phone_number_settings",
      title: "Update WhatsApp Phone Number Settings",
      description: "Updates settings for the configured or supplied WhatsApp phone number. Requires dangerous tools to be enabled.",
      inputSchema: updatePhoneNumberSettingsInputSchema,
      group: "phone",
      inputShape: updatePhoneNumberSettingsInputSchema.shape,
      permission: "dangerous",
      execute: async (input, context) => successResult(await context.services.phoneRegistration.updateSettings(input))
    })
  ];
}
