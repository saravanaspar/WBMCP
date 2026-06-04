import type { LogLevel } from "../config/env.js";
import type { JsonObject } from "../whatsapp/types.js";
import { toJsonObject } from "../whatsapp/types.js";
import { redactSensitive } from "./redact.js";
import type { ToolPermission } from "./permissions.js";

export type AuditOutcome = "attempt" | "success" | "failure" | "blocked";

export interface AuditEvent {
  readonly toolName: string;
  readonly permission: ToolPermission;
  readonly outcome: AuditOutcome;
  readonly metadata?: JsonObject;
}

export interface AuditLogger {
  emit(event: AuditEvent): void;
}

export function createAuditLogger(logLevel: LogLevel): AuditLogger {
  return {
    emit(event) {
      if (logLevel === "silent") {
        return;
      }

      const payload = toJsonObject({
        timestamp: new Date().toISOString(),
        component: "WBMCP",
        ...event,
        metadata: redactSensitive(event.metadata ?? {})
      });

      console.error(JSON.stringify(payload));
    }
  };
}
