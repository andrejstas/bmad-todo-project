---
title: 'Fix delete button failing silently due to Content-Type on bodyless requests'
type: 'bugfix'
created: '2026-04-30'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** Clicking the delete button on a task appeared to toggle completion instead of deleting. The root cause: `apiFetch` unconditionally set `Content-Type: application/json` on all requests, including DELETE (which has no body). Fastify v5 classifies DELETE as a body-capable method and rejects empty JSON bodies with `FST_ERR_CTP_EMPTY_JSON_BODY`, causing the optimistic deletion to roll back.

**Approach:** Only set the `Content-Type: application/json` header when the request actually carries a body (`options?.body` is truthy). Updated the corresponding test expectation for GET requests.

## Suggested Review Order

1. [packages/frontend/src/api/client.ts](../../packages/frontend/src/api/client.ts) — core fix: conditional Content-Type header
2. [packages/frontend/src/api/tasks.test.ts](../../packages/frontend/src/api/tasks.test.ts) — test expectation updated for bodyless GET
