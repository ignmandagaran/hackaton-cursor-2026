import { LotDetailsDrawer } from "@/components/inventory/lot-details-drawer"
import { cn } from "@/lib/styles/cn"

type LotLinkProps = {
  lotId: number
  lotCode: string
  className?: string
  showPrefix?: boolean
}

export function LotLink({
  lotId,
  lotCode,
  className,
  showPrefix = true,
}: LotLinkProps) {
  return (
    <LotDetailsDrawer
      lotId={lotId}
      lotCode={lotCode}
      {...(className ? { className } : {})}
    >
      <span className={cn("font-medium", className)}>
        {showPrefix ? `Lote ${lotCode}` : lotCode}
      </span>
    </LotDetailsDrawer>
  )
}
