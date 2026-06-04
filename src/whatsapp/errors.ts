import { redactSensitive } from "../security/redact.js";
import type { JsonObject } from "./types.js";
import { isJsonObject } from "./types.js";

export interface WhatsAppApiErrorOptions {
  readonly status: number;
  readonly code?: string | undefined;
  readonly safeMessage: string;
  readonly requestId?: string | undefined;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number | undefined;
}

export class WhatsAppApiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly safeMessage: string;
  public readonly requestId: string | undefined;
  public readonly retryable: boolean;
  public readonly retryAfterSeconds: number | undefined;

  public constructor(options: WhatsAppApiErrorOptions) {
    super(options.safeMessage);
    this.name = "WhatsAppApiError";
    this.status = options.status;
    this.code = options.code;
    this.safeMessage = options.safeMessage;
    this.requestId = options.requestId;
    this.retryable = options.retryable;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }

  public toSafeJson(): JsonObject {
    const base: Record<string, string | number | boolean> = {
      status: this.status,
      safeMessage: this.safeMessage,
      retryable: this.retryable
    };
    if (this.code) {
      base.code = this.code;
    }
    if (this.requestId) {
      base.requestId = this.requestId;
    }
    if (this.retryAfterSeconds !== undefined) {
      base.retryAfterSeconds = this.retryAfterSeconds;
    }
    return base;
  }
}

export function safeErrorMessage(error: unknown): string {
  if (error instanceof WhatsAppApiError) {
    return error.safeMessage;
  }

  if (error instanceof Error) {
    return String(redactSensitive(error.message));
  }

  if (isJsonObject(error)) {
    return JSON.stringify(redactSensitive(error));
  }

  return "Unknown error";
}
