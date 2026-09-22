# Vercel serverless deployment for NestJS backend

## Objective
Make the backend deployable on Vercel (serverless functions) while keeping the
existing local dev workflow (`npm run start:dev`, `npm run start:prod`) working
exactly as before.

## Problem
- No `vercel.json` and no `api/` entrypoint exist in the repo. Vercel has no
  serverless function to route traffic to, so deployments serve nothing.
- `src/main.ts` calls `app.listen()`, which is a persistent-server pattern,
  incompatible with Vercel's per-request serverless model as-is.
- `BookingsGateway` uses Socket.io (WebSockets), which do not work in Vercel
  serverless functions (no persistent connections between invocations).

## Decision (user-approved)
- Adapt Nest bootstrap to export `createApp()` (no `.listen()`), reused by both
  the local bootstrap and a new Vercel serverless handler.
- WebSockets: keep the gateway code as-is (already has a `if (this.server)`
  guard around emits), but it is understood/accepted that realtime
  notifications will be a no-op in production on Vercel. No infra migration
  (Pusher/Ably) requested at this time.
- Serverless entry compiles through the existing `nest build` (tsc) output
  (`dist/main.js`), not through Vercel's esbuild TS pipeline directly, to avoid
  known NestJS decorator-metadata bundling issues with esbuild.

## Scope
1. `src/main.ts` — extract `createApp()`; guard `bootstrap()` call with
   `require.main === module` so importing the module doesn't auto-start a
   server.
2. `api/index.js` (new) — plain CommonJS serverless handler that requires
   `../dist/main`, lazily creates + caches the Nest app (`app.init()`, no
   `.listen()`), and forwards `(req, res)` to the underlying Express instance.
3. `vercel.json` (new) — explicit `buildCommand: npm run build`, function
   config for `api/index.js`, and a catch-all rewrite to `/api`.
4. `.env.example` (new) — documents `MONGO_URI`, `PORT`, `NODE_ENV` for local
   setup parity with production env vars.

## Out of scope / manual steps for the user (cannot be done from code)
- Set `MONGO_URI` in the Vercel project's Environment Variables (must point to
  a reachable MongoDB, e.g. Atlas — `localhost` will never work from Vercel).
- In MongoDB Atlas Network Access, allow `0.0.0.0/0` (Vercel serverless has no
  static IP).
- Set `NODE_ENV=production` in Vercel (Vercel sets this by default, verify).

## Tasks
- [x] T1 — Explore repo, confirm root cause (no vercel.json/api, `app.listen`,
      websocket gateway). Route: read-only inline.
- [x] T2 — User decision on WebSockets in prod (recommended: no-op).
- [x] T3 — Refactor `src/main.ts` to export `createApp()` + guard bootstrap.
- [x] T4 — Add `api/index.js` serverless handler with cached app instance.
- [x] T5 — Add `vercel.json` with explicit build command + rewrites.
- [x] T6 — Add `.env.example`.
- [x] T7 — Verify: `npm run build` succeeds, `npm test` still passes, local
      `npm run start:dev` still boots normally (manual smoke by user is fine).
- [ ] T8 — Commit as one work unit on a feature branch.

## TDD mode
No test runner config for deployment/infra changes (not unit-testable business
logic). Applicable checks: `npm run build`, `npm test` (existing suite must
stay green — no regression), manual local boot smoke check.

## Route
Delegated direct (writer): touches 3 non-trivial new/changed files
(`main.ts`, `api/index.js`, `vercel.json`) plus a config doc. Fully designed
already — no unresolved research for the writer.

## Delivery
Single small change, well under the ~400 line delivery heuristic. No chaining
needed. One work-unit commit on a feature branch.

## Verification results

### `npm run build`
```
> bookin-back@0.0.1 build
> nest build

```
Exit code 0, no TypeScript errors.

### `npm test`
```
Test Suites: 7 passed, 7 total
Tests:       75 passed, 75 total
Snapshots:   0 total
Time:        23.797 s
Ran all test suites.
```
All 75 tests pass, same as before the change. The `console.error` lines in
the output are expected log statements exercised by the existing error-path
tests in `bookings.controller.spec.ts` and `bookings.service.spec.ts` (not
failures).

### `dist/main.js` exports `createApp`
```
Select-String -Path dist\main.js -Pattern "exports.createApp" | Measure-Object | Select-Object -ExpandProperty Count
1
```
Confirmed: `dist/main.js` exports `createApp` after build.
