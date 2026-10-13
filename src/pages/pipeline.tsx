import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { Flame, Loader2, Search } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ChannelIcon } from "@/components/crm/channel-icon"
import { ScoreChip, STAGE_STYLE } from "@/components/crm/badges"
import { RepAvatar } from "@/components/crm/rep-avatar"
import { useNow } from "@/hooks/use-now"
import { formatBRLCompact, timeAgo } from "@/lib/crm/format"
import { REPS } from "@/lib/crm/reps"
import { useCrm } from "@/lib/crm/store"
import { STAGES, type Lead, type Stage } from "@/lib/crm/types"

const STAGE_IDS = STAGES.map((s) => s.id)

const OWNER_ITEMS: Record<string, string> = {
  all: "Todos os vendedores",
  ...Object.fromEntries(REPS.map((r) => [r.id, r.name])),
}

function LeadCard({
  lead,
  now,
  overlay = false,
}: {
  lead: Lead
  now: number
  overlay?: boolean
}) {
  const processing = lead.status === "processing"
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 text-left shadow-xs transition-shadow hover:shadow-sm",
        processing && "ai-shimmer border-primary/30",
        overlay && "rotate-1 cursor-grabbing shadow-xl ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.company}</p>
          <p className="truncate text-xs text-muted-foreground">{lead.name}</p>
        </div>
        {lead.ai ? (
          <ScoreChip score={lead.score} />
        ) : processing ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{lead.service}</Badge>
        {lead.ai?.urgency === "alta" && <Badge variant="destructive">Urgente</Badge>}
        {lead.ai && lead.temperature === "quente" && (
          <Flame className="size-3.5 text-orange-500" aria-label="Lead quente" />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular font-semibold text-foreground">
          {lead.ai ? formatBRLCompact(lead.value) : processing ? "Analisando…" : "—"}
        </span>
        <span className="flex items-center gap-1.5">
          <ChannelIcon channel={lead.channel} className="size-3.5" />
          {timeAgo(lead.createdAt, now)}
          <RepAvatar repId={lead.ownerId} size={20} />
        </span>
      </div>
    </div>
  )
}

function DraggableCard({ lead, now }: { lead: Lead; now: number }) {
  const select = useCrm((s) => s.selectLead)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    disabled: lead.status === "processing",
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => select(lead.id)}
      className={cn(
        "cursor-grab touch-manipulation rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing",
        isDragging && "opacity-35"
      )}
    >
      <LeadCard lead={lead} now={now} />
    </div>
  )
}

function Column({
  stage,
  leads,
  now,
}: {
  stage: (typeof STAGES)[number]
  leads: Lead[]
  now: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const total = leads.reduce((sum, l) => sum + l.value, 0)

  return (
    <section
      className={cn(
        "flex w-[17.5rem] shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors xl:w-auto xl:min-w-0",
        isOver && "border-primary/60 bg-primary/8"
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-1">
        <span className={cn("size-2.5 rounded-full", STAGE_STYLE[stage.id].dot)} />
        <h3 className="text-sm font-semibold">{stage.label}</h3>
        <span className="tabular rounded-md bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {leads.length}
        </span>
        <span className="tabular ml-auto text-xs text-muted-foreground">
          {total > 0 ? formatBRLCompact(total) : ""}
        </span>
      </header>
      <p className="px-3 pb-2 text-xs text-muted-foreground">{stage.hint}</p>

      <div
        ref={setNodeRef}
        className="thin-scroll flex max-h-[calc(100svh-19rem)] min-h-28 flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0"
      >
        {leads.length ? (
          leads.map((lead) => <DraggableCard key={lead.id} lead={lead} now={now} />)
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
            Solte um card aqui
          </div>
        )}
      </div>
    </section>
  )
}

export default function PipelinePage() {
  const leads = useCrm((s) => s.leads)
  const moveLead = useCrm((s) => s.moveLead)
  const now = useNow(5000)

  const [query, setQuery] = React.useState("")
  const [owner, setOwner] = React.useState("all")
  const [onlyHot, setOnlyHot] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter((l) => {
      if (owner !== "all" && l.ownerId !== owner) return false
      if (onlyHot && !(l.ai && l.temperature === "quente")) return false
      if (q && !`${l.company} ${l.name} ${l.service}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [leads, query, owner, onlyHot])

  const byStage = React.useMemo(() => {
    const map = Object.fromEntries(STAGE_IDS.map((id) => [id, [] as Lead[]])) as Record<Stage, Lead[]>
    for (const lead of filtered) map[lead.stage].push(lead)
    return map
  }, [filtered])

  const open = filtered.filter((l) => l.stage !== "fechado")
  const openValue = open.reduce((sum, l) => sum + l.value, 0)
  const activeLead = activeId ? leads.find((l) => l.id === activeId) : undefined

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const target = e.over?.id as Stage | undefined
    if (target && STAGE_IDS.includes(target)) moveLead(String(e.active.id), target)
  }

  return (
    <div className="grid min-w-0 gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Em aberto</p>
          <p className="tabular text-2xl font-semibold tracking-tight">
            {formatBRLCompact(openValue)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {open.length} negócios
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar empresa ou contato"
              className="w-56 pl-8"
            />
          </div>
          <Select items={OWNER_ITEMS} value={owner} onValueChange={(v) => v && setOwner(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OWNER_ITEMS).map(([id, label]) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Switch checked={onlyHot} onCheckedChange={setOnlyHot} />
            <Flame className="size-4 text-orange-500" />
            Só quentes
          </label>
        </div>
      </div>

      <p className="-mt-1 text-xs text-muted-foreground">
        Arraste os cards entre as colunas para mover o negócio. Clique em um card
        para ver a análise da IA.
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="thin-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:-mx-6 lg:px-6 xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0">
          {STAGES.map((stage) => (
            <Column key={stage.id} stage={stage} leads={byStage[stage.id]} now={now} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180 }}>
          {activeLead ? (
            <div className="w-[17rem]">
              <LeadCard lead={activeLead} now={now} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
