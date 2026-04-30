# Security Review

## Overview

This document summarizes the security posture of the bmad todo application, covering input validation, XSS prevention, security headers, CORS, Docker hardening, dependency management, and sensitive data handling.

## Findings

### Input Validation — PASS

Backend uses Fastify's built-in JSON Schema validation (Ajv) on all endpoints:

- **POST /api/tasks:** `text` field required, string type, 1-500 characters, `additionalProperties: false`
- **PATCH /api/tasks/:id:** Optional `text` (1-500 chars) and/or `completed` (boolean), at least 1 property required, `additionalProperties: false`
- **DELETE /api/tasks/:id:** `id` parameter required as string

Invalid requests return 400 with Fastify's default validation error format. No user input reaches the store without passing schema validation.

### XSS Prevention — PASS

- All user-provided text is rendered via React JSX (`<Text>{task.text}</Text>`), which automatically escapes HTML entities
- Zero instances of `dangerouslySetInnerHTML` in the codebase
- Input fields use React controlled components (`value` + `onChange`)
- ARIA labels use string interpolation, not HTML: `aria-label={task.text}`

### Security Headers — PASS

`@fastify/helmet` is registered with default configuration, providing:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection (legacy browser support)

### CORS Configuration — ACCEPTABLE (with note)

```typescript
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
})
```

When `CORS_ORIGIN` is set (e.g., `http://localhost:8080` in docker-compose.yml), only that origin is allowed. The fallback to `true` allows all origins during local development. This is acceptable for this project because:

- No authentication, no sessions, no cookies — there's nothing to steal via CSRF
- No sensitive data stored — the app is stateless with in-memory storage
- The `true` default only applies when the env var is unset (local dev)
- In Docker, `CORS_ORIGIN` is explicitly set to `http://localhost:8080`

For a production app with auth, this would need a restrictive default.

### Docker Security — PASS

**Backend container:**
- Base image: `node:22-slim` (minimal attack surface)
- Runs as non-root: `USER node` (uid 1000)
- Multi-stage build: production image contains only compiled JS + production dependencies
- No devDependencies, no TypeScript source in final image
- `yarn install --immutable` ensures reproducible builds

**Frontend container:**
- Base image: `nginxinc/nginx-unprivileged:stable-alpine` (non-root nginx)
- Runs as uid 101 (nginx unprivileged default)
- Listens on port 8080 (non-privileged port)
- Multi-stage build: production image contains only Vite build output + nginx config
- No Node.js, no node_modules, no source code in final image

### Dependencies — PASS

- All dependencies are current, actively maintained versions
- `yarn.lock` ensures deterministic installs
- Key versions: Fastify 5.3, React 19.1, Chakra UI 3.34, Node.js 22
- No known vulnerabilities at time of review
- Recommendation: run `yarn audit` periodically

### Sensitive Data — PASS

- No API keys, secrets, tokens, or credentials in source code
- Environment variables used for configuration (`PORT`, `HOST`, `CORS_ORIGIN`)
- No authentication — no session tokens, no cookies, no PII stored
- `.gitignore` excludes `node_modules`, `dist`, IDE files
- Note: `.env` files don't exist but adding `.env*` to `.gitignore` would be good practice

## Summary

| Area | Status |
|------|--------|
| Input Validation | Pass |
| XSS Prevention | Pass |
| Security Headers | Pass |
| CORS | Acceptable |
| Docker Backend | Pass |
| Docker Frontend | Pass |
| Dependencies | Pass |
| Sensitive Data | Pass |

No critical or high-severity security issues found. The application follows OWASP best practices for input validation, output encoding, security headers, and container hardening. The permissive CORS default is appropriate given the absence of authentication and sensitive data.
