# Tool Inventory

## Implemented Tools

### Read/account

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_health_check` | read | Implemented |
| `whatsapp_get_business_account` | read | Implemented |
| `whatsapp_get_phone_number` | read | Implemented |
| `whatsapp_list_phone_numbers` | read | Implemented |
| `whatsapp_get_business_profile` | read | Implemented |

### Profile

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_update_business_profile` | dangerous | Implemented; disabled unless `MCP_ENABLE_DANGEROUS_TOOLS=true` |

### Messaging

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_send_text_message` | dangerous | Implemented |
| `whatsapp_send_template_message` | dangerous | Implemented |
| `whatsapp_send_image_message` | dangerous | Implemented |
| `whatsapp_send_document_message` | dangerous | Implemented |
| `whatsapp_send_audio_message` | dangerous | Implemented |
| `whatsapp_send_video_message` | dangerous | Implemented |
| `whatsapp_send_location_message` | dangerous | Implemented |
| `whatsapp_send_contact_message` | dangerous | Implemented |
| `whatsapp_send_interactive_buttons` | dangerous | Implemented |
| `whatsapp_send_interactive_list` | dangerous | Implemented |
| `whatsapp_mark_message_as_read` | dangerous | Implemented |

All messaging tools send to one recipient per call. Bulk sends and campaigns are intentionally not implemented.

### Templates

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_list_message_templates` | read | Implemented |
| `whatsapp_get_message_template` | read | Implemented |
| `whatsapp_create_message_template` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_delete_message_template` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_validate_template_payload` | read | Implemented locally without sending |

### Media

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_get_media` | read | Implemented; metadata only |
| `whatsapp_delete_media` | dangerous | Implemented; disabled unless dangerous tools are enabled |

### Safety/admin

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_redact_debug_payload` | read | Implemented |
| `whatsapp_validate_phone_number` | read | Implemented |
| `whatsapp_explain_tool_permissions` | read | Implemented |
| `whatsapp_list_available_tools` | read | Implemented |

## Implemented Resources

| Resource | Status |
| --- | --- |
| `whatsapp://account` | Implemented |
| `whatsapp://phone-number` | Implemented |
| `whatsapp://business-profile` | Implemented |
| `whatsapp://templates` | Implemented |

## Not Yet Implemented

| Item | Reason |
| --- | --- |
| `whatsapp_upload_media` | Deferred until safe MIME validation and upload policy are added. |
| Media download to disk | Deferred until a configured safe output directory and path traversal policy exist. |
| Webhook hosting | Deferred to a separate explicit mode with Meta signature verification. |
| Inbound message resources | Requires webhook ingestion and storage design. |
| Campaigns and bulk messaging | Out of scope for v1 safety posture. |
| CRM integrations | Out of scope for the MCP core package. |
| Per-client HTTP authorization | Planned transport hardening. |
| Persistent idempotency | Planned operational hardening. |
| Message delivery/read status lookup | Requires webhook ingestion and storage design. |
