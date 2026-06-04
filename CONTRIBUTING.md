# Contributing

Thank you for contributing to `WBMCP`: <https://github.com/saravanaspar/WBMCP>.

The repository name is `WBMCP`; the npm package and executable remain lowercase `wbmcp`.

## Scope

Contributions must keep the project MCP-only unless maintainers explicitly accept a scope change.

Do not add:

- WhatsApp Web automation
- QR login automation
- Browser automation
- Unofficial WhatsApp clients
- Personal WhatsApp account automation
- User-facing REST APIs
- Dashboards
- Webhook hosting
- CRM integrations
- Campaign or bulk messaging features

## Development

Run before opening a pull request:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Security Expectations

- Do not commit real secrets.
- Do not add tests, fixtures, docs, or examples containing real tokens, real customer phone numbers, or private message bodies.
- Validate all external inputs with Zod.
- Keep dangerous operations fail-closed.
- Do not log Authorization headers, access tokens, full phone numbers, message bodies, or media URLs with query strings.

## Code Style

- TypeScript strict mode
- No `any`
- Small modules and explicit service boundaries
- Prefer native Node APIs before adding dependencies
- Keep tool schemas and service payloads typed
- Add focused tests for validation, redaction, and safety behavior
