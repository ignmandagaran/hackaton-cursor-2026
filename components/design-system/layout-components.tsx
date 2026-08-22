import { Box, Container, Flex, Grid, Section } from "@/components/ui/layout"
import { Link } from "@/components/ui/link"

function ControlGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded border border-border bg-card p-4">
      <header className="flex flex-col gap-1">
        <h3 className="font-mono text-foreground text-xs uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Block({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={
        className ??
        "flex h-10 items-center justify-center rounded bg-muted text-muted-foreground text-xs"
      }
    >
      {label}
    </div>
  )
}

export function LayoutComponents() {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
      <ControlGroup
        title="Box"
        description="Base div with asChild. Use for wrappers and spacing."
      >
        <Box className="rounded border border-border border-dashed bg-muted/30 p-4 text-muted-foreground text-xs">
          Box — plain div with cn()
        </Box>
        <Box
          asChild
          className="rounded border border-primary/50 bg-primary/10 p-3 text-primary text-xs"
        >
          <Link href="#layout">asChild renders as &lt;a&gt;</Link>
        </Box>
      </ControlGroup>

      <ControlGroup
        title="Flex"
        description="Row/column with align, justify, gap, wrap."
      >
        <Flex gap={2}>
          <Block label="row" />
          <Block label="row" />
          <Block label="row" />
        </Flex>
        <Flex direction="col" gap={2}>
          <Block label="col" />
          <Block label="col" />
        </Flex>
        <Flex justify="between" align="center" gap={2}>
          <Block label="start" />
          <Block label="center" />
          <Block label="end" />
        </Flex>
        <Flex wrap="wrap" gap={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Block
              // biome-ignore lint/suspicious/noArrayIndexKey: static demo
              key={i}
              label={`${i + 1}`}
              className="flex size-10 items-center justify-center rounded bg-muted text-muted-foreground text-xs"
            />
          ))}
        </Flex>
      </ControlGroup>

      <ControlGroup title="Grid" description="Columns, align, justify, gap.">
        <Grid cols={3} gap={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Block
              // biome-ignore lint/suspicious/noArrayIndexKey: static demo
              key={i}
              label={`${i + 1}`}
            />
          ))}
        </Grid>
        <Grid cols={12} gap={2}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Block
              // biome-ignore lint/suspicious/noArrayIndexKey: static demo
              key={i}
              className="flex h-8 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground"
              label={`${i + 1}`}
            />
          ))}
        </Grid>
      </ControlGroup>

      <ControlGroup
        title="Container"
        description="Centered, with max-width sizes (sm/md/lg/xl/full)."
      >
        {(["sm", "md", "lg", "xl"] as const).map((size) => (
          <Container
            key={size}
            size={size}
            className="rounded border border-border border-dashed bg-muted/20 py-2 text-center font-mono text-muted-foreground text-xs"
          >
            size={size}
          </Container>
        ))}
      </ControlGroup>

      <ControlGroup
        title="Section"
        description="Vertical rhythm for page sections (sm/md/lg/xl)."
      >
        {(["sm", "md", "lg"] as const).map((size) => (
          <Section
            key={size}
            size={size}
            className="rounded border border-border border-dashed bg-muted/20 text-center"
          >
            <span className="font-mono text-muted-foreground text-xs">
              size={size}
            </span>
          </Section>
        ))}
      </ControlGroup>

      <ControlGroup
        title="Composition"
        description="A Section wrapping a Container with a Flex inside."
      >
        <Section
          size="sm"
          className="rounded border border-border border-dashed bg-muted/20"
        >
          <Container size="sm">
            <Flex direction="col" gap={3}>
              <h4 className="font-mono text-foreground text-sm uppercase tracking-wide">
                Page section
              </h4>
              <Flex justify="between" align="center" gap={2}>
                <span className="text-muted-foreground text-xs">
                  Full composition example
                </span>
                <Grid cols={3} gap={1} className="w-24">
                  <Block className="h-4 rounded bg-primary/30" label="" />
                  <Block className="h-4 rounded bg-primary/60" label="" />
                  <Block className="h-4 rounded bg-primary" label="" />
                </Grid>
              </Flex>
            </Flex>
          </Container>
        </Section>
      </ControlGroup>
    </div>
  )
}
