import { Slot } from "radix-ui"
import type * as React from "react"
import { cn } from "@/lib/styles/cn"

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
type TextElement = "span" | "p" | "label"
type Size = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
type Weight = "light" | "regular" | "medium" | "bold"
type Align = "left" | "center" | "right"
type TextColor = "default" | "muted" | "primary" | "destructive" | "inherit"

const sizeClasses: Record<Size, string> = {
  "1": "text-xs",
  "2": "text-sm",
  "3": "text-base",
  "4": "text-lg",
  "5": "text-xl",
  "6": "text-2xl",
  "7": "text-3xl",
  "8": "text-4xl",
  "9": "text-5xl",
}

const weightClasses: Record<Weight, string> = {
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
}

const alignClasses: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const colorClasses: Record<TextColor, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  destructive: "text-destructive",
  inherit: "",
}

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel
  size?: Size
  weight?: Weight
  align?: Align
  color?: TextColor
  truncate?: boolean
  asChild?: boolean
}

export function Heading({
  as = "h2",
  size = "6",
  weight = "regular",
  align,
  color,
  truncate,
  asChild,
  className,
  ...props
}: HeadingProps) {
  const Comp = asChild ? Slot.Root : as
  return (
    <Comp
      data-slot="heading"
      className={cn(
        "font-heading tracking-tight",
        sizeClasses[size],
        weightClasses[weight],
        align && alignClasses[align],
        color && colorClasses[color],
        truncate && "truncate",
        className
      )}
      {...props}
    />
  )
}

type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: TextElement
  size?: Size
  weight?: Weight
  align?: Align
  color?: TextColor
  truncate?: boolean
  asChild?: boolean
  htmlFor?: string
}

export function Text({
  as = "span",
  size = "3",
  weight = "regular",
  align,
  color,
  truncate,
  asChild,
  className,
  ...props
}: TextProps) {
  const Comp = asChild ? Slot.Root : as
  return (
    <Comp
      data-slot="text"
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        align && alignClasses[align],
        color && colorClasses[color],
        truncate && "truncate",
        className
      )}
      {...props}
    />
  )
}
