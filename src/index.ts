#!/usr/bin/env node
import { runAuthWizard } from "./cli/auth.js";
import { upsertCodexConfig } from "./cli/codexConfig.js";
import { printCredentialGuide } from "./cli/credentialGuide.js";
import { printHelp } from "./cli/help.js";
import { loadEnv } from "./config/env.js";
import { createServer } from "./server/createServer.js";
import { connectConfiguredTransport } from "./server/transport.js";
import { redactSensitive } from "./security/redact.js";

async function main(): Promise<void> {
  const [command, target] = process.argv.slice(2);

  if (command === undefined || command === "run") {
    await runServer();
    return;
  }

  if (command === "credentials" || command === "credential-guide" || (command === "setup" && target === "guide")) {
    printCredentialGuide();
    return;
  }

  if (command === "auth" || (command === "setup" && target === undefined)) {
    const configFile = await runAuthWizard();
    console.error(`WBMCP config saved to ${configFile}`);
    return;
  }

  if (command === "setup" && target === "codex") {
    const configFile = await runAuthWizard();
    const codexConfigFile = await upsertCodexConfig();
    console.error(`WBMCP config saved to ${configFile}`);
    console.error(`Codex MCP config updated at ${codexConfigFile}`);
    return;
  }

  if (command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function runServer(): Promise<void> {
  const config = loadEnv();
  await connectConfiguredTransport(config, () => createServer(config));
}

try {
  await main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ error: redactSensitive(message) }));
  process.exitCode = 1;
}
