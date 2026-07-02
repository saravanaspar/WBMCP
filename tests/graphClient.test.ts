import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { GraphClient } from "../src/whatsapp/graphClient.js";
import { WhatsAppApiError } from "../src/whatsapp/errors.js";

describe("GraphClient", () => {
  it("does not expose access tokens or full phone numbers in thrown errors", async () => {
    const client = new GraphClient({
      accessToken: "placeholder-access-token",
      graphApiVersion: "v24.0",
      fetchFn: () =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error: {
                message: "Rejected Bearer placeholder-access-token for +15551234567",
                code: 190,
                fbtrace_id: "trace-id"
              }
            }),
            { status: 400 }
          )
        )
    });

    await expect(client.get("/123")).rejects.toMatchObject({
      name: "WhatsAppApiError",
      status: 400,
      retryable: false
    });

    try {
      await client.get("/123");
    } catch (error) {
      expect(error).toBeInstanceOf(WhatsAppApiError);
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toContain("placeholder-access-token");
      expect(message).not.toContain("+15551234567");
      expect(message).toContain("[REDACTED_PHONE:4567]");
    }
  });

  it("retries retryable GET requests", async () => {
    let calls = 0;
    const client = new GraphClient({
      accessToken: "placeholder-access-token",
      graphApiVersion: "v24.0",
      maxRetries: 2,
      fetchFn: () => {
        calls += 1;
        return Promise.resolve(
          new Response(calls === 1 ? JSON.stringify({ error: { message: "temporary" } }) : JSON.stringify({ ok: true }), {
            status: calls === 1 ? 500 : 200
          })
        );
      }
    });

    await expect(client.get("/123")).resolves.toEqual({ ok: true });
    expect(calls).toBe(2);
  });

  it("does not retry POST requests because message sends and mutations are not idempotent", async () => {
    let calls = 0;
    const client = new GraphClient({
      accessToken: "placeholder-access-token",
      graphApiVersion: "v24.0",
      maxRetries: 2,
      fetchFn: () => {
        calls += 1;
        return Promise.resolve(new Response(JSON.stringify({ error: { message: "temporary" } }), { status: 500 }));
      }
    });

    await expect(client.postJson("/123/messages", { messaging_product: "whatsapp" })).rejects.toMatchObject({
      name: "WhatsAppApiError",
      status: 500
    });
    expect(calls).toBe(1);
  });
  it("exposes Meta retry-after seconds on throttled responses", async () => {
    const client = new GraphClient({
      accessToken: "placeholder-access-token",
      graphApiVersion: "v24.0",
      fetchFn: () =>
        Promise.resolve(
          new Response(JSON.stringify({ error: { message: "Too many calls", code: 4 } }), {
            status: 429,
            headers: { "retry-after": "17" }
          })
        )
    });

    await expect(client.postJson("/123/messages", { messaging_product: "whatsapp" })).rejects.toMatchObject({
      name: "WhatsAppApiError",
      status: 429,
      retryable: true,
      retryAfterSeconds: 17
    });
  });

  it("adds appsecret_proof when an app secret is configured", async () => {
    let requestedUrl = "";
    const client = new GraphClient({
      accessToken: "placeholder-access-token",
      graphApiVersion: "v24.0",
      appSecret: "placeholder-app-secret",
      fetchFn: (input) => {
        requestedUrl = requestUrl(input);
        return Promise.resolve(new Response(JSON.stringify({ ok: true })));
      }
    });

    await client.get("/123", { fields: "id" });

    const url = new URL(requestedUrl);
    expect(url.searchParams.get("appsecret_proof")).toBe(
      createHmac("sha256", "placeholder-app-secret").update("placeholder-access-token").digest("hex")
    );
    expect(url.searchParams.get("fields")).toBe("id");
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
