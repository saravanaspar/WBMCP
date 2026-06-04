import { describe, expect, it } from "vitest";
import { createToolDefinitions } from "../src/server/registerTools.js";

const expectedTools = [
  "whatsapp_health_check",
  "whatsapp_get_business_account",
  "whatsapp_get_phone_number",
  "whatsapp_list_phone_numbers",
  "whatsapp_get_business_profile",
  "whatsapp_update_business_profile",
  "whatsapp_send_text_message",
  "whatsapp_send_template_message",
  "whatsapp_send_image_message",
  "whatsapp_send_document_message",
  "whatsapp_send_audio_message",
  "whatsapp_send_video_message",
  "whatsapp_send_location_message",
  "whatsapp_send_contact_message",
  "whatsapp_send_interactive_buttons",
  "whatsapp_send_interactive_list",
  "whatsapp_mark_message_as_read",
  "whatsapp_list_message_templates",
  "whatsapp_get_message_template",
  "whatsapp_create_message_template",
  "whatsapp_delete_message_template",
  "whatsapp_validate_template_payload",
  "whatsapp_get_media",
  "whatsapp_delete_media",
  "whatsapp_redact_debug_payload",
  "whatsapp_validate_phone_number",
  "whatsapp_explain_tool_permissions",
  "whatsapp_list_available_tools"
];

describe("tool registration", () => {
  it("defines the expected MCP tool names", () => {
    const names = createToolDefinitions().map((tool) => tool.name).sort();
    expect(names).toEqual([...expectedTools].sort());
  });

  it("classifies send and destructive tools as dangerous", () => {
    const tools = createToolDefinitions();
    expect(tools.find((tool) => tool.name === "whatsapp_send_text_message")?.permission).toBe("dangerous");
    expect(tools.find((tool) => tool.name === "whatsapp_delete_message_template")?.permission).toBe("dangerous");
  });
});
