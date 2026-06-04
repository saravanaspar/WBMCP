import { z } from "zod";
import { readStoredConfigSync, storedConfigToEnv } from "../cli/configFile.js";
import {
  DEFAULT_GRAPH_API_VERSION,
  DEFAULT_MCP_HTTPS_HOST,
  DEFAULT_MCP_HTTPS_MAX_BODY_BYTES,
  DEFAULT_MCP_HTTPS_MAX_SESSIONS,
  DEFAULT_MCP_HTTPS_PATH,
  DEFAULT_MCP_HTTPS_PORT,
  DEFAULT_MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS,
  SUPPORTED_GRAPH_API_VERSIONS,
} from "./constants.js";

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";
export type McpTransportMode = "stdio" | "https";

export interface HttpsTransportConfig {
  mode: "https";
  host: string;
  port: number;
  path: string;
  authToken: string;
  maxBodyBytes: number;
  tlsCertFile: string;
  tlsKeyFile: string;
  maxSessions: number;
  sessionIdleTimeoutMs: number;
}

export type TransportConfig =
  | {
      mode: "stdio";
    }
  | HttpsTransportConfig;

export interface AppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  graphApiVersion: (typeof SUPPORTED_GRAPH_API_VERSIONS)[number];
  appSecret: string | undefined;
  logLevel: LogLevel;
  enableDangerousTools: boolean;
  transport: TransportConfig;
}

export class ConfigValidationError extends Error {
  public readonly issues: readonly string[];

  public constructor(issues: readonly string[]) {
    super(`Invalid environment configuration: ${issues.join("; ")}`);
    this.name = "ConfigValidationError";
    this.issues = issues;
  }
}

const booleanFromEnv = z
  .enum(["true", "false", "1", "0", "yes", "no"])
  .optional()
  .transform((value) => value === "true" || value === "1" || value === "yes");

const portFromEnv = z.coerce.number().int().min(1).max(65_535).optional();
const bodyLimitFromEnv = z.coerce
  .number()
  .int()
  .min(1_024)
  .max(10_485_760)
  .optional();
const maxSessionsFromEnv = z.coerce.number().int().min(1).max(10_000).optional();
const idleTimeoutFromEnv = z.coerce.number().int().min(1_000).max(86_400_000).optional();

const httpsPathSchema = z
  .string()
  .trim()
  .default(DEFAULT_MCP_HTTPS_PATH)
  .refine((value) => value.startsWith("/"), "must start with /")
  .refine((value) => !value.includes(".."), "must not contain path traversal segments");

const envSchema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().trim().min(1, "is required"),
  WHATSAPP_PHONE_NUMBER_ID: z.string().trim().regex(/^\d{5,32}$/, "must be a Meta phone number ID"),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().trim().regex(/^\d{5,32}$/, "must be a Meta business account ID"),
  WHATSAPP_GRAPH_API_VERSION: z.enum(SUPPORTED_GRAPH_API_VERSIONS).default(DEFAULT_GRAPH_API_VERSION),
  WHATSAPP_APP_SECRET: z.string().trim().min(1).optional(),
  MCP_LOG_LEVEL: z.enum(["silent", "error", "warn", "info", "debug"]).default("info"),
  MCP_ENABLE_DANGEROUS_TOOLS: booleanFromEnv,
  MCP_TRANSPORT: z.enum(["stdio", "https"]).default("stdio"),
  MCP_HTTPS_HOST: z.string().trim().min(1).default(DEFAULT_MCP_HTTPS_HOST),
  MCP_HTTPS_PORT: portFromEnv,
  MCP_HTTPS_PATH: httpsPathSchema,
  MCP_HTTPS_AUTH_TOKEN: z.string().trim().min(32).optional(),
  MCP_HTTPS_MAX_BODY_BYTES: bodyLimitFromEnv,
  MCP_HTTPS_CERT_FILE: z.string().trim().min(1).optional(),
  MCP_HTTPS_KEY_FILE: z.string().trim().min(1).optional(),
  MCP_HTTPS_MAX_SESSIONS: maxSessionsFromEnv,
  MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS: idleTimeoutFromEnv
});

export function loadEnv(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const mergedEnv = mergeConfigFileWithEnv(env);
  const parsed = envSchema.safeParse(mergedEnv);
  if (!parsed.success) {
    throw new ConfigValidationError(
      parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    );
  }

  return {
    accessToken: parsed.data.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: parsed.data.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: parsed.data.WHATSAPP_BUSINESS_ACCOUNT_ID,
    graphApiVersion: parsed.data.WHATSAPP_GRAPH_API_VERSION,
    appSecret: parsed.data.WHATSAPP_APP_SECRET,
    logLevel: parsed.data.MCP_LOG_LEVEL,
    enableDangerousTools: parsed.data.MCP_ENABLE_DANGEROUS_TOOLS,
    transport: buildTransportConfig(parsed.data)
  };
}

type ParsedEnv = z.infer<typeof envSchema>;

function mergeConfigFileWithEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const configEnv = storedConfigToEnv(readStoredConfigSync(env));
  const mergedEnv: NodeJS.ProcessEnv = { ...configEnv };

  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      mergedEnv[key] = value;
    }
  }

  return mergedEnv;
}

function buildTransportConfig(env: ParsedEnv): TransportConfig {
  if (env.MCP_TRANSPORT === "stdio") {
    return { mode: "stdio" };
  }

  if (!env.MCP_HTTPS_CERT_FILE || !env.MCP_HTTPS_KEY_FILE) {
    throw new ConfigValidationError([
      "MCP_HTTPS_CERT_FILE and MCP_HTTPS_KEY_FILE are required when MCP_TRANSPORT=https"
    ]);
  }

  if (!env.MCP_HTTPS_AUTH_TOKEN) {
    throw new ConfigValidationError([
      "MCP_HTTPS_AUTH_TOKEN with at least 32 characters is required when MCP_TRANSPORT=https"
    ]);
  }

  return {
    mode: "https",
    host: env.MCP_HTTPS_HOST,
    port: env.MCP_HTTPS_PORT ?? DEFAULT_MCP_HTTPS_PORT,
    path: env.MCP_HTTPS_PATH,
    authToken: env.MCP_HTTPS_AUTH_TOKEN,
    maxBodyBytes: env.MCP_HTTPS_MAX_BODY_BYTES ?? DEFAULT_MCP_HTTPS_MAX_BODY_BYTES,
    tlsCertFile: env.MCP_HTTPS_CERT_FILE,
    tlsKeyFile: env.MCP_HTTPS_KEY_FILE,
    maxSessions: env.MCP_HTTPS_MAX_SESSIONS ?? DEFAULT_MCP_HTTPS_MAX_SESSIONS,
    sessionIdleTimeoutMs: env.MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS ?? DEFAULT_MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS
  };
}
