import { createHash } from "node:crypto";
import { maskPhoneNumber, stripUrlQuery } from "../whatsapp/validators.js";

const SECRET_KEY_PATTERN = /(authorization|access[_-]?token|app[_-]?secret|client[_-]?secret|password|api[_-]?key)/i;
const PHONE_KEY_PATTERN = /(phone|recipient|to|wa_id)/i;
const MESSAGE_KEY_PATTERN = /^(body|text|message|message_body|caption)$/i;
const EMAIL_PATTERN = /([A-Z0-9._%+-])([A-Z0-9._%+-]*)(@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
const PLUS_PHONE_PATTERN = /\+[1-9]\d{7,14}/g;

export function hashSensitive(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function redactSensitive(input: unknown): unknown {
  return redactValue(input);
}

export function redactKnownSecrets(value: string, secrets: readonly string[]): string {
  return secrets.reduce((current, secret) => {
    if (secret.length === 0) {
      return current;
    }
    return current.split(secret).join("[REDACTED_SECRET]");
  }, value);
}

function redactValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    return redactString(value, key);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, key));
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        redactValue(childValue, childKey)
      ])
    );
  }

  return value;
}

function redactString(value: string, key?: string): string {
  if (key && SECRET_KEY_PATTERN.test(key)) {
    return "[REDACTED_SECRET]";
  }

  if (key && MESSAGE_KEY_PATTERN.test(key)) {
    return "[REDACTED_MESSAGE]";
  }

  if (key && PHONE_KEY_PATTERN.test(key)) {
    return maskPhoneNumber(value);
  }

  let redacted = value
    .replace(BEARER_PATTERN, "Bearer [REDACTED_SECRET]")
    .replace(EMAIL_PATTERN, (_match, first: string, rest: string, domain: string) => {
      const hidden = rest.length > 0 ? "***" : "";
      return `${first}${hidden}${domain}`;
    })
    .replace(PLUS_PHONE_PATTERN, (phone) => maskPhoneNumber(phone));

  if (looksLikeUrlWithSecret(redacted)) {
    redacted = stripUrlQuery(redacted);
  }

  return redacted;
}

function looksLikeUrlWithSecret(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && url.search.length > 0;
  } catch {
    return false;
  }
}
