import { Flame, Snowflake, Thermometer } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { STAGE_LABEL, type Stage, type Temperature } from "@/lib/crm/types"

export function scoreTone(score: number) {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-300"
  if (score >= 60) return "text-indigo-600 dark:text-indigo-300"
  if (score >= 40) return "text-amber-600 dark:text-amber-300"
  return "text-slate-500 dark:text-slate-400"
}

export function scoreBarColor(score: number) {
  if (score >= 75) return "bg-emerald-500"
  if (score >= 60) return "bg-indigo-500"
  if (score >= 40) return "bg-amber-500"
  return "bg-slate-400"
}

/** Nota 0–100 com barra fina; mostra "—" enquanto o lead ainda não foi analisado. */
export function ScoreMeter({
  score,
  analysed = true,
  className,
}: {
  score: number
  analysed?: boolean
  className?: string
}) {
  if (!analysed) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn("tabular w-6 text-right text-sm font-semibold", scoreTone(score))}
      >
        {score}
      </span>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", scoreBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

/** Nota em formato de selo compacto (cards do kanban e feed). */
export function ScoreChip({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "tabular inline-flex h-5 min-w-8 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-semibold",
        scoreTone(score),
        className
      )}
      title="Nota de qualificação (0 a 100)"
    >
      {score}
    </span>
  )
}

const TEMP_STYLE: Record<Temperature, string> = {
  quente: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  morno: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  frio: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

const TEMP_LABEL: Record<Temperature, string> = {
  quente: "Quente",
  morno: "Morno",
  frio: "Frio",
}

export function TemperatureIcon({
  temperature,
  className,
}: {
  temperature: Temperature
  className?: string
}) {
  const Icon =
    temperature === "quente" ? Flame : temperature === "morno" ? Thermometer : Snowflake
  return <Icon className={className} />
}

export function TemperatureBadge({
  temperature,
  className,
}: {
  temperature: Temperature
  className?: string
}) {
  return (
    <Badge variant="ghost" className={cn(TEMP_STYLE[temperature], className)}>
      <TemperatureIcon temperature={temperature} />
      {TEMP_LABEL[temperature]}
    </Badge>
  )
}

export const STAGE_STYLE: Record<Stage, { badge: string; dot: string }> = {
  novo: {
    badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  qualificado: {
    badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  cotacao: {
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  negociacao: {
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  fechado: {
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
}

export function StageBadge({
  stage,
  className,
}: {
  stage: Stage
  className?: string
}) {
  return (
    <Badge variant="ghost" className={cn(STAGE_STYLE[stage].badge, className)}>
      {STAGE_LABEL[stage]}
    </Badge>
  )
}
