import { describe, expect, it } from "vitest";
import { redactSensitive } from "../src/security/redact.js";

describe("redactSensitive", () => {
  it("redacts tokens, phone numbers, message bodies, URL query strings, and emails", () => {
    const redacted = redactSensitive({
      Authorization: "Bearer placeholder-access-token",
      recipient_phone_number: "+15551234567",
      body: "private message body",
      media_url: "https://cdn.example.test/file.pdf?signature=secret",
      email: "person@example.test"
    });
    const serialized = JSON.stringify(redacted);

    expect(serialized).not.toContain("placeholder-access-token");
    expect(serialized).not.toContain("+15551234567");
    expect(serialized).not.toContain("private message body");
    expect(serialized).not.toContain("signature=secret");
    expect(serialized).toContain("[REDACTED_PHONE:4567]");
    expect(serialized).toContain("p***@example.test");
  });
});
