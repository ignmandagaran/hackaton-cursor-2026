"use client"

import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { useEffect, useState, useTransition } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { fetchLotDetails } from "@/lib/actions/lot"
import { formatKg } from "@/lib/inventory/format-kg"
import { formatRelativeTime } from "@/lib/inventory/format-relative-time"
import { formatRoute } from "@/lib/inventory/format-route"
import type { LotDetails } from "@/lib/inventory/lot-details"
import { cn } from "@/lib/styles/cn"

type LotDetailsDrawerProps = {
  lotId: number
  lotCode: string
  children: React.ReactNode
  className?: string
}

export function LotDetailsDrawer({
  lotId,
  lotCode,
  children,
  className,
}: LotDetailsDrawerProps) {
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState<LotDetails | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return

    setDetails(null)
    startTransition(async () => {
      const result = await fetchLotDetails(lotId)
      setDetails(result)
    })
  }, [open, lotId])

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1 text-left underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
        >
          {children}
          <ArrowRightIcon
            className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
            aria-hidden
          />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-border pb-4">
          {isPending && !details ? (
            <DrawerTitle>Lote {lotCode}</DrawerTitle>
          ) : details ? (
            <>
              <DrawerTitle>Lote {details.code}</DrawerTitle>
              <p className="font-heading text-lg">{details.variety.name}</p>
            </>
          ) : (
            <DrawerTitle>Lote {lotCode}</DrawerTitle>
          )}
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {isPending && !details ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : details ? (
            <>
              <section>
                <p className="font-heading text-2xl tabular-nums">
                  {formatKg(details.totalStockKg)}
                </p>
                <p className="text-muted-foreground text-sm">Stock total</p>
              </section>

              {details.stockByLocation.length > 0 && (
                <section>
                  <h3 className="mb-3 font-medium text-sm">Distribución</h3>
                  <ul className="flex flex-col gap-2">
                    {details.stockByLocation.map((entry) => (
                      <li
                        key={entry.locationId}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <span className="text-sm">{entry.locationName}</span>
                        <span className="text-muted-foreground text-sm tabular-nums">
                          {formatKg(entry.quantityKg)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {details.recentMovements.length > 0 && (
                <section>
                  <h3 className="mb-3 font-medium text-sm">
                    Últimos movimientos
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {details.recentMovements.map((movement) => (
                      <li
                        key={movement.id}
                        className="rounded-2xl bg-muted/50 px-4 py-3"
                      >
                        <p className="font-medium tabular-nums">
                          {formatKg(movement.quantityKg)}
                        </p>
                        <p className="mt-1 text-muted-foreground text-sm">
                          {formatRoute(movement)}
                        </p>
                        <p className="mt-1 text-muted-foreground text-xs">
                          {formatRelativeTime(movement.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No se encontró información del lote.
            </p>
          )}
        </div>

        <div className="border-t border-border p-6">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cerrar
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
