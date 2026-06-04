import { describe, expect, it } from "vitest";
import { formatCredentialSetupGuide } from "../src/cli/auth.js";

describe("credential setup guide", () => {
  it("is shown by setup/auth and explains where to find each required value", () => {
    const guide = formatCredentialSetupGuide();

    expect(guide).toContain("Project setup guide");
    expect(guide).toContain("https://github.com/saravanaspar/WBMCP#setup");
    expect(guide).toContain("WhatsApp access token");
    expect(guide).toContain("WhatsApp phone number ID");
    expect(guide).toContain("WhatsApp Business Account ID");
    expect(guide).toContain("https://developers.facebook.com/apps/");
    expect(guide).toContain("https://developers.facebook.com/docs/whatsapp/cloud-api/get-started");
    expect(guide).toContain("whatsapp_business_messaging");
    expect(guide).toContain("whatsapp_business_management");
  });
});
