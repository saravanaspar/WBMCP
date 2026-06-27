import type { AppConfig } from "../config/env.js";
import { createAuditLogger, type AuditLogger } from "../security/audit.js";
import type { ToolContext } from "../tools/types.js";
import { GraphClient, type GraphClientOptions } from "../whatsapp/graphClient.js";
import { AccountService } from "../whatsapp/services/account.service.js";
import { MediaService } from "../whatsapp/services/media.service.js";
import { MessagesService } from "../whatsapp/services/messages.service.js";
import { PhoneNumbersService } from "../whatsapp/services/phoneNumbers.service.js";
import { ProfileService } from "../whatsapp/services/profile.service.js";
import { TemplatesService } from "../whatsapp/services/templates.service.js";

export interface ToolContextOptions {
  readonly fetchFn?: typeof fetch;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly auditLogger?: AuditLogger;
}

export function createToolContext(config: AppConfig, options: ToolContextOptions = {}): ToolContext {
  const graphClient = new GraphClient(graphClientOptions(config, options));
  const account = new AccountService(graphClient, config);

  return {
    config,
    services: {
      account,
      messages: new MessagesService(graphClient, config),
      media: new MediaService(graphClient),
      templates: new TemplatesService(graphClient, config),
      profile: new ProfileService(graphClient, config),
      phoneNumbers: new PhoneNumbersService(account)
    },
    auditLogger: options.auditLogger ?? createAuditLogger(config.logLevel),
    toolCatalog: []
  };
}

function graphClientOptions(config: AppConfig, options: ToolContextOptions): GraphClientOptions {
  return {
    accessToken: config.accessToken,
    graphApiVersion: config.graphApiVersion,
    ...(options.fetchFn ? { fetchFn: options.fetchFn } : {}),
    ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
    ...(options.maxRetries !== undefined ? { maxRetries: options.maxRetries } : {})
  };
}
