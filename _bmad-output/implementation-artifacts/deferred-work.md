# Deferred Work

## Deferred from: code review of 1-1-project-scaffolding-dev-environment (2026-04-29)

- Hardcoded port 3000 with no `PORT` env var — backend should use `process.env.PORT || 3000` (Epic 5)
- CORS allows all origins — `@fastify/cors` registered with no options, should use `CORS_ORIGIN` env var (Story 1.2)
- Helmet defaults block inline styles — will break Chakra UI CSS-in-JS when backend serves frontend (Epic 5)
- No root-level build/test/dev scripts — add `yarn workspaces foreach` convenience scripts
- No `process.on('unhandledRejection')` handler — add for production robustness (Epic 5)
