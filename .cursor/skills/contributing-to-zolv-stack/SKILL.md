---
name: contributing-to-zolv-stack
description: Use when implementing, fixing, reviewing, or documenting zolv-stack features, converters, Fileora pages, API routes, environment configuration, CI, deployment, or pull requests.
---

# Contributing to zolv-stack

## Goal

Make focused changes that preserve the shared conversion catalogs, Fileora routing, CI gates, and Lightsail artifact deployment.

Read `AGENTS.md` first. Then inspect the existing implementation nearest to the requested change; do not infer architecture from generic Next.js conventions.

## Workflow

1. Confirm the branch is not `main`; use `feature/`, `fix/`, `docs/`, or `chore/`.
2. Check the working tree before editing and preserve unrelated user changes.
3. Find the nearest existing page, component, API route, catalog entry, and test.
4. Implement the smallest coherent change using existing patterns.
5. Update tests and documentation affected by the change.
6. Run the validation matrix below.
7. Prepare a PR summary with behavior, verification, env changes, and deployment impact.

## Converter Integration Checklist

For a new or changed converter, inspect each applicable location:

- `lib/utils.ts`
  - `TOOL_CONFIG`
  - `ToolSlug`
  - `FORMAT_OUTPUT_MAP`
  - `TOOL_CATEGORIES`
  - `FILEORA_BASE` and `toolHref`
- `lib/format-catalog.ts`
  - `FormatValue`, labels, and MIME mappings
  - `CONVERTER_TOOLS` and `SOURCE_FORMATS`
  - source/target option generation
  - hero pairs, copy, and route resolution
- `components/tools/ToolPage.tsx` and shared uploader/converter components
- `app/(marketing)/fileora/(tools)/<slug>/page.tsx`
- the appropriate `app/api/<route>/route.ts`
- README features and `.env.example`, if user setup changes

Do not add a page or API route without checking the catalogs; incomplete registration can make a tool unreachable or inconsistent across upload and hero flows.

## API and Error Handling

- Validate file presence, MIME/type support, and size before processing.
- Keep privileged API keys server-side; never expose them through `NEXT_PUBLIC_*`.
- Use explicit status codes and JSON errors for failed API requests.
- Catch errors as `unknown`; use `getErrorMessage` for safe messages.
- Clean up temporary files on success and failure.
- Consider Lightsail memory and disk limits before adding native or model-heavy dependencies.

## Environment Variables

- Add variable names and safe placeholders to `.env.example`.
- Document required, optional, and browser-exposed variables in README.
- `NEXT_PUBLIC_*` is public and baked in during `npm run build`.
- Production public values come from GitHub Environment `production` variables in the deployment workflow.
- Lightsail host, SSH key, app directory, and health-check settings remain GitHub Environment secrets.

## Validation Matrix

- Documentation only: `git diff --check`; verify commands, paths, and variable names.
- TypeScript/UI change: `npm run lint`, `npm run typecheck`, and relevant Vitest tests.
- Converter/API/catalog change: relevant tests plus `npm test` and `npm run build`.
- CI/deployment change: validate YAML/shell syntax and verify env/secrets are referenced from the intended GitHub environment.

Before declaring completion, report exactly which checks ran and distinguish warnings from errors.

## Pull Request Contract

Include:

- what changed and why;
- user-visible behavior;
- test commands and manual checks;
- screenshots for visible UI changes;
- new dependencies or environment variables;
- deployment, resource, or rollback considerations.

Never commit secrets, real `.env` values, private keys, `.next`, or server-specific credentials.
