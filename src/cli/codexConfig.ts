import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CODEX_SERVER_NAME = "WBMCP";
const CODEX_SERVER_HEADER = `[mcp_servers.${CODEX_SERVER_NAME}]`;

export function getCodexConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.CODEX_CONFIG_FILE && env.CODEX_CONFIG_FILE.trim().length > 0) {
    return path.resolve(env.CODEX_CONFIG_FILE);
  }

  return path.join(os.homedir(), ".codex", "config.toml");
}

export async function upsertCodexConfig(env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const configFile = getCodexConfigPath(env);
  const existing = await readTextIfPresent(configFile);
  const updated = upsertWbmcpSection(existing);

  await mkdir(path.dirname(configFile), { recursive: true });
  await writeFile(configFile, updated, { mode: 0o600 });
  return configFile;
}

export function upsertWbmcpSection(existing: string): string {
  const lines = existing.split(/\r?\n/);
  const keptLines: string[] = [];
  let skipping = false;

  for (const line of lines) {
    if (isWbmcpSectionHeader(line)) {
      skipping = true;
      continue;
    }

    if (skipping && isAnySectionHeader(line) && !isWbmcpSubsectionHeader(line)) {
      skipping = false;
    }

    if (!skipping) {
      keptLines.push(line);
    }
  }

  const prefix = keptLines.join("\n").trimEnd();
  const section = [
    CODEX_SERVER_HEADER,
    'command = "npx"',
    'args = ["-y", "wbmcp@latest"]',
    "startup_timeout_sec = 20",
    ""
  ].join("\n");

  return prefix.length > 0 ? `${prefix}\n\n${section}` : section;
}

async function readTextIfPresent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function isAnySectionHeader(line: string): boolean {
  return /^\s*\[[^\]]+\]\s*$/.test(line);
}

function isWbmcpSectionHeader(line: string): boolean {
  return /^\s*\[mcp_servers\.WBMCP\]\s*$/.test(line);
}

function isWbmcpSubsectionHeader(line: string): boolean {
  return /^\s*\[mcp_servers\.WBMCP\.[^\]]+\]\s*$/.test(line);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
