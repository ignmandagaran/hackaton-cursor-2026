# Next.js Starter

A modern, opinionated [Next.js](https://nextjs.org) starter template — App Router, React 19 + React Compiler, Tailwind v4, shadcn/ui, next-intl, and Biome.

> **Using this template?** Click **“Use this template”** on GitHub (or `gh repo create <name> --template <owner>/<repo>`), then make it yours:
>
> 1. Edit [`lib/config/site.ts`](lib/config/site.ts) — name, description, URL.
> 2. Update the localized strings in [`messages/en.json`](messages/en.json) and [`messages/es.json`](messages/es.json).
> 3. Set `name` / `description` in [`package.json`](package.json).
> 4. Copy `.env.example` to `.env.local` and fill in what you need.

## Quick Start

```bash
bun install
cp .env.example .env.local
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The living design system is at [http://localhost:3000/design-system](http://localhost:3000/design-system).

## Stack

- **Next.js 16** (App Router) + **React 19** with the React Compiler enabled
- **Bun** as the package manager and runtime
- **Tailwind CSS v4** (CSS-based config, no `tailwind.config.*`)
- **shadcn/ui** (`radix-luma` preset, `neutral` base, `phosphor` icons)
- **next-intl** for i18n (`en` default, `es`)
- **Biome** for formatting + linting
- **tsgo** for fast typechecking

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start the development server |
| `bun dev:https` | Start the development server with HTTPS |
| `bun build` | Build for production |
| `bun start` | Start the production server |
| `bun lint` | Run Biome |
| `bun lint:fix` | Run Biome with fixes |
| `bun format` | Format the codebase |
| `bun typecheck` | Run TypeScript |
| `bun analyze` | Analyze the Next.js bundle |

## Project Structure

```txt
app/                 # App Router routes (user pages under app/[locale])
components/          # UI primitives (components/ui) + layout + design-system
lib/
  config/site.ts     # ← site identity (edit this first)
  hooks/
  integrations/
  scripts/
  store/
  styles/
    index.css        # shadcn token layer (:root + .dark)
    tokens.css       # brand palette, breakpoints, easings, utilities
    global.css       # reset + app-wide global styles
    fonts.ts         # font variables
    cn.ts
  utils/
messages/            # next-intl translation catalogs
```

## Customizing

### Identity

All branding flows from [`lib/config/site.ts`](lib/config/site.ts) — it feeds page metadata, JSON-LD, the header/footer wordmark, and the Open Graph image. The user-facing copy (home title, metadata) lives in the `messages/*.json` catalogs.

### Fonts

Loaded via `next/font/google` in `app/layout.tsx` (`lib/styles/fonts.ts` holds the mono variable):

| Role | Family | Token | Weights |
|------|--------|-------|---------|
| Sans (body) | Figtree | `--font-sans` | 300–700 |
| Heading | Red Rose | `--font-heading` | 300–700 |
| Mono | Geist Mono | `--font-mono` | variable |

### Theme & colors

- **Base color**: shadcn `neutral` (pure-gray scale), defined as OKLCH tokens in `lib/styles/index.css`.
- **Primary**: olive/gold `oklch(0.6162 0.1258 86.69)`, with a monochromatic chart ramp on the same hue.
- **Dark mode**: a single `.dark` class on `<html>` (toggled by `next-themes`); no `data-theme` attribute.
