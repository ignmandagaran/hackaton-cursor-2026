"use client"
"use no memo"

import { useEffect, useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatKg, formatSignedKg } from "@/lib/inventory/format-kg"
import { adjustmentSign, formatRoute } from "@/lib/inventory/format-route"
import type {
  LotHistoryOption,
  LotStockHistory,
  StockHistoryPoint,
} from "@/lib/inventory/stock-history"

const SERIES_COLORS = [
  "var(--chart-3)",
  "oklch(0.55 0.12 230)",
  "oklch(0.62 0.14 25)",
  "oklch(0.52 0.1 155)",
  "var(--chart-5)",
]

const EMPTY_HISTORY_MESSAGE =
  "No hay movimientos suficientes para mostrar la evolución de este lote."

type StockHistoryChartProps = {
  lots: LotHistoryOption[]
  histories: LotStockHistory[]
  defaultLotId: number | null
}

type ChartRow = {
  timestamp: string
  movementId: number
} & Record<string, string | number>

export function StockHistoryChart({
  lots,
  histories,
  defaultLotId,
}: StockHistoryChartProps) {
  const [selectedLotId, setSelectedLotId] = useState(
    defaultLotId ?? lots[0]?.id ?? 0
  )
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>(
    {}
  )
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    setChartReady(true)
  }, [])

  const selectedLot = lots.find((lot) => lot.id === selectedLotId)
  const history = histories.find((item) => item.lotId === selectedLotId)

  const sameDay = useMemo(() => {
    if (!history || history.points.length === 0) return true
    const days = new Set(
      history.points.map((point) => new Date(point.timestamp).toDateString())
    )
    return days.size <= 1
  }, [history])

  const chartData = useMemo(() => {
    if (!history) return []

    return history.points.map((point) => {
      const row: ChartRow = {
        timestamp: point.timestamp,
        movementId: point.movementId,
      }

      for (const balance of point.balances) {
        row[`loc-${balance.locationId}`] = balance.quantityKg
      }

      return row
    })
  }, [history])

  return (
    <section>
      <h2 className="mb-3 font-heading font-medium text-lg">
        Evolución de stock
      </h2>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-3">
          <Label
            htmlFor="stock-history-lot"
            className="text-muted-foreground"
          >
            Lote
          </Label>
          <Select
            value={selectedLotId > 0 ? String(selectedLotId) : ""}
            onValueChange={(value) => {
              setSelectedLotId(Number(value))
              setHiddenSeries({})
            }}
          >
            <SelectTrigger
              id="stock-history-lot"
              className="min-w-52"
            >
              <SelectValue placeholder="Elegí un lote">
                {selectedLot
                  ? `Lote ${selectedLot.code} · ${selectedLot.varietyName}`
                  : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {lots.map((lot) => (
                <SelectItem key={lot.id} value={String(lot.id)}>
                  Lote {lot.code} · {lot.varietyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <StockHistoryBody
            history={history}
            chartData={chartData}
            sameDay={sameDay}
            hiddenSeries={hiddenSeries}
            chartReady={chartReady}
            onToggleSeries={(key) => {
              setHiddenSeries((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }}
          />
        </CardContent>
      </Card>
    </section>
  )
}

function StockHistoryBody({
  history,
  chartData,
  sameDay,
  hiddenSeries,
  chartReady,
  onToggleSeries,
}: {
  history: LotStockHistory | undefined
  chartData: ChartRow[]
  sameDay: boolean
  hiddenSeries: Record<string, boolean>
  chartReady: boolean
  onToggleSeries: (key: string) => void
}) {
  if (!history || history.points.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{EMPTY_HISTORY_MESSAGE}</p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">kg</p>
      <div className="h-[240px] w-full sm:h-[300px]">
        {chartReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(value: string) =>
                formatAxisTick(value, sameDay)
              }
            />
            <YAxis
              width={52}
              domain={[0, "auto"]}
              tick={{ fontSize: 12 }}
              tickMargin={4}
              tickFormatter={(value: number) =>
                Number(value).toLocaleString("es-AR")
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as ChartRow | undefined
                const movementId =
                  typeof row?.movementId === "number" ? row.movementId : null

                return (
                  <StockHistoryTooltip
                    active={Boolean(active)}
                    movementId={movementId}
                    points={history.points}
                  />
                )
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              onClick={(entry) => {
                if (typeof entry.dataKey === "string") {
                  onToggleSeries(entry.dataKey)
                }
              }}
            />
            {history.locations.map((location, index) => {
              const dataKey = `loc-${location.locationId}`
              const stroke =
                SERIES_COLORS[index % SERIES_COLORS.length] ?? "var(--chart-3)"

              return (
                <Line
                  key={location.locationId}
                  type="stepAfter"
                  dataKey={dataKey}
                  name={location.locationName}
                  stroke={stroke}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  hide={hiddenSeries[dataKey] === true}
                  isAnimationActive={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  )
}

function StockHistoryTooltip({
  active,
  movementId,
  points,
}: {
  active: boolean
  movementId: number | null
  points: StockHistoryPoint[]
}) {
  if (!active || movementId === null) return null

  const point = points.find((item) => item.movementId === movementId)
  if (!point) return null

  return (
    <div className="min-w-44 rounded-2xl bg-popover/95 px-3 py-2.5 text-sm shadow-lg ring-1 ring-foreground/10">
      <p className="mb-2 font-medium">{formatTooltipTimestamp(point.timestamp)}</p>
      <ul className="flex flex-col gap-1.5">
        {point.balances.map((balance) => (
          <li key={balance.locationId}>
            <p className="text-muted-foreground text-xs">
              {balance.locationName}
            </p>
            <p className="tabular-nums">{formatKg(balance.quantityKg)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-border border-t pt-2">
        <p className="text-muted-foreground text-xs">Operación</p>
        <p>{formatOperationLabel(point)}</p>
        <p className="text-muted-foreground text-xs">
          {formatRoute({
            type: point.movementType,
            originName: point.originName,
            destinationName: point.destinationName,
          })}
        </p>
      </div>
    </div>
  )
}

function formatOperationLabel(point: StockHistoryPoint): string {
  if (point.movementType === "TRANSFER") {
    return `${formatKg(point.quantityKg)} transferencia`
  }

  if (point.movementType === "INITIAL_BALANCE") {
    return `${formatKg(point.quantityKg)} saldo inicial`
  }

  const signed = adjustmentSign(point.originName, point.destinationName)
  return `${formatSignedKg(signed * point.quantityKg)} ajuste`
}

function formatTooltipTimestamp(iso: string): string {
  const date = new Date(iso)
  const day = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(date)
  const time = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
  return `${day} · ${time}`
}

function formatAxisTick(iso: string, sameDay: boolean): string {
  const date = new Date(iso)

  if (sameDay) {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date)
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}
