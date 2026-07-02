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
  "whatsapp_send_reaction_message",
  "whatsapp_send_sticker_message",
  "whatsapp_send_location_message",
  "whatsapp_send_contact_message",
  "whatsapp_send_interactive_buttons",
  "whatsapp_send_interactive_list",
  "whatsapp_send_product_message",
  "whatsapp_send_product_list_message",
  "whatsapp_send_flow_message",
  "whatsapp_mark_message_as_read",
  "whatsapp_list_message_templates",
  "whatsapp_get_message_template",
  "whatsapp_create_message_template",
  "whatsapp_delete_message_template",
  "whatsapp_validate_template_payload",
  "whatsapp_get_media",
  "whatsapp_delete_media",
  "whatsapp_list_catalogs",
  "whatsapp_get_catalog",
  "whatsapp_list_catalog_products",
  "whatsapp_get_catalog_product",
  "whatsapp_create_catalog_product",
  "whatsapp_update_catalog_product",
  "whatsapp_delete_catalog_product",
  "whatsapp_request_phone_verification_code",
  "whatsapp_verify_phone_code",
  "whatsapp_register_phone_number",
  "whatsapp_deregister_phone_number",
  "whatsapp_set_two_step_pin",
  "whatsapp_get_phone_number_settings",
  "whatsapp_update_phone_number_settings",
  "whatsapp_list_subscribed_apps",
  "whatsapp_subscribe_app",
  "whatsapp_unsubscribe_app",
  "whatsapp_list_flows",
  "whatsapp_get_flow",
  "whatsapp_create_flow",
  "whatsapp_update_flow",
  "whatsapp_update_flow_json",
  "whatsapp_publish_flow",
  "whatsapp_deprecate_flow",
  "whatsapp_delete_flow",
  "whatsapp_get_conversation_analytics",
  "whatsapp_get_template_analytics",
  "whatsapp_redact_debug_payload",
  "whatsapp_validate_phone_number",
  "whatsapp_explain_tool_permissions",
  "whatsapp_list_available_tools",
  "whatsapp_get_prompt_snippets"
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
    expect(tools.find((tool) => tool.name === "whatsapp_create_catalog_product")?.permission).toBe("dangerous");
    expect(tools.find((tool) => tool.name === "whatsapp_publish_flow")?.permission).toBe("dangerous");
  });

  it("marks send tools as dry-run capable and assigns every tool to a group", () => {
    const tools = createToolDefinitions();
    expect(tools.every((tool) => typeof tool.group === "string" && tool.group.length > 0)).toBe(true);
    expect(tools.find((tool) => tool.name === "whatsapp_send_text_message")?.supportsDryRun).toBe(true);
    expect(tools.find((tool) => tool.name === "whatsapp_list_message_templates")?.supportsDryRun).toBeUndefined();
  });
});
