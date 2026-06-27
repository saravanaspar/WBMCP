# Changelog

All notable changes to WBMCP are documented here.

This project follows semantic versioning for npm releases.

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
