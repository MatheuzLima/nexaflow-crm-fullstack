import {
  ArrowRightLeft,
  MessageCircle,
  Route,
  Sparkles,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNow } from "@/hooks/use-now"
import { timeAgo } from "@/lib/crm/format"
import { useCrm } from "@/lib/crm/store"
import type { EventKind } from "@/lib/crm/types"

export const EVENT_ICON: Record<EventKind, LucideIcon> = {
  webhook: Webhook,
  ai: Sparkles,
  routing: Route,
  message: MessageCircle,
  stage: ArrowRightLeft,
  automation: Zap,
}

export const LEVEL_TONE = {
  info: "bg-primary/12 text-primary",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
} as const

export function ActivityCard({ limit = 9 }: { limit?: number }) {
  const events = useCrm((s) => s.events)
  const select = useCrm((s) => s.selectLead)
  const now = useNow(1000)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade das automações</CardTitle>
        <CardDescription>O que o sistema fez sozinho, em ordem</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-1">
          {events.slice(0, limit).map((e) => {
            const Icon = EVENT_ICON[e.kind]
            const clickable = !!e.leadId
            const Body = (
              <>
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                    LEVEL_TONE[e.level]
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{e.title}</p>
                  {e.detail && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {e.detail}
                    </p>
                  )}
                </div>
                <span className="tabular shrink-0 text-xs text-muted-foreground">
                  {timeAgo(e.ts, now)}
                </span>
              </>
            )
            return (
              <li key={e.id}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => select(e.leadId!)}
                    className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {Body}
                  </button>
                ) : (
                  <div className="flex items-start gap-3 p-2">{Body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
