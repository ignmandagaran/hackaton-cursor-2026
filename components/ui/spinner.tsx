import { CircleNotchIcon } from "@phosphor-icons/react/ssr"
import { cn } from "@/lib/styles/cn"

type SpinnerSize = "sm" | "md" | "lg"

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
}

export function Spinner({
  size = "sm",
  className,
  ...props
}: React.ComponentProps<typeof CircleNotchIcon> & { size?: SpinnerSize }) {
  return (
    <CircleNotchIcon
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", sizeClasses[size], className)}
      {...props}
    />
  )
}
