import fs from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

export interface StoredWbmcpConfig {
  whatsappAccessToken?: string | undefined;
  whatsappPhoneNumberId?: string | undefined;
  whatsappBusinessAccountId?: string | undefined;
  whatsappGraphApiVersion?: string | undefined;
  whatsappAppSecret?: string | undefined;
  mcpLogLevel?: string | undefined;
  mcpEnableDangerousTools?: boolean | undefined;
  mcpReadOnly?: boolean | undefined;
  mcpRequireConfirmation?: boolean | undefined;
}

const storedConfigSchema = z
  .object({
    whatsappAccessToken: z.string().trim().min(1).optional(),
    whatsappPhoneNumberId: z.string().trim().min(1).optional(),
    whatsappBusinessAccountId: z.string().trim().min(1).optional(),
    whatsappGraphApiVersion: z.string().trim().min(1).optional(),
    whatsappAppSecret: z.string().trim().min(1).optional(),
    mcpLogLevel: z.string().trim().min(1).optional(),
    mcpEnableDangerousTools: z.boolean().optional(),
    mcpReadOnly: z.boolean().optional(),
    mcpRequireConfirmation: z.boolean().optional()
  })
  .strict();

export class StoredConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "StoredConfigError";
  }
}

export function getConfigFilePath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.WBMCP_CONFIG_FILE && env.WBMCP_CONFIG_FILE.trim().length > 0) {
    return path.resolve(env.WBMCP_CONFIG_FILE);
  }

  const configHome = env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config");
  return path.join(configHome, "wbmcp", "config.json");
}

export function readStoredConfigSync(env: NodeJS.ProcessEnv = process.env): StoredWbmcpConfig {
  const configFile = getConfigFilePath(env);

  if (!fs.existsSync(configFile)) {
    return {};
  }

  try {
    const parsed = storedConfigSchema.parse(JSON.parse(fs.readFileSync(configFile, "utf8")));
    return parsed;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new StoredConfigError(`Invalid WBMCP config at ${configFile}: ${message}`);
  }
}

export async function readStoredConfig(env: NodeJS.ProcessEnv = process.env): Promise<StoredWbmcpConfig> {
  const configFile = getConfigFilePath(env);

  if (!fs.existsSync(configFile)) {
    return {};
  }

  try {
    const parsed = storedConfigSchema.parse(JSON.parse(await readFile(configFile, "utf8")));
    return parsed;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new StoredConfigError(`Invalid WBMCP config at ${configFile}: ${message}`);
  }
}

export async function writeStoredConfig(
  config: StoredWbmcpConfig,
  env: NodeJS.ProcessEnv = process.env
): Promise<string> {
  const configFile = getConfigFilePath(env);
  const parsed = storedConfigSchema.parse(config);
  const serialized = `${JSON.stringify(parsed, null, 2)}\n`;

  await mkdir(path.dirname(configFile), { recursive: true });
  await writeFile(configFile, serialized, { mode: 0o600 });
  return configFile;
}

export function storedConfigToEnv(config: StoredWbmcpConfig): Record<string, string> {
  const env: Record<string, string> = {};

  setIfDefined(env, "WHATSAPP_ACCESS_TOKEN", config.whatsappAccessToken);
  setIfDefined(env, "WHATSAPP_PHONE_NUMBER_ID", config.whatsappPhoneNumberId);
  setIfDefined(env, "WHATSAPP_BUSINESS_ACCOUNT_ID", config.whatsappBusinessAccountId);
  setIfDefined(env, "WHATSAPP_GRAPH_API_VERSION", config.whatsappGraphApiVersion);
  setIfDefined(env, "WHATSAPP_APP_SECRET", config.whatsappAppSecret);
  setIfDefined(env, "MCP_LOG_LEVEL", config.mcpLogLevel);

  if (config.mcpEnableDangerousTools !== undefined) {
    env.MCP_ENABLE_DANGEROUS_TOOLS = config.mcpEnableDangerousTools ? "true" : "false";
  }
  if (config.mcpReadOnly !== undefined) {
    env.MCP_READ_ONLY = config.mcpReadOnly ? "true" : "false";
  }
  if (config.mcpRequireConfirmation !== undefined) {
    env.MCP_REQUIRE_CONFIRMATION = config.mcpRequireConfirmation ? "true" : "false";
  }

  return env;
}

function setIfDefined(env: Record<string, string>, key: string, value: string | undefined): void {
  if (value !== undefined) {
    env[key] = value;
  }
}
