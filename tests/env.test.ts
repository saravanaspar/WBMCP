import { describe, expect, it } from "vitest";
import { ConfigValidationError, loadEnv } from "../src/config/env.js";

describe("loadEnv", () => {
  it("fails closed when required WhatsApp variables are missing", () => {
    expect(() => loadEnv({})).toThrow(ConfigValidationError);
  });

  it("loads required variables and defaults dangerous tools to false", () => {
    const config = loadEnv({
      WHATSAPP_ACCESS_TOKEN: "placeholder-access-token",
      WHATSAPP_PHONE_NUMBER_ID: "123456789012345",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "123456789012346"
    });

    expect(config.graphApiVersion).toBe("v24.0");
    expect(config.enableDangerousTools).toBe(false);
    expect(config.transport).toEqual({ mode: "stdio" });
  });

  it("keeps stdio as the npx-safe default when HTTPS variables are not requested", () => {
    const config = loadEnv({
      WHATSAPP_ACCESS_TOKEN: "placeholder-access-token",
      WHATSAPP_PHONE_NUMBER_ID: "123456789012345",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "123456789012346",
      MCP_HTTPS_AUTH_TOKEN: "a".repeat(32),
      MCP_HTTPS_CERT_FILE: "/tmp/cert.pem",
      MCP_HTTPS_KEY_FILE: "/tmp/key.pem"
    });

    expect(config.transport).toEqual({ mode: "stdio" });
  });

  it("loads HTTPS transport settings when explicitly requested", () => {
    const config = loadEnv({
      WHATSAPP_ACCESS_TOKEN: "placeholder-access-token",
      WHATSAPP_PHONE_NUMBER_ID: "123456789012345",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "123456789012346",
      MCP_TRANSPORT: "https",
      MCP_HTTPS_HOST: "127.0.0.1",
      MCP_HTTPS_PORT: "3999",
      MCP_HTTPS_PATH: "/mcp",
      MCP_HTTPS_AUTH_TOKEN: "a".repeat(32),
      MCP_HTTPS_CERT_FILE: "/tmp/cert.pem",
      MCP_HTTPS_KEY_FILE: "/tmp/key.pem",
      MCP_HTTPS_MAX_SESSIONS: "25",
      MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS: "60000"
    });

    expect(config.transport).toEqual({
      mode: "https",
      host: "127.0.0.1",
      port: 3999,
      path: "/mcp",
      authToken: "a".repeat(32),
      maxBodyBytes: 1_048_576,
      tlsCertFile: "/tmp/cert.pem",
      tlsKeyFile: "/tmp/key.pem",
      maxSessions: 25,
      sessionIdleTimeoutMs: 60_000
    });
  });

  it("rejects plaintext HTTP transport", () => {
    expect(() =>
      loadEnv({
        WHATSAPP_ACCESS_TOKEN: "placeholder-access-token",
        WHATSAPP_PHONE_NUMBER_ID: "123456789012345",
        WHATSAPP_BUSINESS_ACCOUNT_ID: "123456789012346",
        MCP_TRANSPORT: "http"
      })
    ).toThrow(ConfigValidationError);
  });

  it("requires TLS files and an auth token for HTTPS transport", () => {
    expect(() =>
      loadEnv({
        WHATSAPP_ACCESS_TOKEN: "placeholder-access-token",
        WHATSAPP_PHONE_NUMBER_ID: "123456789012345",
        WHATSAPP_BUSINESS_ACCOUNT_ID: "123456789012346",
        MCP_TRANSPORT: "https"
      })
    ).toThrow(ConfigValidationError);
  });
});
