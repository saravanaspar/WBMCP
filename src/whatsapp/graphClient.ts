import {
  DEFAULT_HTTP_TIMEOUT_MS,
  DEFAULT_MAX_RETRIES,
  GRAPH_API_BASE_URL
} from "../config/constants.js";
import { redactKnownSecrets, redactSensitive } from "../security/redact.js";
import { WhatsAppApiError } from "./errors.js";
import type { JsonObject, JsonValue } from "./types.js";
import { isJsonObject, toJsonObject } from "./types.js";

type FetchLike = typeof fetch;
type HttpMethod = "GET" | "POST" | "DELETE";

export interface GraphClientOptions {
  readonly accessToken: string;
  readonly graphApiVersion: string;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly fetchFn?: FetchLike;
}

export interface RequestOptions {
  readonly query?: Record<string, string | number | boolean | undefined> | undefined;
  readonly body?: JsonObject | undefined;
  readonly formData?: FormData | undefined;
}

export class GraphClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly fetchFn: FetchLike;

  public constructor(private readonly options: GraphClientOptions) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  public async get<T extends JsonValue = JsonObject>(
    path: string,
    query?: RequestOptions["query"]
  ): Promise<T> {
    return this.request<T>("GET", path, { query });
  }

  public async postJson<T extends JsonValue = JsonObject>(path: string, body: JsonObject): Promise<T> {
    return this.request<T>("POST", path, { body });
  }

  public async postForm<T extends JsonValue = JsonObject>(path: string, formData: FormData): Promise<T> {
    return this.request<T>("POST", path, { formData });
  }

  public async delete<T extends JsonValue = JsonObject>(
    path: string,
    query?: RequestOptions["query"]
  ): Promise<T> {
    return this.request<T>("DELETE", path, { query });
  }

  private async request<T extends JsonValue>(
    method: HttpMethod,
    path: string,
    options: RequestOptions
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        return await this.requestOnce<T>(method, path, options);
      } catch (error) {
        const retryable = isRetryableError(error) && isRetrySafe(method);
        if (!retryable || attempt === this.maxRetries) {
          throw error;
        }
        await sleep(100 * 2 ** attempt);
      }
    }

    throw new WhatsAppApiError({
      status: 0,
      safeMessage: "Graph API retry loop exited unexpectedly.",
      retryable: false
    });
  }

  private async requestOnce<T extends JsonValue>(
    method: HttpMethod,
    path: string,
    options: RequestOptions
  ): Promise<T> {
    const init: RequestInit = {
      method,
      headers: this.headers(options)
    };
    if (options.formData) {
      init.body = options.formData;
    } else if (options.body) {
      init.body = JSON.stringify(options.body);
    }

    const response = await this.fetchWithTimeout(this.buildUrl(path, options.query), init);
    const parsed = await parseJsonResponse(response);

    if (!response.ok) {
      throw buildApiError(response, parsed, this.options.accessToken);
    }

    return parsed as T;
  }

  private async fetchWithTimeout(url: URL, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    try {
      return await this.fetchFn(url, { ...init, signal: controller.signal });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network request failed";
      throw new WhatsAppApiError({
        status: 0,
        safeMessage: String(redactSensitive(message)),
        retryable: true
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private headers(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.options.accessToken}`
    };

    if (!options.formData) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  private buildUrl(path: string, query?: RequestOptions["query"]): URL {
    const safePath = path.startsWith("/") ? path.slice(1) : path;
    if (safePath.includes("://")) {
      throw new WhatsAppApiError({
        status: 0,
        safeMessage: "Refusing to call an absolute Graph API path.",
        retryable: false
      });
    }

    const url = new URL(`${GRAPH_API_BASE_URL}/${this.options.graphApiVersion}/${safePath}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url;
  }
}

async function parseJsonResponse(response: Response): Promise<JsonObject> {
  const text = await response.text();
  if (text.length === 0) {
    return {};
  }

  try {
    return toJsonObject(JSON.parse(text));
  } catch {
    return { message: "Meta Graph API returned a non-JSON response." };
  }
}

function buildApiError(response: Response, payload: JsonObject, accessToken: string): WhatsAppApiError {
  const metaError = isJsonObject(payload.error) ? payload.error : {};
  const message = typeof metaError.message === "string" ? metaError.message : `Meta Graph API request failed with HTTP ${response.status}.`;
  const code = typeof metaError.code === "number" || typeof metaError.code === "string" ? String(metaError.code) : undefined;
  const fbTraceId = response.headers.get("x-fb-trace-id");
  const requestId = fbTraceId ?? (typeof metaError.fbtrace_id === "string" ? metaError.fbtrace_id : undefined);

  return new WhatsAppApiError({
    status: response.status,
    code,
    safeMessage: String(redactSensitive(redactKnownSecrets(message, [accessToken]))),
    requestId,
    retryable: response.status === 429 || response.status >= 500,
    retryAfterSeconds: parseRetryAfterSeconds(response.headers.get("retry-after"))
  });
}

function parseRetryAfterSeconds(headerValue: string | null): number | undefined {
  if (!headerValue) {
    return undefined;
  }

  const numericValue = Number(headerValue);
  if (Number.isFinite(numericValue) && numericValue >= 0) {
    return Math.ceil(numericValue);
  }

  const dateValue = Date.parse(headerValue);
  if (Number.isNaN(dateValue)) {
    return undefined;
  }

  return Math.max(Math.ceil((dateValue - Date.now()) / 1000), 0);
}

function isRetryableError(error: unknown): boolean {
  return error instanceof WhatsAppApiError && error.retryable;
}

function isRetrySafe(method: HttpMethod): boolean {
  return method === "GET";
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
