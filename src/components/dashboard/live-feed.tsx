import { Loader2, Radio } from "lucide-react"
import { cn } from "cn"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChannelIcon } from "@/components/crm/channel-icon"
import { ScoreChip, TemperatureBadge } from "@/components/crm/badges"
import { PIPELINE_STEPS } from "@/components/crm/processing-steps"
import { useNow } from "@/hooks/use-now"
import { timeAgo } from "@/lib/crm/format"
import { repById } from "@/lib/crm/reps"
import { useCrm } from "@/lib/crm/store"
import type { Lead } from "@/lib/crm/types"

function FeedItem({ lead, now }: { lead: Lead; now: number }) {
  const select = useCrm((s) => s.selectLead)
  const owner = repById(lead.ownerId)
  const processing = lead.status === "processing"
  const fresh = now - lead.createdAt < 3000

  return (
    <li>
      <button
        type="button"
        onClick={() => select(lead.id)}
        className={cn(
          "group relative flex w-full gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          processing && "ai-shimmer border-primary/30",
          fresh && "feed-in"
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ChannelIcon channel={lead.channel} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium">{lead.company}</span>
            <span className="tabular ml-auto shrink-0 text-xs text-muted-foreground">
              {timeAgo(lead.createdAt, now)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {lead.message}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {processing ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Loader2 className="size-3 animate-spin" />
                {PIPELINE_STEPS[Math.min(lead.step, PIPELINE_STEPS.length - 1)]}…
              </span>
            ) : lead.ai ? (
              <>
                <ScoreChip score={lead.score} />
                <TemperatureBadge temperature={lead.temperature} />
                {owner && (
                  <span className="truncate text-xs text-muted-foreground">
                    → {owner.name.split(" ")[0]}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-300">
                Sem análise · triagem manual
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}

export function LiveFeed() {
  const leads = useCrm((s) => s.leads)
  const live = useCrm((s) => s.live)
  const now = useNow(1000)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="size-4 text-primary" />
          Contatos ao vivo
        </CardTitle>
        <CardDescription>
          {live
            ? "Chegando por webhook e analisados pela IA"
            : "Recebimento pausado, retome no topo da página"}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <ul className="thin-scroll grid max-h-[580px] gap-2 overflow-y-auto pr-1">
          {leads.slice(0, 12).map((lead) => (
            <FeedItem key={lead.id} lead={lead} now={now} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
