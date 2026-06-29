import { describe, expect, it } from "vitest";
import { createWhatsAppBusinessClient, type WhatsAppBusinessClientConfig, type WhatsAppSdkToolError } from "../src/index.js";

const baseConfig: WhatsAppBusinessClientConfig = {
  accessToken: "placeholder-access-token",
  phoneNumberId: "123456789012345",
  businessAccountId: "123456789012346",
  graphApiVersion: "v24.0",
  logLevel: "silent"
};

describe("WBMCP safety modes", () => {
  it("previews send tools with dryRun without calling Graph API", async () => {
    let fetchCalls = 0;
    const client = createWhatsAppBusinessClient(
      { ...baseConfig, enableDangerousTools: true },
      {
        fetchFn: () => {
          fetchCalls += 1;
          return Promise.reject(new Error("Graph API should not be called for dryRun"));
        }
      }
    );

    const result = await client.tools.whatsapp_send_text_message({
      recipient_phone_number: "+15551234567",
      message_body: "hello",
      dryRun: true
    });

    expect(result).toMatchObject({
      ok: true,
      meta: { mode: "dry_run" },
      data: {
        dryRun: true,
        wouldSend: {
          type: "text",
          to: "+15551234567"
        }
      }
    });
    expect(fetchCalls).toBe(0);
  });

  it("requires confirm true for dangerous tools when confirmation mode is enabled", async () => {
    const client = createWhatsAppBusinessClient({
      ...baseConfig,
      enableDangerousTools: true,
      requireConfirmation: true
    });

    const result = await client.tools.whatsapp_send_text_message({
      recipient_phone_number: "+15551234567",
      message_body: "hello"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatchObject({
        code: "confirmation_required",
        confirmation_required: true,
        tool_name: "whatsapp_send_text_message"
      });
    }
  });

  it("allows confirmed dangerous SDK calls", async () => {
    let fetchCalls = 0;
    const client = createWhatsAppBusinessClient(
      {
        ...baseConfig,
        enableDangerousTools: true,
        requireConfirmation: true
      },
      {
        fetchFn: () => {
          fetchCalls += 1;
          return Promise.resolve(new Response(JSON.stringify({ messages: [{ id: "wamid.test" }] }), { status: 200 }));
        }
      }
    );

    await expect(
      client.messages.sendText({
        recipient_phone_number: "+15551234567",
        message_body: "hello",
        confirm: true
      })
    ).resolves.toMatchObject({ messages: [{ id: "wamid.test" }] });
    expect(fetchCalls).toBe(1);
  });

  it("blocks dangerous tools in read-only mode even when dangerous tools are enabled", async () => {
    const client = createWhatsAppBusinessClient({
      ...baseConfig,
      enableDangerousTools: true,
      readOnly: true
    });

    await expect(
      client.messages.sendText({
        recipient_phone_number: "+15551234567",
        message_body: "hello"
      })
    ).rejects.toMatchObject({
      name: "ReadOnlyToolBlockedError",
      error: { code: "read_only_mode_enabled" }
    } satisfies Partial<WhatsAppSdkToolError>);
  });

  it("normalizes validation failures for phone number inputs", async () => {
    const client = createWhatsAppBusinessClient({ ...baseConfig, enableDangerousTools: true });
    const result = await client.tools.whatsapp_send_text_message({
      recipient_phone_number: "5551234567",
      message_body: "hello"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_phone_number");
    }
  });

  it("exposes prompt snippets through the SDK", async () => {
    const client = createWhatsAppBusinessClient(baseConfig);
    const snippets = await client.safety.getPromptSnippets();

    expect(Array.isArray(snippets.snippets)).toBe(true);
    expect(JSON.stringify(snippets)).toContain("dryRun");
  });
});
