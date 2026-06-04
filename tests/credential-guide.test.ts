import { describe, expect, it } from "vitest";
import { formatCredentialGuide } from "../src/cli/credentialGuide.js";

describe("credential guide", () => {
  it("explains where to find each required Meta value", () => {
    const guide = formatCredentialGuide();

    expect(guide).toContain("WhatsApp access token");
    expect(guide).toContain("WhatsApp phone number ID");
    expect(guide).toContain("WhatsApp Business Account ID");
    expect(guide).toContain("https://developers.facebook.com/apps/");
    expect(guide).toContain("https://developers.facebook.com/docs/whatsapp/cloud-api/get-started");
    expect(guide).toContain("whatsapp_business_messaging");
    expect(guide).toContain("whatsapp_business_management");
  });
});
