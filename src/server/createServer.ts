import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "../config/constants.js";
import type { AppConfig } from "../config/env.js";
import { createAuditLogger } from "../security/audit.js";
import { GraphClient } from "../whatsapp/graphClient.js";
import { AccountService } from "../whatsapp/services/account.service.js";
import { MediaService } from "../whatsapp/services/media.service.js";
import { MessagesService } from "../whatsapp/services/messages.service.js";
import { PhoneNumbersService } from "../whatsapp/services/phoneNumbers.service.js";
import { ProfileService } from "../whatsapp/services/profile.service.js";
import { TemplatesService } from "../whatsapp/services/templates.service.js";
import type { ToolContext } from "../tools/types.js";
import { registerResources } from "./registerResources.js";
import { registerTools } from "./registerTools.js";

export function createServer(config: AppConfig): McpServer {
  const graphClient = new GraphClient({
    accessToken: config.accessToken,
    graphApiVersion: config.graphApiVersion
  });
  const account = new AccountService(graphClient, config);
  const context: ToolContext = {
    config,
    services: {
      account,
      messages: new MessagesService(graphClient, config),
      media: new MediaService(graphClient),
      templates: new TemplatesService(graphClient, config),
      profile: new ProfileService(graphClient, config),
      phoneNumbers: new PhoneNumbersService(account)
    },
    auditLogger: createAuditLogger(config.logLevel),
    toolCatalog: []
  };
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  registerTools(server, context);
  registerResources(server, context);

  return server;
}
