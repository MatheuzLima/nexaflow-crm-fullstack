import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STAGE_STYLE } from "@/components/crm/badges"
import { formatBRLCompact } from "@/lib/crm/format"
import type { Metrics } from "@/lib/crm/metrics"
import { cn } from "cn"

export function FunnelCard({ funnel }: { funnel: Metrics["funnel"] }) {
  const total = funnel[0]?.reached || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de vendas</CardTitle>
        <CardDescription>Quantos leads chegaram a cada etapa</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3.5">
        {funnel.map((step) => {
          const pct = Math.round((step.reached / total) * 100)
          return (
            <div key={step.stage}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{step.label}</span>
                <span className="tabular text-xs text-muted-foreground">
                  <b className="text-sm font-semibold text-foreground">{step.reached}</b> · {pct}%
                  {step.value > 0 && <> · {formatBRLCompact(step.value)}</>}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", STAGE_STYLE[step.stage].dot)}
                  style={{ width: `${Math.max(pct, 3)}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
