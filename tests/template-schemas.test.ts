import { describe, expect, it } from "vitest";
import {
  createMessageTemplateInputSchema,
  sendTemplateMessageInputSchema
} from "../src/schemas/template.schemas.js";

describe("template schemas", () => {
  it("requires template media parameters to use exactly one safe media reference", () => {
    expect(
      sendTemplateMessageInputSchema.safeParse({
        recipient_phone_number: "+15551234567",
        template_name: "receipt_ready",
        language_code: "en_US",
        components: [
          {
            type: "header",
            parameters: [{ type: "image", link: "https://cdn.example.test/image.png" }]
          }
        ]
      }).success
    ).toBe(true);

    expect(
      sendTemplateMessageInputSchema.safeParse({
        recipient_phone_number: "+15551234567",
        template_name: "receipt_ready",
        language_code: "en_US",
        components: [
          {
            type: "header",
            parameters: [{ type: "image", link: "http://cdn.example.test/image.png" }]
          }
        ]
      }).success
    ).toBe(false);

    expect(
      sendTemplateMessageInputSchema.safeParse({
        recipient_phone_number: "+15551234567",
        template_name: "receipt_ready",
        language_code: "en_US",
        components: [
          {
            type: "header",
            parameters: [{ type: "image", id: "media_123", link: "https://cdn.example.test/image.png" }]
          }
        ]
      }).success
    ).toBe(false);
  });

  it("requires externally visible template button URLs to use HTTPS", () => {
    const baseInput = {
      name: "support_menu",
      category: "UTILITY",
      language: "en_US",
      components: [
        {
          type: "BUTTONS",
          buttons: [{ type: "URL", text: "Open", url: "https://example.test" }]
        }
      ]
    };

    expect(createMessageTemplateInputSchema.safeParse(baseInput).success).toBe(true);
    expect(
      createMessageTemplateInputSchema.safeParse({
        ...baseInput,
        components: [{ type: "BUTTONS", buttons: [{ type: "URL", text: "Open", url: "javascript:alert(1)" }] }]
      }).success
    ).toBe(false);
    expect(
      createMessageTemplateInputSchema.safeParse({
        ...baseInput,
        components: [{ type: "BUTTONS", buttons: [{ type: "URL", text: "Open", url: "http://example.test" }] }]
      }).success
    ).toBe(false);
  });

  it("requires template create button payloads to match their declared type", () => {
    const baseInput = {
      name: "support_menu",
      category: "UTILITY",
      language: "en_US",
      components: [
        {
          type: "BUTTONS",
          buttons: [{ type: "QUICK_REPLY", text: "Help" }]
        }
      ]
    };

    expect(createMessageTemplateInputSchema.safeParse(baseInput).success).toBe(true);

    expect(
      createMessageTemplateInputSchema.safeParse({
        ...baseInput,
        components: [{ type: "BUTTONS", buttons: [{ type: "URL", text: "Open" }] }]
      }).success
    ).toBe(false);

    expect(
      createMessageTemplateInputSchema.safeParse({
        ...baseInput,
        components: [{ type: "BUTTONS", buttons: [{ type: "PHONE_NUMBER", text: "Call" }] }]
      }).success
    ).toBe(false);
  });
});
