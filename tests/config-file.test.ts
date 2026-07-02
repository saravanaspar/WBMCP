import { chmod, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { getConfigFilePath, writeStoredConfig } from "../src/cli/configFile.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe("WBMCP config file", () => {
  it("stores setup config under the WBMCP config directory", async () => {
    const dir = await tempDir();
    const env = { XDG_CONFIG_HOME: dir };

    const configFile = await writeStoredConfig(
      {
        whatsappAccessToken: "placeholder-access-token",
        whatsappPhoneNumberId: "123456789012345",
        whatsappBusinessAccountId: "123456789012346",
        whatsappGraphApiVersion: "v24.0",
        mcpEnableDangerousTools: false
      },
      env
    );

    expect(configFile).toBe(path.join(dir, "wbmcp", "config.json"));
    await expect(readFile(configFile, "utf8")).resolves.toContain("placeholder-access-token");
  });

  it("loads saved config when environment variables are not provided", async () => {
    const dir = await tempDir();
    const env = { XDG_CONFIG_HOME: dir };

    await writeStoredConfig(
      {
        whatsappAccessToken: "saved-access-token",
        whatsappPhoneNumberId: "123456789012345",
        whatsappBusinessAccountId: "123456789012346",
        whatsappGraphApiVersion: "v24.0",
        mcpEnableDangerousTools: true
      },
      env
    );

    const config = loadEnv(env);

    expect(config.accessToken).toBe("saved-access-token");
    expect(config.enableDangerousTools).toBe(true);
  });

  it("lets environment variables override saved config", async () => {
    const dir = await tempDir();
    const env = { XDG_CONFIG_HOME: dir };

    await writeStoredConfig(
      {
        whatsappAccessToken: "saved-access-token",
        whatsappPhoneNumberId: "123456789012345",
        whatsappBusinessAccountId: "123456789012346"
      },
      env
    );

    const config = loadEnv({ ...env, WHATSAPP_ACCESS_TOKEN: "env-access-token" });

    expect(config.accessToken).toBe("env-access-token");
  });

  it("supports an explicit config file path", () => {
    const configFile = getConfigFilePath({ WBMCP_CONFIG_FILE: "/tmp/wbmcp-test.json" });

    expect(configFile).toBe("/tmp/wbmcp-test.json");
  });

  it("normalizes existing config files to owner-only permissions", async () => {
    const dir = await tempDir();
    const configFile = path.join(dir, "config.json");
    const env = { WBMCP_CONFIG_FILE: configFile };

    await writeFile(configFile, "{}\n", { mode: 0o644 });
    await chmod(configFile, 0o644);

    await writeStoredConfig(
      {
        whatsappAccessToken: "placeholder-access-token",
        whatsappPhoneNumberId: "123456789012345",
        whatsappBusinessAccountId: "123456789012346"
      },
      env
    );

    const mode = (await stat(configFile)).mode & 0o777;
    expect(mode).toBe(0o600);
  });
});

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "wbmcp-test-"));
  tempDirs.push(dir);
  return dir;
}
