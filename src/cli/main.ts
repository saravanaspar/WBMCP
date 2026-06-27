import { runAuthWizard } from "./auth.js";
import { upsertCodexConfig } from "./codexConfig.js";
import { printHelp } from "./help.js";
import { loadEnv } from "../config/env.js";
import { createServer } from "../server/createServer.js";
import { connectConfiguredTransport } from "../server/transport.js";

export async function runCli(argv: readonly string[] = process.argv.slice(2)): Promise<void> {
  const [command, target] = argv;

  if (command === undefined || command === "run") {
    await runConfiguredServer();
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

export async function runConfiguredServer(): Promise<void> {
  const config = loadEnv();
  await connectConfiguredTransport(config, () => createServer(config));
}
