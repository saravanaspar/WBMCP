import { describe, expect, it } from "vitest";
import {
  createToolDefinitions,
  createWhatsAppBusinessClient,
  WhatsAppSdkToolError,
  type WhatsAppBusinessClientConfig
} from "../src/index.js";

const baseConfig: WhatsAppBusinessClientConfig = {
  accessToken: "placeholder-access-token",
  phoneNumberId: "123456789012345",
  businessAccountId: "123456789012346",
  graphApiVersion: "v24.0",
  logLevel: "silent"
};

describe("WhatsAppBusinessClient SDK", () => {
  it("exposes every registered MCP tool as an SDK tool method", () => {
    const client = createWhatsAppBusinessClient(baseConfig);
    const sdkTools = client.tools as Record<string, unknown>;

    for (const definition of createToolDefinitions()) {
      expect(typeof sdkTools[definition.name], definition.name).toBe("function");
    }
  });

  it("lists the same tool catalog metadata that MCP clients see", () => {
    const client = createWhatsAppBusinessClient(baseConfig);

    expect(client.listTools().map((tool) => tool.name).sort()).toEqual(
      createToolDefinitions().map((definition) => definition.name).sort()
    );
    expect(client.listTools().find((tool) => tool.name === "whatsapp_send_text_message")).toMatchObject({
      permission: "dangerous",
      dangerous: true,
      enabled: false
    });
  });

  it("fails closed for dangerous SDK calls unless explicitly enabled", async () => {
    let fetchCalls = 0;
    const client = createWhatsAppBusinessClient(baseConfig, {
      fetchFn: () => {
        fetchCalls += 1;
        return Promise.resolve(new Response(JSON.stringify({ ok: true })));
      }
    });

    const payload = await client.tools.whatsapp_send_text_message({
      recipient_phone_number: "+15551234567",
      message_body: "hello"
    });

    expect(payload.ok).toBe(false);
    if (!payload.ok) {
      expect(payload.error.type).toBe("DangerousToolDisabledError");
    }
    expect(fetchCalls).toBe(0);
  });

  it("throws typed SDK errors from convenience methods", async () => {
    const client = createWhatsAppBusinessClient(baseConfig);

    await expect(
      client.messages.sendText({
        recipient_phone_number: "+15551234567",
        message_body: "hello"
      })
    ).rejects.toBeInstanceOf(WhatsAppSdkToolError);
  });

  it("sends messages through the package SDK when dangerous tools are enabled", async () => {
    const requests: Array<{ url: string; body: string }> = [];
    const fetchFn: typeof fetch = (input, init) => {
      requests.push({
        url: requestUrl(input),
        body: typeof init?.body === "string" ? init.body : ""
      });
      return Promise.resolve(
        new Response(
          JSON.stringify({
            messaging_product: "whatsapp",
            contacts: [{ input: "+15551234567", wa_id: "15551234567" }],
            messages: [{ id: "wamid.test" }]
          }),
          { status: 200 }
        )
      );
    };

    const client = createWhatsAppBusinessClient(
      { ...baseConfig, enableDangerousTools: true },
      { fetchFn }
    );

    const response = await client.messages.sendText({
      recipient_phone_number: "+15551234567",
      message_body: "hello from sdk"
    });

    expect(response.messages?.[0]).toEqual({ id: "wamid.test" });
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toContain("/v24.0/123456789012345/messages");
    expect(JSON.parse(requests[0]?.body ?? "{}")).toMatchObject({
      messaging_product: "whatsapp",
      to: "15551234567",
      type: "text",
      text: {
        body: "hello from sdk",
        preview_url: false
      }
    });
  });

  it("runs local safety tools through the SDK without Graph API calls", async () => {
    const client = createWhatsAppBusinessClient(baseConfig, {
      fetchFn: () => Promise.reject(new Error("Graph API should not be called"))
    });

    const result = await client.safety.validatePhoneNumber({ phone_number: "+15551234567" });

    expect(result).toEqual({
      valid: true,
      masked: "[REDACTED_PHONE:4567]"
    });
  });
});

function requestUrl(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}
