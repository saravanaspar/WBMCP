import { z } from "zod";
import {
  DEFAULT_GRAPH_API_VERSION,
  SUPPORTED_GRAPH_API_VERSIONS
} from "../config/constants.js";
import type { AppConfig, LogLevel } from "../config/env.js";
import { ConfigValidationError } from "../config/env.js";
import type { analyticsInputSchema } from "../schemas/analytics.schemas.js";
import type {
  catalogIdInputSchema,
  createCatalogProductInputSchema,
  listCatalogProductsInputSchema,
  listCommerceCatalogsInputSchema,
  productIdInputSchema,
  updateCatalogProductInputSchema
} from "../schemas/commerce.schemas.js";
import type {
  createFlowInputSchema,
  flowIdInputSchema,
  flowJsonInputSchema,
  listFlowsInputSchema,
  sendFlowMessageInputSchema,
  updateFlowInputSchema
} from "../schemas/flow.schemas.js";
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
  sendProductListMessageInputSchema,
  sendProductMessageInputSchema,
  sendReactionMessageInputSchema,
  sendStickerMessageInputSchema,
  sendTextMessageInputSchema,
  sendVideoMessageInputSchema
} from "../schemas/message.schemas.js";
import type {
  deregisterPhoneNumberInputSchema,
  phoneNumberIdInputSchema,
  registerPhoneNumberInputSchema,
  requestVerificationCodeInputSchema,
  twoStepPinInputSchema,
  updatePhoneNumberSettingsInputSchema,
  verifyCodeInputSchema
} from "../schemas/phone.schemas.js";
import type {
  createMessageTemplateInputSchema,
  deleteMessageTemplateInputSchema,
  getMessageTemplateInputSchema,
  listMessageTemplatesInputSchema,
  sendTemplateMessageInputSchema,
  validateTemplatePayloadInputSchema
} from "../schemas/template.schemas.js";
import type { webhookAppControlInputSchema } from "../schemas/webhook.schemas.js";
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
type SendReactionMessageSdkInput = z.input<typeof sendReactionMessageInputSchema>;
type SendStickerMessageSdkInput = z.input<typeof sendStickerMessageInputSchema>;
type SendLocationMessageSdkInput = z.input<typeof sendLocationMessageInputSchema>;
type SendContactMessageSdkInput = z.input<typeof sendContactMessageInputSchema>;
type SendInteractiveButtonsSdkInput = z.input<typeof sendInteractiveButtonsInputSchema>;
type SendInteractiveListSdkInput = z.input<typeof sendInteractiveListInputSchema>;
type SendProductMessageSdkInput = z.input<typeof sendProductMessageInputSchema>;
type SendProductListMessageSdkInput = z.input<typeof sendProductListMessageInputSchema>;
type MarkMessageAsReadSdkInput = z.input<typeof markMessageAsReadInputSchema>;
type SendTemplateMessageSdkInput = z.input<typeof sendTemplateMessageInputSchema>;
type CreateMessageTemplateSdkInput = z.input<typeof createMessageTemplateInputSchema>;
type DeleteMessageTemplateSdkInput = z.input<typeof deleteMessageTemplateInputSchema>;
type GetMessageTemplateSdkInput = z.input<typeof getMessageTemplateInputSchema>;
type ListMessageTemplatesSdkInput = z.input<typeof listMessageTemplatesInputSchema>;
type ValidateTemplatePayloadSdkInput = z.input<typeof validateTemplatePayloadInputSchema>;
type ListCommerceCatalogsSdkInput = z.input<typeof listCommerceCatalogsInputSchema>;
type CatalogIdSdkInput = z.input<typeof catalogIdInputSchema>;
type ListCatalogProductsSdkInput = z.input<typeof listCatalogProductsInputSchema>;
type ProductIdSdkInput = z.input<typeof productIdInputSchema>;
type CreateCatalogProductSdkInput = z.input<typeof createCatalogProductInputSchema>;
type UpdateCatalogProductSdkInput = z.input<typeof updateCatalogProductInputSchema>;
type RequestVerificationCodeSdkInput = z.input<typeof requestVerificationCodeInputSchema>;
type VerifyCodeSdkInput = z.input<typeof verifyCodeInputSchema>;
type RegisterPhoneNumberSdkInput = z.input<typeof registerPhoneNumberInputSchema>;
type DeregisterPhoneNumberSdkInput = z.input<typeof deregisterPhoneNumberInputSchema>;
type PhoneNumberIdSdkInput = z.input<typeof phoneNumberIdInputSchema>;
type TwoStepPinSdkInput = z.input<typeof twoStepPinInputSchema>;
type UpdatePhoneNumberSettingsSdkInput = z.input<typeof updatePhoneNumberSettingsInputSchema>;
type WebhookAppControlSdkInput = z.input<typeof webhookAppControlInputSchema>;
type ListFlowsSdkInput = z.input<typeof listFlowsInputSchema>;
type FlowIdSdkInput = z.input<typeof flowIdInputSchema>;
type CreateFlowSdkInput = z.input<typeof createFlowInputSchema>;
type UpdateFlowSdkInput = z.input<typeof updateFlowInputSchema>;
type FlowJsonSdkInput = z.input<typeof flowJsonInputSchema>;
type SendFlowMessageSdkInput = z.input<typeof sendFlowMessageInputSchema>;
type AnalyticsSdkInput = z.input<typeof analyticsInputSchema>;


export interface RedactDebugPayloadInput {
  readonly payload: unknown;
}

export interface ValidatePhoneNumberInput {
  readonly phone_number: string;
}

export interface ExplainToolPermissionsInput {
  readonly tool_name?: string;
}

export interface AgentToolOptions {
  readonly groups?: readonly ToolCatalogEntry["group"][];
  readonly includeDangerous?: boolean;
  readonly enabledOnly?: boolean;
  readonly descriptions?: "full" | "compact";
}

export interface AgentToolDescriptor extends JsonObject {
  readonly name: string;
  readonly description: string;
  readonly permission: ToolCatalogEntry["permission"];
  readonly group: ToolCatalogEntry["group"];
  readonly enabled: boolean;
  readonly dangerous: boolean;
  readonly dryRunSupported: boolean;
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
  readonly whatsapp_send_reaction_message: SendReactionMessageSdkInput;
  readonly whatsapp_send_sticker_message: SendStickerMessageSdkInput;
  readonly whatsapp_send_location_message: SendLocationMessageSdkInput;
  readonly whatsapp_send_contact_message: SendContactMessageSdkInput;
  readonly whatsapp_send_interactive_buttons: SendInteractiveButtonsSdkInput;
  readonly whatsapp_send_interactive_list: SendInteractiveListSdkInput;
  readonly whatsapp_send_product_message: SendProductMessageSdkInput;
  readonly whatsapp_send_product_list_message: SendProductListMessageSdkInput;
  readonly whatsapp_send_flow_message: SendFlowMessageSdkInput;
  readonly whatsapp_mark_message_as_read: MarkMessageAsReadSdkInput;
  readonly whatsapp_list_message_templates: ListMessageTemplatesSdkInput;
  readonly whatsapp_get_message_template: GetMessageTemplateSdkInput;
  readonly whatsapp_create_message_template: CreateMessageTemplateSdkInput;
  readonly whatsapp_delete_message_template: DeleteMessageTemplateSdkInput;
  readonly whatsapp_validate_template_payload: ValidateTemplatePayloadSdkInput;
  readonly whatsapp_get_media: MediaIdInput;
  readonly whatsapp_delete_media: MediaIdInput;
  readonly whatsapp_list_catalogs: ListCommerceCatalogsSdkInput;
  readonly whatsapp_get_catalog: CatalogIdSdkInput;
  readonly whatsapp_list_catalog_products: ListCatalogProductsSdkInput;
  readonly whatsapp_get_catalog_product: ProductIdSdkInput;
  readonly whatsapp_create_catalog_product: CreateCatalogProductSdkInput;
  readonly whatsapp_update_catalog_product: UpdateCatalogProductSdkInput;
  readonly whatsapp_delete_catalog_product: ProductIdSdkInput;
  readonly whatsapp_request_phone_verification_code: RequestVerificationCodeSdkInput;
  readonly whatsapp_verify_phone_code: VerifyCodeSdkInput;
  readonly whatsapp_register_phone_number: RegisterPhoneNumberSdkInput;
  readonly whatsapp_deregister_phone_number: DeregisterPhoneNumberSdkInput;
  readonly whatsapp_set_two_step_pin: TwoStepPinSdkInput;
  readonly whatsapp_get_phone_number_settings: PhoneNumberIdSdkInput;
  readonly whatsapp_update_phone_number_settings: UpdatePhoneNumberSettingsSdkInput;
  readonly whatsapp_list_subscribed_apps: WebhookAppControlSdkInput;
  readonly whatsapp_subscribe_app: WebhookAppControlSdkInput;
  readonly whatsapp_unsubscribe_app: WebhookAppControlSdkInput;
  readonly whatsapp_list_flows: ListFlowsSdkInput;
  readonly whatsapp_get_flow: FlowIdSdkInput;
  readonly whatsapp_create_flow: CreateFlowSdkInput;
  readonly whatsapp_update_flow: UpdateFlowSdkInput;
  readonly whatsapp_update_flow_json: FlowJsonSdkInput;
  readonly whatsapp_publish_flow: FlowIdSdkInput;
  readonly whatsapp_deprecate_flow: FlowIdSdkInput;
  readonly whatsapp_delete_flow: FlowIdSdkInput;
  readonly whatsapp_get_conversation_analytics: AnalyticsSdkInput;
  readonly whatsapp_get_template_analytics: AnalyticsSdkInput;
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

  public readonly tools: WhatsAppSdkToolMethods;

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

  public readonly agent = {
    tools: (options: AgentToolOptions = {}) => this.toolsForAgent(options),
    capabilities: () => this.capabilities(),
    systemPrompt: () => this.systemPrompt()
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
    this.tools = createSdkToolMethods(this);
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

  public async tryCallTool<TName extends WhatsAppToolName>(
    name: TName,
    input: WhatsAppSdkToolInputs[TName]
  ): Promise<ToolPayload> {
    return this.callTool(name, input);
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

  public toolsForAgent(options: AgentToolOptions = {}): AgentToolDescriptor[] {
    const groups = new Set(options.groups ?? []);
    return this.context.toolCatalog
      .filter((tool) => groups.size === 0 || groups.has(tool.group))
      .filter((tool) => options.includeDangerous === true || !tool.dangerous)
      .filter((tool) => options.enabledOnly !== true || tool.enabled)
      .map((tool) => ({
        name: tool.name,
        description: options.descriptions === "compact" ? compactDescription(tool) : tool.description,
        permission: tool.permission,
        group: tool.group,
        enabled: tool.enabled,
        dangerous: tool.dangerous,
        dryRunSupported: tool.dryRunSupported
      }));
  }

  public capabilities(): JsonObject {
    return {
      tools: this.context.toolCatalog.length,
      enabled_tools: this.context.toolCatalog.filter((tool) => tool.enabled).length,
      dangerous_tools: this.context.toolCatalog.filter((tool) => tool.dangerous).length,
      groups: [...new Set(this.context.toolCatalog.map((tool) => tool.group))],
      safety: {
        dangerous_tools_enabled: this.context.config.enableDangerousTools,
        read_only: this.context.config.readOnly,
        confirmation_required: this.context.config.requireConfirmation
      }
    };
  }

  public systemPrompt(): string {
    const safety = this.context.config;
    return [
      "Use WhatsApp Business tools conservatively.",
      "Prefer read-only checks before sending, deleting, publishing, or updating external WhatsApp state.",
      "Use dryRun previews for send tools before final sends.",
      safety.requireConfirmation
        ? "Pass confirm: true only after explicit operator approval."
        : "Ask for explicit operator approval before dangerous actions.",
      "Never reveal access tokens, app secrets, full phone numbers, or raw private message bodies."
    ].join(" ");
  }
}

function compactDescription(tool: ToolCatalogEntry): string {
  const mode = tool.dangerous ? "Mutates WhatsApp state" : "Reads WhatsApp state";
  const dryRun = tool.dryRunSupported ? " Supports dryRun." : "";
  return `${mode}: ${tool.title}.${dryRun}`;
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

function createSdkToolMethods(client: WhatsAppBusinessClient): WhatsAppSdkToolMethods {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (typeof property !== "string" || !client.getToolDefinition(property)) {
          return undefined;
        }

        return (input: unknown) => client.callTool(property as WhatsAppToolName, input as WhatsAppSdkToolInputs[WhatsAppToolName]);
      }
    }
  ) as WhatsAppSdkToolMethods;
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
