# Repository Guidelines

## Project Structure & Module Organization

Next.js App Router code lives in `app/`; static assets belong in `public/`. The API contract is `openapi/openapi.json`, Swagger UI lives in `app/api-doc/`, and Hey API generates `lib/api-client/`—never edit it manually. Playwright tests live in `tests/e2e/`. Spex rules and Local File Tracker adapters are under `.codex/`; specifications belong in `specs/`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: create the production build.
- `npm start`: serve an existing production build.
- `npm run lint`: run ESLint with Next.js and TypeScript rules.
- `npm run generate:api`: regenerate `lib/api-client/` from the OpenAPI contract.
- `npm run test:e2e`: run Playwright tests headlessly.
- `npm run test:e2e:ui`: open Playwright's interactive runner.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, and semicolons. Use PascalCase for components, camelCase for functions and variables, and lowercase kebab-case for route folders. Follow Next.js names such as `page.tsx`, `layout.tsx`, and `route.ts`; prefer the `@/` import alias.

## Testing Guidelines

Name Playwright tests `*.e2e.ts`. Cover visible outcomes and browser errors. No numeric coverage threshold is configured; add focused verification for each feature or regression. Test artifacts belong in `test-results/`, `playwright-report/`, and `blob-report/`.

## Commit & Pull Request Guidelines

Use Traditional Chinese Conventional Commits, for example `feat: [checkout] 新增購物車結帳流程`. Spex commits include a verified Local File Tracker child ID when available. Target PRs to `dev`; include a summary, linked spec or issue, validation commands, and UI screenshots. Separate unrelated changes.

## API and Security Notes

Update `openapi/openapi.json` first, then regenerate the client. Do not commit credentials, tokens, local environment files, or generated test reports.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
