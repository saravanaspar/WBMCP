import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline";
import { DEFAULT_GRAPH_API_VERSION } from "../config/constants.js";
import { loadEnv } from "../config/env.js";
import {
  type StoredWbmcpConfig,
  readStoredConfig,
  storedConfigToEnv,
  writeStoredConfig
} from "./configFile.js";

class LinePrompter {
  public async question(prompt: string): Promise<string> {
    const rl = createInterface({ input, output, terminal: input.isTTY });
    try {
      const answer = await new Promise<string>((resolve) => {
        rl.question(prompt, resolve);
      });
      return answer.trim();
    } finally {
      rl.close();
    }
  }

  public async secretQuestion(prompt: string): Promise<string> {
    if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
      return this.question(prompt);
    }

    output.write(prompt);
    return await readMaskedLine();
  }
}

export const WBMCP_SETUP_DOCS_URL = "https://github.com/saravanaspar/WBMCP#setup";
export const META_APP_DASHBOARD_URL = "https://developers.facebook.com/apps/";
export const META_WHATSAPP_GET_STARTED_URL = "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started";
export const META_BUSINESS_SETTINGS_SYSTEM_USERS_URL = "https://business.facebook.com/settings/system-users";

export function formatCredentialSetupGuide(): string {
  return `Before entering credentials, get these values from Meta:

Project setup guide:
${WBMCP_SETUP_DOCS_URL}

1. WhatsApp access token
   - Open Meta for Developers: ${META_APP_DASHBOARD_URL}
   - Select your app, then open WhatsApp > API Setup.
   - For a quick test, copy the temporary access token.
   - For production, create a permanent System User token in Meta Business Settings:
     ${META_BUSINESS_SETTINGS_SYSTEM_USERS_URL}
   - Grant whatsapp_business_messaging and whatsapp_business_management permissions.

2. WhatsApp phone number ID
   - In WhatsApp > API Setup, copy Phone number ID.
   - This is Meta's numeric ID for the phone number, not the visible phone number.

3. WhatsApp Business Account ID
   - In WhatsApp > API Setup, copy WhatsApp Business Account ID.
   - You may also see this called WABA ID.

Official Meta guide:
${META_WHATSAPP_GET_STARTED_URL}

Keep tokens private. Do not paste them into GitHub issues, chat logs, or committed files.`;
}

export async function runAuthWizard(env: NodeJS.ProcessEnv = process.env): Promise<string> {
  output.write(`${formatCredentialSetupGuide()}\n\n`);
  const existing = await readStoredConfig(env);
  const next = await promptForConfig(existing);

  loadEnv({ ...storedConfigToEnv(next), WBMCP_CONFIG_FILE: env.WBMCP_CONFIG_FILE });
  return await writeStoredConfig(next, env);
}

async function promptForConfig(existing: StoredWbmcpConfig): Promise<StoredWbmcpConfig> {
  const prompter = new LinePrompter();

  const whatsappAccessToken = await requiredSecretAnswer(
    prompter,
    "WhatsApp access token",
    existing.whatsappAccessToken
  );
  const whatsappPhoneNumberId = await requiredAnswer(prompter, "WhatsApp phone number ID", existing.whatsappPhoneNumberId);
  const whatsappBusinessAccountId = await requiredAnswer(
    prompter,
    "WhatsApp business account ID",
    existing.whatsappBusinessAccountId
  );
  const whatsappGraphApiVersion = await optionalAnswer(
    prompter,
    "Graph API version",
    existing.whatsappGraphApiVersion ?? DEFAULT_GRAPH_API_VERSION
  );
  const whatsappAppSecret = await optionalSecretAnswer(prompter, "App secret (optional)", existing.whatsappAppSecret);
  const mcpEnableDangerousTools = await booleanAnswer(
    prompter,
    "Enable send/delete/profile mutation tools",
    existing.mcpEnableDangerousTools ?? false
  );

  return removeEmptyValues({
    whatsappAccessToken,
    whatsappPhoneNumberId,
    whatsappBusinessAccountId,
    whatsappGraphApiVersion,
    whatsappAppSecret,
    mcpLogLevel: existing.mcpLogLevel ?? "info",
    mcpEnableDangerousTools
  });
}

async function requiredAnswer(
  prompter: LinePrompter,
  label: string,
  existing: string | undefined
): Promise<string> {
  const answer = await optionalAnswer(prompter, label, existing);

  if (!answer) {
    throw new Error(`${label} is required`);
  }

  return answer;
}

async function requiredSecretAnswer(
  prompter: LinePrompter,
  label: string,
  existing: string | undefined
): Promise<string> {
  const answer = await optionalSecretAnswer(prompter, label, existing);

  if (!answer) {
    throw new Error(`${label} is required`);
  }

  return answer;
}

async function optionalAnswer(
  prompter: LinePrompter,
  label: string,
  existing: string | undefined
): Promise<string | undefined> {
  const suffix = existing ? " [saved]" : "";
  const answer = await prompter.question(`${label}${suffix}: `);
  return answer || existing;
}

async function optionalSecretAnswer(
  prompter: LinePrompter,
  label: string,
  existing: string | undefined
): Promise<string | undefined> {
  const suffix = existing ? " [saved]" : "";
  const answer = await prompter.secretQuestion(`${label}${suffix}: `);
  return answer || existing;
}

async function booleanAnswer(prompter: LinePrompter, label: string, existing: boolean): Promise<boolean> {
  const defaultText = existing ? "Y/n" : "y/N";
  const answer = (await prompter.question(`${label}? ${defaultText}: `)).toLowerCase();

  if (!answer) {
    return existing;
  }

  if (["y", "yes", "true", "1"].includes(answer)) {
    return true;
  }

  if (["n", "no", "false", "0"].includes(answer)) {
    return false;
  }

  throw new Error(`Invalid answer for ${label}. Use yes or no.`);
}

function removeEmptyValues(config: StoredWbmcpConfig): StoredWbmcpConfig {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined && value !== "")
  );
}

async function readMaskedLine(): Promise<string> {
  const wasRaw = input.isRaw;
  let value = "";

  return await new Promise<string>((resolve, reject) => {
    const cleanup = (): void => {
      input.off("data", onData);
      input.setRawMode(wasRaw);
      input.pause();
    };

    const finish = (): void => {
      cleanup();
      output.write("\n");
      resolve(value);
    };

    const onData = (chunk: Buffer): void => {
      const text = chunk.toString("utf8");
      for (const char of text) {
        if (char === "\u0003") {
          cleanup();
          output.write("\n");
          reject(new Error("Prompt cancelled."));
          return;
        }

        if (char === "\r" || char === "\n") {
          finish();
          return;
        }

        if (char === "\u007f" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }

        value += char;
        output.write("*");
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}
