import { describe, expect, it } from "vitest";
import { createToolDefinitions, invokeTool } from "../src/server/registerTools.js";
import { testConfig, testContext } from "./helpers.js";

describe("message tools", () => {
  it("fails closed when dangerous tools are disabled", async () => {
    const tool = createToolDefinitions().find((definition) => definition.name === "whatsapp_send_text_message");
    if (!tool) {
      throw new Error("whatsapp_send_text_message was not registered");
    }

    const result = await invokeTool(
      tool,
      {
        recipient_phone_number: "+15551234567",
        message_body: "hello"
      },
      testContext()
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("DangerousToolDisabledError");
  });

  it("does not apply local send rate limits before calling the WhatsApp API", async () => {
    const tool = createToolDefinitions().find((definition) => definition.name === "whatsapp_send_text_message");
    if (!tool) {
      throw new Error("whatsapp_send_text_message was not registered");
    }

    const context = testContext(testConfig({ enableDangerousTools: true }));
    let calls = 0;
    context.services.messages.sendText = () => {
      calls += 1;
      return Promise.resolve({
        messaging_product: "whatsapp",
        contacts: [{ input: "+15551234567", wa_id: "15551234567" }],
        messages: [{ id: `wamid.${calls}` }]
      });
    };

    const first = await invokeTool(tool, { recipient_phone_number: "+15551234567", message_body: "one" }, context);
    const second = await invokeTool(tool, { recipient_phone_number: "+15551234568", message_body: "two" }, context);

    expect(first.isError).toBeUndefined();
    expect(second.isError).toBeUndefined();
    expect(calls).toBe(2);
  });
});
