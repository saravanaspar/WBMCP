# Threat Model

## Assets

- Meta Graph API access token
- Optional app secret reserved for future webhook verification
- WhatsApp Business Account and phone number identifiers
- Customer phone numbers
- Message bodies and template parameters
- Media IDs and media URLs
- Business profile and template metadata
- MCP tool and resource outputs

## Trust Boundaries

- MCP client to MCP server stdio boundary
- MCP client to native HTTPS MCP Streamable HTTP boundary
- MCP server process to Meta Graph API over HTTPS
- Environment variables to runtime configuration
- Tool arguments from model/client context to validated service calls
- Audit logging to stderr

## Attacker Model

Attackers may control or influence MCP tool arguments, prompt content, template parameters, message bodies, media URLs, or an MCP client configuration. A malicious client may attempt to call dangerous tools, exfiltrate resource data, force bulk sends, or trigger verbose errors that leak secrets.

## MCP-Specific Risks

- Prompt injection through tool arguments
- Malicious MCP clients calling tools directly
- Overbroad tool permissions
- Data exfiltration through resources
- Accidental message sends
- Tool poisoning or ambiguous tool names
- Unauthenticated or weakly protected HTTPS MCP exposure if bound to a public interface

## WhatsApp-Specific Risks

- Meta token leakage
- Unauthorized sends
- Opt-in or policy violations
- Message body leakage
- Media URL leakage
- Template misuse
- Accidental deletion of templates or media
- Exposing full recipient phone numbers in logs

## Mitigations Implemented

- Startup environment validation
- Strict Zod validation for every tool
- E.164 recipient validation
- HTTPS media URL validation
- Message and caption length limits
- Template parameter limits
- One-recipient-per-call send tools; throughput, messaging tiers, and anti-abuse enforcement are delegated to Meta
- Dangerous-tool guard disabled by default
- MCP annotations for read-only, destructive, and idempotent hints
- Redacted audit logging
- Safe `WhatsAppApiError` objects
- No token exposure through resources or tools
- No local media download
- No WhatsApp Web automation
- Central Graph API client with timeout and GET-only automatic retry policy
- stdio transport remains the default
- HTTPS native TLS with operator-supplied certificate and key files
- Plaintext HTTP transport is rejected
- HTTPS sessions have max-count and idle-timeout guards

## Mitigations Deferred

- Webhook receiver for asynchronous message delivery/read/failed status tracking
- Stronger HTTPS authorization beyond a single static bearer token
- HTTPS allowed-origin controls
- Webhook signature verification
- Safe local media upload/download path policy
- Tenant-level policy engine
- Per-tool allowlists by MCP client identity
- Persistent idempotency storage
- Compliance workflows for opt-in evidence
- CI security scanning and release signing
