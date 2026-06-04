import { ZodError } from "zod";
import { DangerousToolDisabledError } from "../security/dangerousTools.js";
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
}

export type ToolPayload = ToolSuccess | ToolFailure;

export function successResult(data: unknown, meta?: JsonObject): McpToolResult {
  return toMcpResult({
    ok: true,
    data: toJsonValue(data),
    ...(meta ? { meta } : {})
  });
}

export function errorResult(error: unknown): McpToolResult {
  const payload: ToolFailure = {
    ok: false,
    error: safeError(error)
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
    return {
      type: error.name,
      message: error.safeMessage,
      status: error.status,
      retryable: error.retryable,
      ...(error.code ? { code: error.code } : {}),
      ...(error.requestId ? { request_id: error.requestId } : {}),
      ...(error.retryAfterSeconds !== undefined ? { retry_after_seconds: error.retryAfterSeconds } : {})
    };
  }

  if (error instanceof ZodError) {
    return {
      type: "ValidationError",
      message: "Input validation failed.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    };
  }

  if (error instanceof DangerousToolDisabledError) {
    return {
      type: error.name,
      message: error.message
    };
  }

  return {
    type: "InternalError",
    message: "The tool failed without exposing sensitive details."
  };
}
