# Tooling

## Repository

Canonical source repository: <https://github.com/saravanaspar/WBMCP>

The repository name is `WBMCP`; the npm package and CLI executable are lowercase `wbmcp`.

## Runtime

- Node.js 20+
- TypeScript ESM package
- stdio MCP transport for local `npx` MCP clients
- MCP Streamable HTTP transport over native HTTPS for explicit hosted deployments
- Native HTTPS transport with PEM certificate and key files

## Main Commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
npm run pack:dry-run
```

User-facing CLI after npm publish or local package installation:

```bash
codex mcp add WBMCP -- npx -y wbmcp@latest
npx -y wbmcp@latest auth
npx -y wbmcp@latest setup codex
```

## Transport Modes

Default local `npx` mode uses stdio. It does not open an inbound port and does not require TLS files:

```bash
MCP_TRANSPORT=stdio npm start
```

Optional hosted HTTPS mode. Use this only when intentionally exposing WBMCP as a remote MCP endpoint:

```bash
MCP_TRANSPORT=https \
MCP_HTTPS_AUTH_TOKEN=replace-with-at-least-32-random-characters \
MCP_HTTPS_HOST=127.0.0.1 \
MCP_HTTPS_PORT=3443 \
MCP_HTTPS_CERT_FILE=/absolute/path/to/cert.pem \
MCP_HTTPS_KEY_FILE=/absolute/path/to/key.pem \
npm start
```

The HTTPS listener exposes MCP Streamable HTTP at `MCP_HTTPS_PATH`, default `/mcp`, and requires `Authorization: Bearer <MCP_HTTPS_AUTH_TOKEN>`. HTTPS variables are ignored while `MCP_TRANSPORT=stdio`.

Manual HTTPS smoke requests must include `Accept: application/json, text/event-stream`; otherwise the MCP SDK returns `406 Not Acceptable` before request handling reaches server tools.

Optional secrets such as `WHATSAPP_APP_SECRET` should be omitted when unused. Empty optional secret values are invalid by design.

## Package Shape

The package exposes these bin entries after build:

```json
{
  "wbmcp": "./dist/index.js",
  "whatsapp-business-mcp": "./dist/index.js"
}
```

`npm pack` and `npm publish` run `npm run build` first through `prepack`, so published archives contain fresh `dist/` output. The package metadata points to <https://github.com/saravanaspar/WBMCP>. After publishing, MCP clients can launch the server with `npx -y wbmcp@latest`.

## Dependency Policy

Dependencies are intentionally small:

- Official MCP TypeScript SDK
- Zod v4
- Native Node fetch/FormData APIs
- Vitest, TypeScript, ESLint, and tsx for development
