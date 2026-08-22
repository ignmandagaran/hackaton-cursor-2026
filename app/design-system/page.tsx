import type { Metadata } from "next"
import { AdvancedInputs } from "@/components/design-system/advanced-inputs"
import { DataComponents } from "@/components/design-system/data-components"
import { DisplayComponents } from "@/components/design-system/display-components"
import { FormControls } from "@/components/design-system/form-controls"
import { FormLayouts } from "@/components/design-system/form-layouts"
import { LayoutComponents } from "@/components/design-system/layout-components"
import { OverlayComponents } from "@/components/design-system/overlay-components"
import { Wrapper } from "@/components/layout/wrapper"
import { Heading, Text } from "@/components/ui/typography"
import { cn } from "@/lib/styles/cn"

export const metadata: Metadata = {
  title: "Design System",
  description: "Visual reference for design tokens.",
}

const brandColors = [
  { name: "black", value: "var(--color-black)" },
  { name: "white", value: "var(--color-white)" },
  { name: "orange", value: "var(--color-orange)" },
  { name: "blue", value: "var(--color-blue)" },
  { name: "green", value: "var(--color-green)" },
  { name: "violet", value: "var(--color-violet)" },
  { name: "pink", value: "var(--color-pink)" },
  { name: "gray", value: "var(--color-gray)" },
]

const grayScale = [
  { name: "gray-50", value: "var(--color-gray-50)" },
  { name: "gray-100", value: "var(--color-gray-100)" },
  { name: "gray-200", value: "var(--color-gray-200)" },
  { name: "gray-300", value: "var(--color-gray-300)" },
  { name: "gray-400", value: "var(--color-gray-400)" },
  { name: "gray-500", value: "var(--color-gray-500)" },
  { name: "gray-600", value: "var(--color-gray-600)" },
  { name: "gray-700", value: "var(--color-gray-700)" },
  { name: "gray-800", value: "var(--color-gray-800)" },
]

const shadcnColors = [
  { name: "background", fg: "foreground" },
  { name: "foreground", fg: "background" },
  { name: "card", fg: "card-foreground" },
  { name: "popover", fg: "popover-foreground" },
  { name: "primary", fg: "primary-foreground" },
  { name: "secondary", fg: "secondary-foreground" },
  { name: "muted", fg: "muted-foreground" },
  { name: "accent", fg: "accent-foreground" },
  { name: "destructive", fg: "background" },
  { name: "border", fg: "foreground" },
  { name: "input", fg: "foreground" },
  { name: "ring", fg: "background" },
]

const chartColors = [
  { name: "chart-1" },
  { name: "chart-2" },
  { name: "chart-3" },
  { name: "chart-4" },
  { name: "chart-5" },
]

const radii = [
  { name: "sm", token: "--radius-sm" },
  { name: "md", token: "--radius-md" },
  { name: "lg", token: "--radius-lg" },
  { name: "xl", token: "--radius-xl" },
  { name: "2xl", token: "--radius-2xl" },
  { name: "3xl", token: "--radius-3xl" },
  { name: "4xl", token: "--radius-4xl" },
]

const shadows = [
  { name: "none", className: "shadow-none" },
  { name: "2xs", className: "shadow-2xs" },
  { name: "xs", className: "shadow-xs" },
  { name: "sm", className: "shadow-sm" },
  { name: "md", className: "shadow-md" },
  { name: "lg", className: "shadow-lg" },
  { name: "xl", className: "shadow-xl" },
  { name: "2xl", className: "shadow-2xl" },
  { name: "inner", className: "shadow-inner" },
]

const breakpoints = [
  { name: "mobile", value: "640px" },
  { name: "tablet", value: "768px" },
  { name: "tablet-lg", value: "1024px" },
  { name: "desktop", value: "1440px" },
  { name: "desktop-large", value: "1920px" },
]

const eases = [
  "in-quad",
  "in-cubic",
  "in-quart",
  "in-quint",
  "in-expo",
  "in-circ",
  "out-quad",
  "out-cubic",
  "out-quart",
  "out-quint",
  "out-expo",
  "out-circ",
  "in-out-quad",
  "in-out-cubic",
  "in-out-quart",
  "in-out-quint",
  "in-out-expo",
  "in-out-circ",
  "gleasing",
]

const fontFamilies = [
  {
    name: "sans",
    className: "font-sans",
    source: "Figtree",
    token: "--font-sans",
    usage: "Default for body copy (shadcn components).",
  },
  {
    name: "heading",
    className: "font-heading",
    source: "Red Rose",
    token: "--font-heading",
    usage: "Display + headings (shadcn Dialog titles, etc).",
  },
  {
    name: "mono",
    className: "font-mono",
    source: "Geist Mono",
    token: "--font-mono",
    usage: "Labels, code, tabular values.",
  },
]

const typeScale = [
  { name: "xs", className: "text-xs" },
  { name: "sm", className: "text-sm" },
  { name: "base", className: "text-base" },
  { name: "lg", className: "text-lg" },
  { name: "xl", className: "text-xl" },
  { name: "2xl", className: "text-2xl" },
  { name: "3xl", className: "text-3xl" },
  { name: "4xl", className: "text-4xl" },
  { name: "5xl", className: "text-5xl" },
  { name: "6xl", className: "text-6xl" },
]

const spacingSamples = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-border border-t py-8">
      <header className="flex flex-col gap-1">
        <h2 className="font-mono text-sm uppercase tracking-wide">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

function Swatch({
  name,
  value,
  textColor,
}: {
  name: string
  value: string
  textColor?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="aspect-square w-full rounded border border-border"
        style={{ backgroundColor: value }}
      />
      <div className="flex flex-col gap-0.5 font-mono text-xs">
        <span className={cn(textColor)}>{name}</span>
        <span className="truncate text-muted-foreground" title={value}>
          {value}
        </span>
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <Wrapper>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-safe py-12">
        <header className="flex flex-col gap-2 pb-8">
          <h1 className="font-mono text-3xl uppercase tracking-tight">
            Design System
          </h1>
          <p className="text-muted-foreground text-sm">
            Visual reference for the design tokens defined in{" "}
            <code className="font-mono text-foreground">
              lib/styles/tokens.css
            </code>{" "}
            and the shadcn tokens in{" "}
            <code className="font-mono text-foreground">
              lib/styles/index.css
            </code>
            .
          </p>
        </header>

        <Section title="Palette" description="Brand colors.">
          <div className="grid desktop:grid-cols-8 grid-cols-2 tablet:grid-cols-4 gap-4">
            {brandColors.map((c) => (
              <Swatch key={c.name} name={c.name} value={c.value} />
            ))}
          </div>
        </Section>

        <Section title="Gray scale">
          <div className="grid desktop:grid-cols-9 grid-cols-3 tablet:grid-cols-5 gap-4">
            {grayScale.map((c) => (
              <Swatch key={c.name} name={c.name} value={c.value} />
            ))}
          </div>
        </Section>

        <Section
          title="Shadcn tokens"
          description="Paired foreground / background tokens from shadcn. Swap between light and dark based on the active theme."
        >
          <div className="grid desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 gap-3">
            {shadcnColors.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-lg border border-border p-4"
                style={{
                  backgroundColor: `var(--${c.name})`,
                  color: `var(--${c.fg})`,
                }}
              >
                <span className="font-mono text-sm">{c.name}</span>
                <span className="font-mono text-xs opacity-70">{c.fg}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Chart colors">
          <div className="grid grid-cols-5 gap-4">
            {chartColors.map((c) => (
              <Swatch key={c.name} name={c.name} value={`var(--${c.name})`} />
            ))}
          </div>
        </Section>

        <Section
          title="Border radius"
          description="Derived from --radius. Scales from sm (0.6×) to 4xl (2.6×)."
        >
          <div className="grid desktop:grid-cols-7 grid-cols-2 tablet:grid-cols-4 gap-4">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col gap-2">
                <div
                  className="aspect-square w-full border border-primary bg-muted"
                  style={{ borderRadius: `var(${r.token})` }}
                />
                <span className="font-mono text-xs">{r.name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Shadows"
          description="Elevation scale. Preview on a light surface so shadows are visible."
        >
          <div className="rounded-lg bg-gray-50 p-8">
            <div className="grid desktop:grid-cols-5 grid-cols-2 tablet:grid-cols-3 gap-6">
              {shadows.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "flex size-20 items-center justify-center rounded-lg bg-white",
                      s.className
                    )}
                  />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-gray-800 text-xs">
                      {s.name}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {s.className}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="Typography"
          description="Font families, Tailwind type scale, and custom utilities."
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                Font families
              </h3>
              <div className="grid grid-cols-1 tablet:grid-cols-3 gap-3">
                {fontFamilies.map((f) => (
                  <div
                    key={f.name}
                    className="flex flex-col gap-3 rounded border border-border p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                        {f.name}
                      </span>
                      <span className="font-mono text-muted-foreground text-xs">
                        {f.token}
                      </span>
                    </div>
                    <p className={cn("text-2xl leading-tight", f.className)}>
                      Aa Bb Cc 123
                    </p>
                    <p className={cn("text-sm", f.className)}>
                      The quick brown fox jumps over the lazy dog.
                    </p>
                    <div className="flex flex-col gap-0.5 pt-1">
                      <span className="font-mono text-foreground text-xs">
                        {f.source}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {f.usage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                Type scale
              </h3>
              {typeScale.map((t) => (
                <div
                  key={t.name}
                  className="flex items-baseline gap-6 border-border border-b pb-2"
                >
                  <span className="w-16 shrink-0 font-mono text-muted-foreground text-xs">
                    {t.name}
                  </span>
                  <span className={t.className}>The quick brown fox</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                Utilities
              </h3>
              <p className="test-mono">test-mono utility</p>
            </div>

            <div className="flex flex-col gap-8 rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                  Heading
                </h3>
                <div className="flex flex-col gap-3">
                  <Heading as="h1" size="9">
                    Heading size 9
                  </Heading>
                  <Heading as="h2" size="7">
                    Heading size 7
                  </Heading>
                  <Heading as="h3" size="5">
                    Heading size 5
                  </Heading>
                  <Heading as="h4" size="3" weight="medium">
                    Heading size 3, weight medium
                  </Heading>
                </div>
                <div className="flex flex-wrap items-baseline gap-4">
                  <Heading size="4" weight="light">
                    light
                  </Heading>
                  <Heading size="4" weight="regular">
                    regular
                  </Heading>
                  <Heading size="4" weight="medium">
                    medium
                  </Heading>
                  <Heading size="4" weight="bold">
                    bold
                  </Heading>
                </div>
                <Heading size="4" color="muted">
                  Muted heading color
                </Heading>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-mono text-muted-foreground text-xs uppercase tracking-wide">
                  Text
                </h3>
                <div className="flex flex-col gap-2">
                  <Text size="5">
                    Size 5 — The quick brown fox jumps over the lazy dog.
                  </Text>
                  <Text size="4">
                    Size 4 — The quick brown fox jumps over the lazy dog.
                  </Text>
                  <Text size="3">
                    Size 3 (default) — The quick brown fox jumps over the lazy
                    dog.
                  </Text>
                  <Text size="2" color="muted">
                    Size 2, muted — Smaller body text for annotations.
                  </Text>
                  <Text size="1" color="muted">
                    Size 1, muted — Tiniest captions.
                  </Text>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Text color="default">default</Text>
                  <Text color="muted">muted</Text>
                  <Text color="primary">primary</Text>
                  <Text color="destructive">destructive</Text>
                </div>
                <Text as="p" size="2" color="muted" align="center">
                  Rendered as &lt;p&gt; with center alignment.
                </Text>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Spacing"
          description="Based on --spacing: 0.25rem. Sampled multiples."
        >
          <div className="flex flex-col gap-3">
            {spacingSamples.map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className="w-12 shrink-0 font-mono text-muted-foreground text-xs">
                  {s}
                </span>
                <div
                  className="h-3 bg-primary"
                  style={{ width: `calc(var(--spacing) * ${s})` }}
                />
                <span className="font-mono text-muted-foreground text-xs">
                  {(0.25 * s).toFixed(2)}rem
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Breakpoints">
          <div className="grid desktop:grid-cols-5 grid-cols-1 tablet:grid-cols-2 gap-2">
            {breakpoints.map((b) => (
              <div
                key={b.name}
                className="flex flex-col gap-1 rounded border border-border p-3"
              >
                <span className="font-mono text-sm">{b.name}</span>
                <span className="font-mono text-muted-foreground text-xs">
                  ≥ {b.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Easings"
          description="Custom cubic-bezier curves. Hover each bar to play."
        >
          <div className="grid desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 gap-2">
            {eases.map((e) => (
              <EasingRow key={e} name={e} />
            ))}
          </div>
        </Section>

        <Section
          title="Layout utilities"
          description="Custom b-layout-* utilities built on --columns, --gap, --safe."
        >
          <div className="flex flex-col gap-4">
            <div className="b-layout-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static demo
                  key={i}
                  className="aspect-square bg-muted"
                />
              ))}
            </div>
            <p className="font-mono text-muted-foreground text-xs">
              .b-layout-grid — {4} columns on mobile, 12 on desktop.
            </p>
          </div>
        </Section>

        <Section
          title="Form controls"
          description="Each shadcn primitive in isolation. Tokens follow the active theme."
        >
          <FormControls />
        </Section>

        <Section
          title="Form layouts"
          description="Realistic form compositions — login, signup with errors, and settings."
        >
          <FormLayouts />
        </Section>

        <Section
          title="Display"
          description="Badges, avatars, cards, separators, skeletons, spinner."
        >
          <DisplayComponents />
        </Section>

        <Section
          title="Overlay & feedback"
          description="Dialog, progress, and callouts. Portaled content inherits the active theme."
        >
          <OverlayComponents />
        </Section>

        <Section
          title="Advanced inputs"
          description="Slider, segmented controls, checkbox cards, and searchable combobox."
        >
          <AdvancedInputs />
        </Section>

        <Section
          title="Data presentation"
          description="Tabs and table for structured content."
        >
          <DataComponents />
        </Section>

        <Section
          title="Layout"
          description="Box, Flex, Grid, Container, Section — the primitives for assembling screens."
        >
          <LayoutComponents />
        </Section>
      </div>
    </Wrapper>
  )
}

function EasingRow({ name }: { name: string }) {
  return (
    <div className="group flex flex-col gap-2 rounded border border-border p-3">
      <span className="font-mono text-xs">{name}</span>
      <div className="relative h-3 rounded bg-muted">
        <span
          className="absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-primary group-hover:left-[calc(100%-0.75rem)]"
          style={{
            transitionDuration: "1200ms",
            transitionProperty: "left",
            transitionTimingFunction: `var(--ease-${name})`,
          }}
        />
      </div>
    </div>
  )
}
