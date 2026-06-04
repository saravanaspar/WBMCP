import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { redactSensitive } from "../security/redact.js";
import { errorResult, successResult } from "../tools/toolResult.js";
import type { ToolContext } from "../tools/types.js";
import { createAccountResources } from "../resources/account.resources.js";
import { createProfileResources } from "../resources/profile.resources.js";
import { createTemplateResources } from "../resources/templates.resources.js";
import type { ResourceDefinition } from "../resources/types.js";
import { toJsonObject } from "../whatsapp/types.js";

export function createResourceDefinitions(): ResourceDefinition[] {
  return [
    ...createAccountResources(),
    ...createProfileResources(),
    ...createTemplateResources()
  ];
}

export function registerResources(server: McpServer, context: ToolContext): ResourceDefinition[] {
  const resources = createResourceDefinitions();

  for (const resource of resources) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.title,
        description: resource.description,
        mimeType: "application/json"
      },
      async (uri) => {
        try {
          const result = successResult(redactSensitive(await resource.read(context)));
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: "application/json",
                text: result.content[0].text
              }
            ]
          };
        } catch (error) {
          const result = errorResult(error);
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(toJsonObject(result.structuredContent))
              }
            ]
          };
        }
      }
    );
  }

  return resources;
}
