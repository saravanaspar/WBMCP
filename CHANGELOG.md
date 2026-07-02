# Changelog

All notable changes to WBMCP are documented here.

This project follows semantic versioning for npm releases.

## [0.1.3] - 2026-07-02

### Added

* Expanded the registered MCP/SDK tool catalog to 61 tools.
* Added WhatsApp reaction, sticker, product, product-list, and Flow message tools.
* Added commerce catalog/product tools for listing, reading, creating, updating, and deleting catalog products.
* Added phone lifecycle tools for verification codes, registration, deregistration, two-step PINs, and phone settings.
* Added webhook subscription tools for listing, subscribing, and unsubscribing apps on the configured WABA.
* Added WhatsApp Flow management tools for listing, reading, creating, updating, uploading Flow JSON, publishing, deprecating, and deleting Flows.
* Added conversation and template analytics read tools.
* Added SDK agent helpers: compact tool descriptors, capability metadata, system prompt helper, and non-throwing dynamic tool invocation.
* Added optional Meta Graph API `appsecret_proof` support when `WHATSAPP_APP_SECRET` or SDK `appSecret` is configured.

### Changed

* Bumped package version from `0.1.2` to `0.1.3`.
* Updated README and docs for backend web-app AI chat SDK integration, required secrets, server-only credential handling, and current tool inputs.
* Updated npm publish workflow so branch pushes verify only; publishing now requires a `v*` tag or explicit manual publish input.
* Expanded CI verification to cover Node.js 20 and 24.
* Made SDK `client.tools` dynamically reflect the registered tool catalog.

### Fixed

* Hardened hosted HTTPS pending-session cleanup for failed or incomplete initialize requests.
* Ensured existing stored credential config files are normalized to owner-only `0600` permissions after writes.
* Exported SDK agent helper types from `wbmcp/sdk`.

## [0.1.2] - 2026-06-29

### Added

* Added `dryRun: true` preview support for all send-message tools.
* Added `MCP_REQUIRE_CONFIRMATION=true` safety mode for dangerous tools, requiring `confirm: true` before mutation calls.
* Added `MCP_READ_ONLY=true` mode to block all dangerous tools while keeping read/safety tools available.
* Added normalized tool error codes such as `invalid_credentials`, `rate_limited`, `invalid_phone_number`, `dangerous_tool_disabled`, and `confirmation_required`.
* Added richer tool catalog metadata: group, read-only status, enabled status, confirmation requirement, and dry-run support.
* Added prompt-snippet safety tool for agent instructions.
* Added SDK/MCP safety parity tests for dry-run, confirmation, read-only mode, and validation failures.

### Changed

* Bumped package version from `0.1.1` to `0.1.2`.
* Improved send-tool descriptions so AI agents know when to preview, confirm, or use templates.
* Improved retry delay behavior for safe GET retries by respecting `Retry-After` and adding jitter.
* Fixed npm binary execution when launched through package-manager symlinks such as `node_modules/.bin/wbmcp`.

## [0.1.1] - 2026-06-27

### Added

* Added importable SDK support while keeping the existing MCP CLI/server behavior.
* Added `wbmcp/sdk` exports for programmatic WhatsApp Business Cloud API usage.
* Added SDK convenience namespaces for messages, media, templates, contacts, phone numbers, business profile, analytics, safety, registration, and raw tool invocation.
* Added SDK tests covering direct MCP tool invocation and convenience methods.
* Added package exports for SDK, server, schemas, and WhatsApp helper modules.
* Added GitHub Actions workflow for build, lint, type-check, test, package verification, and npm publishing.

### Changed

* Bumped package version from `0.1.0` to `0.1.1`.
* Split CLI startup code from reusable package exports so importing `wbmcp` does not start the MCP server.
* Updated README with SDK usage references.
* Updated package metadata so WBMCP can be used as both a CLI package and a TypeScript SDK.

## [0.1.0] - Initial release

### Added

* Initial WBMCP release as an MCP server for WhatsApp Business Cloud API automation.
* Added MCP tools for WhatsApp messages, templates, media, contacts, phone numbers, business profile, analytics, safety helpers, and registration workflows.
* Added CLI binary commands: `wbmcp` and `whatsapp-business-mcp`.
* Added configuration, credential loading, validation, redaction, and HTTP guard utilities.
* Added documentation for setup, security, threat model, tooling, and available MCP tools.
