import type { z } from "zod";
import type { AppConfig } from "../config/env.js";
import type { AuditLogger } from "../security/audit.js";
import type { ToolPermission } from "../security/permissions.js";
import type { AccountService } from "../whatsapp/services/account.service.js";
import type { MediaService } from "../whatsapp/services/media.service.js";
import type { MessagesService } from "../whatsapp/services/messages.service.js";
import type { PhoneNumbersService } from "../whatsapp/services/phoneNumbers.service.js";
import type { ProfileService } from "../whatsapp/services/profile.service.js";
import type { TemplatesService } from "../whatsapp/services/templates.service.js";
import type { JsonObject } from "../whatsapp/types.js";
import type { McpToolResult } from "./toolResult.js";

export interface ToolServices {
  readonly account: AccountService;
  readonly messages: MessagesService;
  readonly media: MediaService;
  readonly templates: TemplatesService;
  readonly profile: ProfileService;
  readonly phoneNumbers: PhoneNumbersService;
}

export interface ToolCatalogEntry extends JsonObject {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly permission: ToolPermission;
  readonly dangerous: boolean;
  readonly enabled: boolean;
}

export interface ToolContext {
  readonly config: AppConfig;
  readonly services: ToolServices;
  readonly auditLogger: AuditLogger;
  toolCatalog: ToolCatalogEntry[];
}

type ToolExecution = McpToolResult | Promise<McpToolResult>;

export interface ToolDefinition {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly inputSchema: z.ZodType;
  readonly inputShape: z.ZodRawShape;
  readonly permission: ToolPermission;
  readonly idempotent?: boolean;
  readonly execute: (input: unknown, context: ToolContext) => Promise<McpToolResult>;
}

interface TypedToolDefinition<TInput> {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly inputSchema: z.ZodType<TInput>;
  readonly inputShape: z.ZodRawShape;
  readonly permission: ToolPermission;
  readonly idempotent?: boolean;
  readonly execute: (input: TInput, context: ToolContext) => ToolExecution;
}

export function defineTool<TInput>(definition: TypedToolDefinition<TInput>): ToolDefinition {
  return {
    ...definition,
    inputSchema: definition.inputSchema,
    execute: (input, context) => Promise.resolve(definition.execute(input as TInput, context))
  };
}
