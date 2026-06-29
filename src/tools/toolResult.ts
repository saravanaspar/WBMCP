import { ZodError } from "zod";
import { ReadOnlyToolBlockedError, ToolConfirmationRequiredError } from "../security/toolGuards.js";
import { WhatsAppApiError } from "../whatsapp/errors.js";
import type { JsonObject, JsonValue } from "../whatsapp/types.js";
import { toJsonObject, toJsonValue } from "../whatsapp/types.js";

export interface McpToolResult {
  [key: string]: unknown;
  content: [
    {
      type: "text";
      text: string;
    }
  ];
  isError?: boolean;
  structuredContent?: JsonObject;
}

export interface ToolSuccess {
  readonly ok: true;
  readonly data: JsonValue;
  readonly meta?: JsonObject;
}

export interface ToolFailure {
  readonly ok: false;
  readonly error: JsonObject;
  readonly meta?: JsonObject;
}

export type ToolPayload = ToolSuccess | ToolFailure;

export function successResult(data: unknown, meta?: JsonObject): McpToolResult {
  return toMcpResult({
    ok: true,
    data: toJsonValue(data),
    ...(meta ? { meta } : {})
  });
}

export function previewResult(data: unknown, meta?: JsonObject): McpToolResult {
  return successResult(data, { mode: "dry_run", ...(meta ?? {}) });
}

export function errorResult(error: unknown, meta?: JsonObject): McpToolResult {
  const payload: ToolFailure = {
    ok: false,
    error: safeError(error),
    ...(meta ? { meta } : {})
  };
  return toMcpResult(payload, true);
}

function toMcpResult(payload: ToolPayload, isError = false): McpToolResult {
  const structuredContent = toJsonObject(payload);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent)
      }
    ],
    ...(isError ? { isError: true } : {}),
    structuredContent
  };
}

function safeError(error: unknown): JsonObject {
  if (error instanceof WhatsAppApiError) {
    const normalizedCode = normalizeWhatsAppApiErrorCode(error);
    return {
      type: error.name,
      code: normalizedCode,
      message: error.safeMessage,
      status: error.status,
      retryable: error.retryable,
      ...(error.code ? { meta_error_code: error.code } : {}),
      ...(error.requestId ? { request_id: error.requestId } : {}),
      ...(error.retryAfterSeconds !== undefined ? { retry_after_seconds: error.retryAfterSeconds } : {})
    };
  }

  if (error instanceof ZodError) {
    return {
      type: "ValidationError",
      code: validationErrorCode(error),
      message: "Input validation failed.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    };
  }

  if (error instanceof Error && error.name === "DangerousToolDisabledError") {
    return {
      type: "DangerousToolDisabledError",
      code: "dangerous_tool_disabled",
      message: error.message
    };
  }

  if (error instanceof ReadOnlyToolBlockedError) {
    return {
      type: error.name,
      code: "read_only_mode_enabled",
      message: error.message
    };
  }

  if (error instanceof ToolConfirmationRequiredError) {
    return {
      type: error.name,
      code: "confirmation_required",
      message: error.confirmationMessage,
      confirmation_required: true,
      confirmation_message: error.confirmationMessage,
      tool_name: error.toolName
    };
  }

  return {
    type: "InternalError",
    code: "internal_error",
    message: "The tool failed without exposing sensitive details."
  };
}

function validationErrorCode(error: ZodError): string {
  const joinedPaths = error.issues.map((issue) => issue.path.join(".")).join(" ");
  if (joinedPaths.includes("phone")) {
    return "invalid_phone_number";
  }
  if (joinedPaths.includes("media")) {
    return "invalid_media_reference";
  }
  if (joinedPaths.includes("template")) {
    return "invalid_template_payload";
  }
  return "validation_failed";
}

function normalizeWhatsAppApiErrorCode(error: WhatsAppApiError): string {
  if (error.status === 0) {
    return error.safeMessage.toLowerCase().includes("abort") ? "network_timeout" : "network_error";
  }
  if (error.status === 401 || error.code === "190") {
    return "invalid_credentials";
  }
  if (error.status === 403 || error.code === "10" || error.code === "200") {
    return "permission_denied";
  }
  if (error.status === 429) {
    return "rate_limited";
  }
  if (error.code === "131047") {
    return "outside_customer_service_window";
  }
  if (error.code === "132001") {
    return "template_not_found";
  }
  if (error.code === "132015" || error.safeMessage.toLowerCase().includes("template") && error.safeMessage.toLowerCase().includes("rejected")) {
    return "template_rejected";
  }
  if (error.safeMessage.toLowerCase().includes("media")) {
    return "media_upload_failed";
  }
  if (error.status >= 500) {
    return "meta_service_unavailable";
  }
  return "whatsapp_api_error";
}
