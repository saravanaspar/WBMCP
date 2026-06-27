import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "../config/constants.js";
import type { AppConfig } from "../config/env.js";
import type { ToolContextOptions } from "./context.js";
import { createToolContext } from "./context.js";
import { registerResources } from "./registerResources.js";
import { registerTools } from "./registerTools.js";

export function createServer(config: AppConfig, options: ToolContextOptions = {}): McpServer {
  const context = createToolContext(config, options);
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });

  registerTools(server, context);
  registerResources(server, context);

  return server;
}
