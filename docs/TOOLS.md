# Tool Inventory

Current tool count: **61**.

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
| `whatsapp_send_text_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_template_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_image_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_document_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_audio_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_video_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_reaction_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_sticker_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_location_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_contact_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_interactive_buttons` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_interactive_list` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_product_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_product_list_message` | dangerous | Implemented; supports `dryRun` preview |
| `whatsapp_send_flow_message` | dangerous | Implemented; supports `dryRun` preview |
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

### Commerce

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_list_catalogs` | read | Implemented |
| `whatsapp_get_catalog` | read | Implemented |
| `whatsapp_list_catalog_products` | read | Implemented |
| `whatsapp_get_catalog_product` | read | Implemented |
| `whatsapp_create_catalog_product` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_update_catalog_product` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_delete_catalog_product` | dangerous | Implemented; disabled unless dangerous tools are enabled |

### Phone lifecycle

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_request_phone_verification_code` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_verify_phone_code` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_register_phone_number` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_deregister_phone_number` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_set_two_step_pin` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_get_phone_number_settings` | read | Implemented |
| `whatsapp_update_phone_number_settings` | dangerous | Implemented; disabled unless dangerous tools are enabled |

### Webhook subscriptions

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_list_subscribed_apps` | read | Implemented |
| `whatsapp_subscribe_app` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_unsubscribe_app` | dangerous | Implemented; disabled unless dangerous tools are enabled |

### Flows

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_list_flows` | read | Implemented |
| `whatsapp_get_flow` | read | Implemented |
| `whatsapp_create_flow` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_update_flow` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_update_flow_json` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_publish_flow` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_deprecate_flow` | dangerous | Implemented; disabled unless dangerous tools are enabled |
| `whatsapp_delete_flow` | dangerous | Implemented; disabled unless dangerous tools are enabled |

### Analytics

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_get_conversation_analytics` | read | Implemented |
| `whatsapp_get_template_analytics` | read | Implemented |

### Safety/admin

| Tool | Permission | Status |
| --- | --- | --- |
| `whatsapp_redact_debug_payload` | read | Implemented |
| `whatsapp_validate_phone_number` | read | Implemented |
| `whatsapp_explain_tool_permissions` | read | Implemented |
| `whatsapp_list_available_tools` | read | Implemented; includes group, enabled, confirmation, and dry-run metadata |
| `whatsapp_get_prompt_snippets` | read | Implemented |

## Safety Modes

| Mode | Config | Behavior |
| --- | --- | --- |
| Dangerous tools disabled | `MCP_ENABLE_DANGEROUS_TOOLS=false` | Blocks send/delete/create/update/mark-read tools. |
| Read-only | `MCP_READ_ONLY=true` | Blocks all dangerous tools even if dangerous tools are enabled. |
| Confirmation required | `MCP_REQUIRE_CONFIRMATION=true` | Dangerous tools return `confirmation_required` until called with `confirm: true`. |
| Dry-run preview | `dryRun: true` on send tools | Validates and returns `wouldSend` metadata without calling Meta. |

Tool results use `{ ok, data, meta }` on success and `{ ok, error, meta }` on failure. Error objects include normalized `code` values when possible.

## Input Values By Category

| Category | Values tools commonly need |
| --- | --- |
| Account/profile reads | Usually `{}`; list tools accept `limit` and `after` |
| Profile update | `about`, `address`, `description`, `email`, `websites`, `vertical`, `confirm` |
| Send messages | `recipient_phone_number`; message-specific fields such as `message_body`, `template_name`, `media_id`, `media_url`, `catalog_id`, `product_retailer_id`, `flow_id`; send tools support `dryRun` and dangerous sends may require `confirm` |
| Templates | `template_id`, `name`, `language`, `category`, `components`, optional pagination and filters |
| Media | `media_id`, optional `confirm` for delete |
| Commerce | `catalog_id`, `product_id`, `product_retailer_id`, product fields such as `retailer_id`, `name`, `price`, `currency`, `image_url` |
| Phone lifecycle | Optional `phone_number_id`; `code_method`, `code`, or six-digit `pin` depending on operation |
| Webhook subscriptions | Usually `{}` for read; `confirm` for subscribe/unsubscribe when confirmation mode is enabled |
| Flows | `flow_id`, `name`, `categories`, `endpoint_uri`, `flow_json`; Flow sends need `recipient_phone_number`, `flow_token`, `flow_cta`, `body_text` |
| Analytics | `start_date`, `end_date`, `granularity` |
| Safety | `phone_number`, `payload`, optional `tool_name`, or `{}` |

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
| Webhook receiver/hosting | Deferred to a separate explicit mode with Meta signature verification. |
| Inbound message resources | Requires webhook ingestion and storage design. |
| Campaigns and bulk messaging | Out of scope for v1 safety posture. |
| CRM integrations | Out of scope for the MCP core package. |
| Per-client HTTP authorization | Planned transport hardening. |
| Persistent idempotency | Planned operational hardening. |
| Message delivery/read status lookup | Requires webhook ingestion and storage design. |
