import { describe, expect, it } from "vitest";
import { sendTextMessageInputSchema } from "../src/schemas/message.schemas.js";
import { isE164PhoneNumber } from "../src/whatsapp/validators.js";

describe("validators", () => {
  it("accepts strict E.164 phone numbers only", () => {
    expect(isE164PhoneNumber("+15551234567")).toBe(true);
    expect(isE164PhoneNumber("15551234567")).toBe(false);
    expect(isE164PhoneNumber("+0123456789")).toBe(false);
  });

  it("rejects invalid send text inputs before Graph API calls", () => {
    expect(
      sendTextMessageInputSchema.safeParse({
        recipient_phone_number: "15551234567",
        message_body: "hello"
      }).success
    ).toBe(false);

    expect(
      sendTextMessageInputSchema.safeParse({
        recipient_phone_number: "+15551234567",
        message_body: ""
      }).success
    ).toBe(false);
  });
});
