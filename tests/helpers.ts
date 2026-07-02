import type { AppConfig } from "../src/config/env.js";
import { createAuditLogger } from "../src/security/audit.js";
import type { ToolContext } from "../src/tools/types.js";
import { GraphClient } from "../src/whatsapp/graphClient.js";
import { AccountService } from "../src/whatsapp/services/account.service.js";
import { AnalyticsService } from "../src/whatsapp/services/analytics.service.js";
import { CommerceService } from "../src/whatsapp/services/commerce.service.js";
import { FlowsService } from "../src/whatsapp/services/flows.service.js";
import { MediaService } from "../src/whatsapp/services/media.service.js";
import { MessagesService } from "../src/whatsapp/services/messages.service.js";
import { PhoneRegistrationService } from "../src/whatsapp/services/phoneRegistration.service.js";
import { PhoneNumbersService } from "../src/whatsapp/services/phoneNumbers.service.js";
import { ProfileService } from "../src/whatsapp/services/profile.service.js";
import { TemplatesService } from "../src/whatsapp/services/templates.service.js";
import { WebhooksService } from "../src/whatsapp/services/webhooks.service.js";

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    accessToken: "placeholder-access-token",
    phoneNumberId: "123456789012345",
    businessAccountId: "123456789012346",
    graphApiVersion: "v24.0",
    appSecret: undefined,
    logLevel: "silent",
    enableDangerousTools: false,
    readOnly: false,
    requireConfirmation: false,
    transport: { mode: "stdio" },
    ...overrides
  };
}

export function testContext(config: AppConfig = testConfig()): ToolContext {
  const graphClient = new GraphClient({
    accessToken: config.accessToken,
    graphApiVersion: config.graphApiVersion,
    appSecret: config.appSecret,
    fetchFn: () => Promise.reject(new Error("Graph API should not be called in this test"))
  });
  const account = new AccountService(graphClient, config);
  return {
    config,
    services: {
      account,
      messages: new MessagesService(graphClient, config),
      media: new MediaService(graphClient),
      templates: new TemplatesService(graphClient, config),
      profile: new ProfileService(graphClient, config),
      phoneNumbers: new PhoneNumbersService(account),
      phoneRegistration: new PhoneRegistrationService(graphClient, config),
      commerce: new CommerceService(graphClient, config),
      webhooks: new WebhooksService(graphClient, config),
      flows: new FlowsService(graphClient, config),
      analytics: new AnalyticsService(graphClient, config)
    },
    auditLogger: createAuditLogger("silent"),
    toolCatalog: []
  };
}
