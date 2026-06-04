export function printHelp(): void {
  console.log(`WBMCP - WhatsApp Business MCP server

Usage:
  wbmcp                 Start the MCP server using the configured transport (stdio by default)
  wbmcp run             Start the MCP server using the configured transport (stdio by default)
  wbmcp auth            Save WhatsApp Business Cloud API credentials locally
  wbmcp setup           Same as auth
  wbmcp setup codex     Save credentials and add WBMCP to Codex config
  wbmcp --help          Show this help

Local MCP setup:
  codex mcp add WBMCP -- npx -y wbmcp@latest
  npx -y wbmcp@latest auth

Hosted HTTPS mode:
  Set MCP_TRANSPORT=https plus MCP_HTTPS_CERT_FILE, MCP_HTTPS_KEY_FILE, and MCP_HTTPS_AUTH_TOKEN.
`);
}
