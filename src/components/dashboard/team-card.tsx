import { Flame } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RepAvatar } from "@/components/crm/rep-avatar"
import { formatBRLCompact } from "@/lib/crm/format"
import type { Metrics } from "@/lib/crm/metrics"
import { repById } from "@/lib/crm/reps"

export function TeamCard({ team }: { team: Metrics["team"] }) {
  const max = Math.max(1, ...team.map((t) => t.open))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga por vendedor</CardTitle>
        <CardDescription>Roteamento por especialidade e menor fila</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3.5">
        {team.map((row) => {
          const rep = repById(row.repId)
          if (!rep) return null
          return (
            <div key={row.repId} className="flex items-center gap-3">
              <RepAvatar repId={row.repId} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{rep.name}</span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">
                    {row.open} negócios · {formatBRLCompact(row.value)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${(row.open / max) * 100}%` }}
                    />
                  </div>
                  <span className="flex w-9 shrink-0 items-center justify-end gap-0.5 text-xs text-orange-600 dark:text-orange-300">
                    <Flame className="size-3" />
                    {row.hot}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
