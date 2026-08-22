# Claude Code context

Project-specific notes for Claude Code. Portable coding standards live in `~/.claude/AGENTS.md` and the per-path rules in `~/.claude/rules/`. This file covers only things unique to this repo.

## Stack

- **Next.js 16** (App Router) + **React 19** with React Compiler on — never use `useMemo` / `useCallback` / `React.memo`, the compiler handles memoization.
- **Bun 1.3.6** (`packageManager` in [package.json](package.json)) — use `bun` for scripts, `bunx` for one-off binaries.
- **Tailwind v4** via `@tailwindcss/postcss`. All config is CSS-based in [lib/styles/tokens.css](lib/styles/tokens.css) + [lib/styles/index.css](lib/styles/index.css); there is no `tailwind.config.*` file.
- **Biome 2** for formatting + linting. Config in [biome.json](biome.json). `bun run format`, `bun run lint`, `bun run lint:fix`.
- **tsgo** for fast typechecking via `bun run typecheck` (uses `@typescript/native-preview`).
- **shadcn/ui** with the `radix-luma` preset + `neutral` base color + `phosphor` icon set. Components live in [components/ui/](components/ui/). The neutral grays are paired with a custom olive/gold `--primary` (`oklch(0.6162 0.1258 86.69)`) and a monochromatic chart ramp anchored on that same hue (86.69).

## Design tokens — how styling actually resolves

Two overlapping token systems that you must understand before touching CSS:

1. **Brand tokens** — defined in [lib/styles/tokens.css](lib/styles/tokens.css). The `@theme` block has `--color-*: initial`, `--font-*: initial`, `--breakpoint-*: initial`, and `--ease-*: initial` which **wipe all Tailwind defaults** for those namespaces, then define project-specific values (`--color-orange`, `--color-gray-500`, `--breakpoint-tablet: 768px`, etc.). As a result:
   - No default Tailwind colors: `bg-green-500` doesn't exist, but `bg-green` (the project's mint `#00ff9b`) does.
   - No default breakpoints: `sm:` / `md:` / `lg:` don't work. Use project breakpoints: `mobile:` (≥640px), `tablet:` (≥768px), `tablet-lg:` (≥1024px), `desktop:` (≥1440px), `desktop-large:` (≥1920px).

2. **shadcn tokens** — added in [lib/styles/index.css](lib/styles/index.css). Root CSS vars (`--background`, `--foreground`, `--primary`, `--chart-1`, …) are on `:root` (light mode) and `.dark` (dark mode), plus `@theme inline { --color-background: var(--background); … }` so Tailwind generates `bg-background`, `text-foreground`, etc.
   - Font families follow the same pattern: `--font-sans` (Figtree), `--font-heading` (Red Rose), `--font-mono` (Geist Mono). All three share the `--font-*` prefix.
   - **Dark mode binding**: a single `.dark` class on `<html>` drives all theming. `next-themes` (configured in [components/layout/theme/provider.tsx](components/layout/theme/provider.tsx)) toggles `class="dark"` via `attribute="class"`. Radix portals (`Dialog`, `Popover`, `Select`) mount in `document.body` and inherit from `<html>`, so no `className="dark"` overrides are needed on portaled content.

## Paths & imports

- Path alias `@/*` → project root (no `src/`).
- The `cn` helper is at [@/lib/styles/cn](lib/styles/cn.ts) — NOT `@/lib/utils`. Shadcn's default `utils` alias has been remapped in [components.json](components.json) to point at this file.
- There is no `react-hook-form` / `Form` wrapper component. For forms, use plain HTML `<form onSubmit>` with `useState`. See [components/design-system/form-layouts.tsx](components/design-system/form-layouts.tsx) for the pattern.
- Links: the project forbids raw `<a>` via a custom Biome plugin at `.biome/plugins/no-anchor-element.grit`. Always import `Link` from [@/components/ui/link](components/ui/link) — it dispatches between Next.js routing and external links.

## Design system

A living design system is browsable at **`/design-system`**. It visualizes tokens (colors, radii, shadows, typography, spacing, breakpoints, easings) and demos every component primitive in the repo. Wiring and showcase files live under [components/design-system/](components/design-system/). Any new primitive you add to `components/ui/` should get a tile in the matching showcase file.

Showcase layout convention (copy from [form-controls.tsx](components/design-system/form-controls.tsx)): a `ControlGroup` tile with `rounded border border-border bg-card p-4`, mono uppercase heading, muted description; outer grid `grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4`.

## Internationalization

- **Library**: `next-intl`. Locales **en** (default) + **es**. Routing is **`localePrefix: "as-needed"`** — English at `/`, Spanish at `/es/...`. Config in [i18n/routing.ts](i18n/routing.ts); messages in [messages/en.json](messages/en.json) + [messages/es.json](messages/es.json).
- **File layout**: User-facing pages live under `app/[locale]/`. The `app/layout.tsx` is the single `<html>` root and reads the active locale via `await getLocale()` from `next-intl/server`. `app/[locale]/layout.tsx` wraps `NextIntlClientProvider` and calls `setRequestLocale(locale)`.
- **Middleware**: [proxy.ts](proxy.ts) (Next 16 name for `middleware.ts`) runs `createMiddleware(routing)`. The matcher **excludes `/design-system`** — it stays English-only and outside `[locale]`. Any new dev-reference surface should follow the same pattern; new user-facing routes must go under `app/[locale]/`.
- **Adding strings**: add the key to **both** `messages/en.json` and `messages/es.json`. Server components use `await getTranslations("namespace")`; client components use `useTranslations("namespace")` (the nearest `[locale]/layout.tsx` provides the client context).
- **Linking**: `components/ui/link/index.tsx` imports `usePathname` from `next-intl/navigation` (not `next/navigation`) so active-state matching works against the locale-stripped path. When building hrefs, pass locale-less paths (`/foo`) — next-intl handles prefixing.
- **Metadata**: per-page localized metadata uses `generateMetadata` with `getTranslations("metadata")`. A proper `alternates.languages` hreflang map should be derived from `routing.locales` once there is more than one localized page.

## Git & commits

- No pre-commit hooks — run `bun run format` and `bun run lint:fix` before committing. Unsafe lint fixes (like `useSortedClasses`) need `bunx biome check --write --unsafe <files>`.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- Never add AI co-author lines in commits (per `~/.claude/rules/git.md`).
- Never skip hooks with `--no-verify` unless the user explicitly asks.

## Biome overrides that matter

- `components/ui/**/*.tsx` — `useSemanticElements`, `useKeyWithClickEvents`, `noNestedTernary`, `noArrayIndexKey` are off. Vendored shadcn code trips these; don't fight it.
- `lib/styles/tokens.css`, `lib/styles/global.css` — `noUnknownAtRules` and `noImportantStyles` off. `@custom-media` is a valid postcss-preset-env feature; the `!important` in `desktop-only` / `mobile-only` utilities is intentional.

## Scripts worth knowing

```bash
bun run dev            # Turbopack dev server at :3000
bun run typecheck      # tsgo --noEmit
bun run lint           # biome lint
bun run format         # biome format --write
bun run build          # next build
```

## Tooling & MCP

- **MCP servers** are defined in [.mcp.json](.mcp.json): `next-devtools` and `codegraph`. Claude Code loads both per-project (restart the agent after changing `.mcp.json`).
- **CodeGraph** ([docs](https://colbymchenry.github.io/codegraph/)) is a local-first, tree-sitter knowledge graph of the codebase exposed over MCP (`codegraph_*` tools: symbol search, callers/callees, impact). [.codegraph/config.json](.codegraph/config.json) is committed so the graph activates on clone; the `codegraph.db` index is machine-local and gitignored. Requires the `codegraph` binary (`npx @colbymchenry/codegraph` or the install script) — build the index with `codegraph init -i`, refresh with `codegraph sync`.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->