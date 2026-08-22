"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import {
  analyzeDiscrepancyAction,
  fetchDiscrepancyDetail,
  type DiscrepancyDetail,
} from "@/lib/actions/reconciliation"
import type { DiscrepancyAnalysis } from "@/lib/inventory/reconciliation-types"
import { formatKg } from "@/lib/inventory/format-kg"
import { formatRelativeTime } from "@/lib/inventory/format-relative-time"
import { formatRoute } from "@/lib/inventory/format-route"
import { cn } from "@/lib/styles/cn"

type DiscrepancyDetailDrawerProps = {
  lotId: number
  locationId: number
  lotCode: string
  locationName: string
}

function formatDifference(value: number): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${value.toLocaleString("es-AR")} kg`
}

function confidenceLabel(confidence: DiscrepancyAnalysis["hypotheses"][number]["confidence"]) {
  switch (confidence) {
    case "HIGH":
      return "Alta"
    case "MEDIUM":
      return "Media"
    default:
      return "Baja"
  }
}

export function DiscrepancyDetailDrawer({
  lotId,
  locationId,
  lotCode,
  locationName,
}: DiscrepancyDetailDrawerProps) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<DiscrepancyDetail | null>(null)
  const [analysis, setAnalysis] = useState<DiscrepancyAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isAnalyzing, startAnalyze] = useTransition()

  useEffect(() => {
    if (!open) {
      setDetail(null)
      setAnalysis(null)
      setAnalysisError(null)
      return
    }

    startTransition(async () => {
      const result = await fetchDiscrepancyDetail({ lotId, locationId })
      setDetail(result)
    })
  }, [open, lotId, locationId])

  function handleAnalyze() {
    setAnalysis(null)
    setAnalysisError(null)

    startAnalyze(async () => {
      const result = await analyzeDiscrepancyAction({ lotId, locationId })
      if (!result.ok) {
        setAnalysisError(result.error)
        return
      }
      setAnalysis(result.analysis)
    })
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          Ver detalle
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-border pb-4">
          {detail ? (
            <>
              <DrawerTitle>Lote {detail.entry.lotCode}</DrawerTitle>
              <p className="font-heading text-lg">{detail.entry.varietyName}</p>
              <p className="text-muted-foreground text-sm">{locationName}</p>
            </>
          ) : (
            <DrawerTitle>Lote {lotCode}</DrawerTitle>
          )}
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {isPending && !detail ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : detail ? (
            <>
              <section className="grid gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Stock esperado</p>
                  <p className="font-heading text-2xl tabular-nums">
                    {formatKg(detail.entry.expectedKg)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Conteo físico</p>
                  <p className="font-heading text-2xl tabular-nums">
                    {detail.entry.countedKg !== null
                      ? formatKg(detail.entry.countedKg)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Diferencia</p>
                  <p
                    className={cn(
                      "font-heading text-2xl tabular-nums",
                      detail.entry.differenceKg !== null &&
                        detail.entry.differenceKg !== 0 &&
                        "text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {detail.entry.differenceKg !== null
                      ? formatDifference(detail.entry.differenceKg)
                      : "—"}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Diferencia calculada desde inventario
                  </p>
                </div>
              </section>

              {detail.movements.length > 0 && (
                <section>
                  <h3 className="mb-3 font-medium text-sm">
                    Movimientos recientes
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {detail.movements.map((movement) => (
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

              <section className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner className="size-4" />
                      Analizando…
                    </>
                  ) : (
                    "Analizar diferencia"
                  )}
                </Button>

                {analysisError && (
                  <p className="text-destructive text-sm whitespace-pre-line">
                    {analysisError}
                  </p>
                )}

                {analysis && (
                  <div className="rounded-2xl bg-muted/50 px-4 py-4">
                    <p className="mb-2 text-muted-foreground text-xs">
                      Análisis generado con IA sobre movimientos registrados
                    </p>
                    <p className="text-sm">{analysis.summary}</p>

                    {analysis.hypotheses.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-2">
                        {analysis.hypotheses.map((hypothesis) => (
                          <li
                            key={hypothesis.explanation}
                            className="text-sm"
                          >
                            <span className="text-muted-foreground">
                              [{confidenceLabel(hypothesis.confidence)}]
                            </span>{" "}
                            {hypothesis.explanation}
                          </li>
                        ))}
                      </ul>
                    )}

                    {!analysis.evidenceSufficient && (
                      <p className="mt-3 text-muted-foreground text-xs">
                        La evidencia disponible no alcanza para una conclusión
                        definitiva.
                      </p>
                    )}
                  </div>
                )}
              </section>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No se encontró información de la diferencia.
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
