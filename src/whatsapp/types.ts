export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface GraphPage<T extends JsonValue = JsonObject> extends JsonObject {
  readonly data: T[];
  readonly paging?: JsonObject;
}

export interface SendMessageResponse extends JsonObject {
  readonly messaging_product?: string;
  readonly contacts?: JsonObject[];
  readonly messages?: JsonObject[];
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toJsonValue(value: unknown): JsonValue {
  if (value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).flatMap(([key, item]) => {
      if (typeof item === "undefined" || typeof item === "function" || typeof item === "symbol") {
        return [];
      }
      return [[key, toJsonValue(item)] as const];
    });
    return Object.fromEntries(entries);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return null;
}

export function toJsonObject(value: unknown): JsonObject {
  const json = toJsonValue(value);
  return isJsonObject(json) ? json : { value: json };
}
