import { z } from "zod";
import {
  DEFAULT_GRAPH_API_VERSION,
  SUPPORTED_GRAPH_API_VERSIONS
} from "../config/constants.js";
import type { AppConfig, LogLevel } from "../config/env.js";
import { ConfigValidationError } from "../config/env.js";
import type { MediaIdInput } from "../schemas/media.schemas.js";
import type {
  markMessageAsReadInputSchema,
  sendAudioMessageInputSchema,
  sendContactMessageInputSchema,
  sendDocumentMessageInputSchema,
  sendImageMessageInputSchema,
  sendInteractiveButtonsInputSchema,
  sendInteractiveListInputSchema,
  sendLocationMessageInputSchema,
  sendTextMessageInputSchema,
  sendVideoMessageInputSchema
} from "../schemas/message.schemas.js";
import type {
  createMessageTemplateInputSchema,
  deleteMessageTemplateInputSchema,
  getMessageTemplateInputSchema,
  listMessageTemplatesInputSchema,
  sendTemplateMessageInputSchema,
  validateTemplatePayloadInputSchema
} from "../schemas/template.schemas.js";
import { createToolContext, type ToolContextOptions } from "../server/context.js";
import { createToolCatalog, createToolDefinitions, invokeTool } from "../server/registerTools.js";
import type { McpToolResult, ToolPayload } from "../tools/toolResult.js";
import type { ToolCatalogEntry, ToolContext, ToolDefinition } from "../tools/types.js";
import { isJsonObject, type JsonObject, type JsonValue, type SendMessageResponse } from "../whatsapp/types.js";
import type { UpdateBusinessProfileInput } from "../whatsapp/services/profile.service.js";

export type EmptyInput = Record<string, never>;

type SendTextMessageSdkInput = z.input<typeof sendTextMessageInputSchema>;
type SendImageMessageSdkInput = z.input<typeof sendImageMessageInputSchema>;
type SendDocumentMessageSdkInput = z.input<typeof sendDocumentMessageInputSchema>;
type SendAudioMessageSdkInput = z.input<typeof sendAudioMessageInputSchema>;
type SendVideoMessageSdkInput = z.input<typeof sendVideoMessageInputSchema>;
type SendLocationMessageSdkInput = z.input<typeof sendLocationMessageInputSchema>;
type SendContactMessageSdkInput = z.input<typeof sendContactMessageInputSchema>;
type SendInteractiveButtonsSdkInput = z.input<typeof sendInteractiveButtonsInputSchema>;
type SendInteractiveListSdkInput = z.input<typeof sendInteractiveListInputSchema>;
type MarkMessageAsReadSdkInput = z.input<typeof markMessageAsReadInputSchema>;
type SendTemplateMessageSdkInput = z.input<typeof sendTemplateMessageInputSchema>;
type CreateMessageTemplateSdkInput = z.input<typeof createMessageTemplateInputSchema>;
type DeleteMessageTemplateSdkInput = z.input<typeof deleteMessageTemplateInputSchema>;
type GetMessageTemplateSdkInput = z.input<typeof getMessageTemplateInputSchema>;
type ListMessageTemplatesSdkInput = z.input<typeof listMessageTemplatesInputSchema>;
type ValidateTemplatePayloadSdkInput = z.input<typeof validateTemplatePayloadInputSchema>;


export interface RedactDebugPayloadInput {
  readonly payload: unknown;
}

export interface ValidatePhoneNumberInput {
  readonly phone_number: string;
}

export interface ExplainToolPermissionsInput {
  readonly tool_name?: string;
}

export interface WhatsAppBusinessClientConfig {
  readonly accessToken: string;
  readonly phoneNumberId: string;
  readonly businessAccountId: string;
  readonly graphApiVersion?: AppConfig["graphApiVersion"];
  readonly appSecret?: string;
  readonly logLevel?: LogLevel;
  readonly enableDangerousTools?: boolean;
  readonly readOnly?: boolean;
  readonly requireConfirmation?: boolean;
}

export type WhatsAppBusinessClientOptions = ToolContextOptions;

export interface WhatsAppSdkToolInputs {
  readonly whatsapp_health_check: EmptyInput;
  readonly whatsapp_get_business_account: EmptyInput;
  readonly whatsapp_get_phone_number: EmptyInput;
  readonly whatsapp_list_phone_numbers: ListPhoneNumbersInput;
  readonly whatsapp_get_business_profile: EmptyInput;
  readonly whatsapp_update_business_profile: UpdateBusinessProfileInput;
  readonly whatsapp_send_text_message: SendTextMessageSdkInput;
  readonly whatsapp_send_template_message: SendTemplateMessageSdkInput;
  readonly whatsapp_send_image_message: SendImageMessageSdkInput;
  readonly whatsapp_send_document_message: SendDocumentMessageSdkInput;
  readonly whatsapp_send_audio_message: SendAudioMessageSdkInput;
  readonly whatsapp_send_video_message: SendVideoMessageSdkInput;
  readonly whatsapp_send_location_message: SendLocationMessageSdkInput;
  readonly whatsapp_send_contact_message: SendContactMessageSdkInput;
  readonly whatsapp_send_interactive_buttons: SendInteractiveButtonsSdkInput;
  readonly whatsapp_send_interactive_list: SendInteractiveListSdkInput;
  readonly whatsapp_mark_message_as_read: MarkMessageAsReadSdkInput;
  readonly whatsapp_list_message_templates: ListMessageTemplatesSdkInput;
  readonly whatsapp_get_message_template: GetMessageTemplateSdkInput;
  readonly whatsapp_create_message_template: CreateMessageTemplateSdkInput;
  readonly whatsapp_delete_message_template: DeleteMessageTemplateSdkInput;
  readonly whatsapp_validate_template_payload: ValidateTemplatePayloadSdkInput;
  readonly whatsapp_get_media: MediaIdInput;
  readonly whatsapp_delete_media: MediaIdInput;
  readonly whatsapp_redact_debug_payload: RedactDebugPayloadInput;
  readonly whatsapp_validate_phone_number: ValidatePhoneNumberInput;
  readonly whatsapp_explain_tool_permissions: ExplainToolPermissionsInput;
  readonly whatsapp_list_available_tools: EmptyInput;
  readonly whatsapp_get_prompt_snippets: EmptyInput;
}

export type WhatsAppToolName = keyof WhatsAppSdkToolInputs;

export type WhatsAppSdkToolMethods = {
  readonly [TName in WhatsAppToolName]: (input: WhatsAppSdkToolInputs[TName]) => Promise<ToolPayload>;
};

export interface ListPhoneNumbersInput {
  readonly limit?: number;
  readonly after?: string;
}

export class WhatsAppSdkToolError extends Error {
  public readonly error: JsonObject;

  public constructor(error: JsonObject) {
    const message = typeof error.message === "string" ? error.message : "WhatsApp SDK tool call failed.";
    super(message);
    this.name = typeof error.type === "string" ? error.type : "WhatsAppSdkToolError";
    this.error = error;
  }
}

const sdkConfigSchema = z
  .object({
    accessToken: z.string().trim().min(1, "is required"),
    phoneNumberId: z.string().trim().regex(/^\d{5,32}$/, "must be a Meta phone number ID"),
    businessAccountId: z.string().trim().regex(/^\d{5,32}$/, "must be a Meta business account ID"),
    graphApiVersion: z.enum(SUPPORTED_GRAPH_API_VERSIONS).default(DEFAULT_GRAPH_API_VERSION),
    appSecret: z.string().trim().min(1).optional(),
    logLevel: z.enum(["silent", "error", "warn", "info", "debug"]).default("silent"),
    enableDangerousTools: z.boolean().default(false),
    readOnly: z.boolean().default(false),
    requireConfirmation: z.boolean().default(false)
  })
  .strict();

export function createWhatsAppBusinessClient(
  config: WhatsAppBusinessClientConfig,
  options: WhatsAppBusinessClientOptions = {}
): WhatsAppBusinessClient {
  return new WhatsAppBusinessClient(config, options);
}

export class WhatsAppBusinessClient {
  private readonly context: ToolContext;
  private readonly definitions: readonly ToolDefinition[];
  private readonly toolsByName: ReadonlyMap<string, ToolDefinition>;

  public readonly tools: WhatsAppSdkToolMethods = {
    whatsapp_health_check: (input) => this.callTool("whatsapp_health_check", input),
    whatsapp_get_business_account: (input) => this.callTool("whatsapp_get_business_account", input),
    whatsapp_get_phone_number: (input) => this.callTool("whatsapp_get_phone_number", input),
    whatsapp_list_phone_numbers: (input) => this.callTool("whatsapp_list_phone_numbers", input),
    whatsapp_get_business_profile: (input) => this.callTool("whatsapp_get_business_profile", input),
    whatsapp_update_business_profile: (input) => this.callTool("whatsapp_update_business_profile", input),
    whatsapp_send_text_message: (input) => this.callTool("whatsapp_send_text_message", input),
    whatsapp_send_template_message: (input) => this.callTool("whatsapp_send_template_message", input),
    whatsapp_send_image_message: (input) => this.callTool("whatsapp_send_image_message", input),
    whatsapp_send_document_message: (input) => this.callTool("whatsapp_send_document_message", input),
    whatsapp_send_audio_message: (input) => this.callTool("whatsapp_send_audio_message", input),
    whatsapp_send_video_message: (input) => this.callTool("whatsapp_send_video_message", input),
    whatsapp_send_location_message: (input) => this.callTool("whatsapp_send_location_message", input),
    whatsapp_send_contact_message: (input) => this.callTool("whatsapp_send_contact_message", input),
    whatsapp_send_interactive_buttons: (input) => this.callTool("whatsapp_send_interactive_buttons", input),
    whatsapp_send_interactive_list: (input) => this.callTool("whatsapp_send_interactive_list", input),
    whatsapp_mark_message_as_read: (input) => this.callTool("whatsapp_mark_message_as_read", input),
    whatsapp_list_message_templates: (input) => this.callTool("whatsapp_list_message_templates", input),
    whatsapp_get_message_template: (input) => this.callTool("whatsapp_get_message_template", input),
    whatsapp_create_message_template: (input) => this.callTool("whatsapp_create_message_template", input),
    whatsapp_delete_message_template: (input) => this.callTool("whatsapp_delete_message_template", input),
    whatsapp_validate_template_payload: (input) => this.callTool("whatsapp_validate_template_payload", input),
    whatsapp_get_media: (input) => this.callTool("whatsapp_get_media", input),
    whatsapp_delete_media: (input) => this.callTool("whatsapp_delete_media", input),
    whatsapp_redact_debug_payload: (input) => this.callTool("whatsapp_redact_debug_payload", input),
    whatsapp_validate_phone_number: (input) => this.callTool("whatsapp_validate_phone_number", input),
    whatsapp_explain_tool_permissions: (input) => this.callTool("whatsapp_explain_tool_permissions", input),
    whatsapp_list_available_tools: (input) => this.callTool("whatsapp_list_available_tools", input),
    whatsapp_get_prompt_snippets: (input) => this.callTool("whatsapp_get_prompt_snippets", input)
  };

  public readonly account = {
    healthCheck: () => this.callToolDataAs<JsonObject>("whatsapp_health_check", {}),
    getBusinessAccount: () => this.callToolDataAs<JsonObject>("whatsapp_get_business_account", {}),
    getPhoneNumber: () => this.callToolDataAs<JsonObject>("whatsapp_get_phone_number", {}),
    listPhoneNumbers: (input: ListPhoneNumbersInput = {}) =>
      this.callToolDataAs<JsonObject>("whatsapp_list_phone_numbers", input)
  };

  public readonly profile = {
    getBusinessProfile: () => this.callToolDataAs<JsonObject>("whatsapp_get_business_profile", {}),
    updateBusinessProfile: (input: UpdateBusinessProfileInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_update_business_profile", input)
  };

  public readonly messages = {
    sendText: (input: SendTextMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_text_message", input),
    sendTemplate: (input: SendTemplateMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_template_message", input),
    sendImage: (input: SendImageMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_image_message", input),
    sendDocument: (input: SendDocumentMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_document_message", input),
    sendAudio: (input: SendAudioMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_audio_message", input),
    sendVideo: (input: SendVideoMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_video_message", input),
    sendLocation: (input: SendLocationMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_location_message", input),
    sendContact: (input: SendContactMessageSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_contact_message", input),
    sendInteractiveButtons: (input: SendInteractiveButtonsSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_interactive_buttons", input),
    sendInteractiveList: (input: SendInteractiveListSdkInput) =>
      this.callToolDataAs<SendMessageResponse>("whatsapp_send_interactive_list", input),
    markMessageAsRead: (input: MarkMessageAsReadSdkInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_mark_message_as_read", input)
  };

  public readonly templates = {
    listMessageTemplates: (input: ListMessageTemplatesSdkInput = {}) =>
      this.callToolDataAs<JsonObject>("whatsapp_list_message_templates", input),
    getMessageTemplate: (input: GetMessageTemplateSdkInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_get_message_template", input),
    createMessageTemplate: (input: CreateMessageTemplateSdkInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_create_message_template", input),
    deleteMessageTemplate: (input: DeleteMessageTemplateSdkInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_delete_message_template", input),
    validateTemplatePayload: (input: ValidateTemplatePayloadSdkInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_validate_template_payload", input)
  };

  public readonly media = {
    getMedia: (input: MediaIdInput) => this.callToolDataAs<JsonObject>("whatsapp_get_media", input),
    deleteMedia: (input: MediaIdInput) => this.callToolDataAs<JsonObject>("whatsapp_delete_media", input)
  };

  public readonly safety = {
    redactDebugPayload: (input: RedactDebugPayloadInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_redact_debug_payload", input),
    validatePhoneNumber: (input: ValidatePhoneNumberInput) =>
      this.callToolDataAs<JsonObject>("whatsapp_validate_phone_number", input),
    explainToolPermissions: (input: ExplainToolPermissionsInput = {}) =>
      this.callToolDataAs<JsonObject>("whatsapp_explain_tool_permissions", input),
    listAvailableTools: () => this.callToolDataAs<JsonObject>("whatsapp_list_available_tools", {}),
    getPromptSnippets: () => this.callToolDataAs<JsonObject>("whatsapp_get_prompt_snippets", {})
  };

  public constructor(config: WhatsAppBusinessClientConfig, options: WhatsAppBusinessClientOptions = {}) {
    const appConfig = toAppConfig(config);
    this.definitions = createToolDefinitions();
    this.context = createToolContext(appConfig, options);
    this.context.toolCatalog = createToolCatalog(this.definitions, appConfig);
    this.toolsByName = new Map(this.definitions.map((definition) => [definition.name, definition]));
  }

  public listTools(): ToolCatalogEntry[] {
    return [...this.context.toolCatalog];
  }

  public getToolDefinition(name: string): ToolDefinition | undefined {
    return this.toolsByName.get(name);
  }

  public async callTool<TName extends WhatsAppToolName>(
    name: TName,
    input: WhatsAppSdkToolInputs[TName]
  ): Promise<ToolPayload> {
    const tool = this.toolsByName.get(name);
    if (!tool) {
      throw new Error(`Unknown WhatsApp MCP tool: ${name}`);
    }

    const result = await invokeTool(tool, input, this.context);
    return extractToolPayload(result);
  }

  public async callToolData<TName extends WhatsAppToolName>(
    name: TName,
    input: WhatsAppSdkToolInputs[TName]
  ): Promise<JsonValue> {
    const payload = await this.callTool(name, input);
    if (payload.ok) {
      return payload.data;
    }

    throw new WhatsAppSdkToolError(payload.error);
  }

  private async callToolDataAs<TData extends JsonValue, TName extends WhatsAppToolName = WhatsAppToolName>(
    name: TName,
    input: WhatsAppSdkToolInputs[TName]
  ): Promise<TData> {
    return (await this.callToolData(name, input)) as TData;
  }
}

function toAppConfig(config: WhatsAppBusinessClientConfig): AppConfig {
  const parsed = sdkConfigSchema.safeParse(config);
  if (!parsed.success) {
    throw new ConfigValidationError(
      parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    );
  }

  return {
    accessToken: parsed.data.accessToken,
    phoneNumberId: parsed.data.phoneNumberId,
    businessAccountId: parsed.data.businessAccountId,
    graphApiVersion: parsed.data.graphApiVersion,
    appSecret: parsed.data.appSecret,
    logLevel: parsed.data.logLevel,
    enableDangerousTools: parsed.data.enableDangerousTools,
    readOnly: parsed.data.readOnly,
    requireConfirmation: parsed.data.requireConfirmation,
    transport: { mode: "stdio" }
  };
}

function extractToolPayload(result: McpToolResult): ToolPayload {
  if (isToolPayload(result.structuredContent)) {
    return result.structuredContent;
  }

  throw new Error("WhatsApp MCP tool returned an invalid SDK payload.");
}

function isToolPayload(value: unknown): value is ToolPayload {
  if (!isJsonObject(value) || typeof value.ok !== "boolean") {
    return false;
  }

  if (value.ok) {
    return "data" in value;
  }

  return isJsonObject(value.error);
}
