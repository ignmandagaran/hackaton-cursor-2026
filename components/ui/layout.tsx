import { Slot } from "radix-ui"
import type * as React from "react"
import { cn } from "@/lib/styles/cn"

type AsChildProps = { asChild?: boolean }

type SpacingScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

const gapClasses: Record<SpacingScale, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
}

type BoxProps = React.ComponentProps<"div"> & AsChildProps

export function Box({ className, asChild, ...props }: BoxProps) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="box" className={cn(className)} {...props} />
}

type FlexDirection = "row" | "col" | "row-reverse" | "col-reverse"
type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline"
type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly"
type FlexWrap = "wrap" | "nowrap" | "wrap-reverse"

const directionClasses: Record<FlexDirection, string> = {
  row: "flex-row",
  col: "flex-col",
  "row-reverse": "flex-row-reverse",
  "col-reverse": "flex-col-reverse",
}

const alignClasses: Record<FlexAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
}

const justifyClasses: Record<FlexJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
}

const wrapClasses: Record<FlexWrap, string> = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
}

type FlexProps = BoxProps & {
  direction?: FlexDirection
  align?: FlexAlign
  justify?: FlexJustify
  gap?: SpacingScale
  wrap?: FlexWrap
}

export function Flex({
  className,
  asChild,
  direction = "row",
  align,
  justify,
  gap,
  wrap,
  ...props
}: FlexProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="flex"
      className={cn(
        "flex",
        directionClasses[direction],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        gap !== undefined && gapClasses[gap],
        wrap && wrapClasses[wrap],
        className
      )}
      {...props}
    />
  )
}

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12

const colsClasses: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  8: "grid-cols-8",
  12: "grid-cols-12",
}

type GridProps = BoxProps & {
  cols?: GridCols
  gap?: SpacingScale
  align?: FlexAlign
  justify?: FlexJustify
}

export function Grid({
  className,
  asChild,
  cols = 1,
  gap,
  align,
  justify,
  ...props
}: GridProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="grid"
      className={cn(
        "grid",
        colsClasses[cols],
        gap !== undefined && gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className
      )}
      {...props}
    />
  )
}

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full"

const containerSizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
}

type ContainerProps = BoxProps & {
  size?: ContainerSize
}

export function Container({
  className,
  asChild,
  size = "lg",
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="container"
      className={cn(
        "mx-auto w-full px-safe",
        containerSizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

type SectionSize = "sm" | "md" | "lg" | "xl"

const sectionSizeClasses: Record<SectionSize, string> = {
  sm: "py-8",
  md: "py-12",
  lg: "py-20",
  xl: "py-28",
}

type SectionProps = React.ComponentProps<"section"> &
  AsChildProps & {
    size?: SectionSize
  }

export function Section({
  className,
  asChild,
  size = "md",
  ...props
}: SectionProps) {
  const Comp = asChild ? Slot.Root : "section"
  return (
    <Comp
      data-slot="layout-section"
      className={cn(sectionSizeClasses[size], className)}
      {...props}
    />
  )
}
