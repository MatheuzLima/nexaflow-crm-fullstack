import {
  Banknote,
  Flame,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatBRLCompact, formatDuration } from "@/lib/crm/format"
import type { Metrics } from "@/lib/crm/metrics"

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
  tone: string
}) {
  return (
    <Card className="@container/kpi">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="tabular mt-1.5 text-2xl font-semibold tracking-tight @[14rem]/kpi:text-3xl">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}

export function KpiCards({ m }: { m: Metrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        icon={Users}
        label="Contatos em 24 h"
        value={String(m.leads24h)}
        hint={`+${m.leadsLastHour} na última hora`}
        tone="bg-primary/12 text-primary"
      />
      <Kpi
        icon={Flame}
        label="Taxa de qualificação"
        value={`${Math.round(m.qualificationRate * 100)}%`}
        hint={`${m.qualified} de ${m.analysed} aprovados pela IA (nota ≥ 60)`}
        tone="bg-orange-500/15 text-orange-600 dark:text-orange-300"
      />
      <Kpi
        icon={Timer}
        label="1ª resposta (média)"
        value={m.avgFirstResponse === null ? "—" : formatDuration(m.avgFirstResponse)}
        hint="Resposta automática no WhatsApp"
        tone="bg-sky-500/15 text-sky-600 dark:text-sky-300"
      />
      <Kpi
        icon={Banknote}
        label="Pipeline em aberto"
        value={formatBRLCompact(m.pipelineValue)}
        hint={`${m.openCount} negócios · ${formatBRLCompact(m.closedValue)} fechados`}
        tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
      />
    </div>
  )
}
