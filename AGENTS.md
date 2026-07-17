# zolv-stack Agent Instructions

## Project

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- The public Fileora experience is nested under `/fileora`.
- Conversion APIs live in `app/api/`; shared tool UI lives in `components/tools/`.
- Tool metadata and MIME mappings are centralized in `lib/utils.ts` and `lib/format-catalog.ts`.

## Working Rules

- Work on a focused `feature/`, `fix/`, `docs/`, or `chore/` branch. Do not push directly to `main`.
- Reuse existing components, route patterns, tool catalogs, and error helpers before introducing alternatives.
- Keep conversion inputs validated at the API boundary, including MIME type and size limits.
- Treat caught errors as `unknown`; use `getErrorMessage` from `lib/utils.ts` when presenting messages.
- Do not commit `.env*` values, credentials, private keys, deployment hosts, or generated `.next` output.
- Add browser-safe variables to `.env.example`. Only variables intentionally exposed to clients may use `NEXT_PUBLIC_`.
- Remember that `NEXT_PUBLIC_*` values are baked into the production artifact during GitHub Actions build.
- Keep deployment changes compatible with the Lightsail artifact release flow in `.github/workflows/deploy-main.yml` and `scripts/deploy-release.sh`.

## Validation

Run checks appropriate to the change:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

- Add or update Vitest coverage for logic in `lib/` and other testable behavior.
- Smoke-test affected upload, conversion, download, error, and responsive UI flows.
- A PR must explain why the change is needed, how it was tested, and any env or deployment impact.

## Tool Changes

When adding or changing a converter, inspect all relevant integration points:

- `lib/utils.ts`: `TOOL_CONFIG`, `ToolSlug`, `FORMAT_OUTPUT_MAP`, and categories.
- `lib/format-catalog.ts`: source/target formats, converter tools, labels, MIME mappings, and hero behavior.
- `components/tools/ToolPage.tsx` and related shared components.
- `app/(marketing)/fileora/(tools)/<slug>/page.tsx` for Fileora pages.
- The appropriate `app/api/<route>/route.ts` conversion endpoint.
- README feature/configuration documentation and `.env.example`, when applicable.

Use the project skill `contributing-to-zolv-stack` for the complete contribution checklist.
