import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChannelIcon } from "@/components/crm/channel-icon"
import { ScoreMeter, StageBadge, TemperatureBadge } from "@/components/crm/badges"
import { RepAvatar } from "@/components/crm/rep-avatar"
import { useNow } from "@/hooks/use-now"
import { formatBRL, timeAgo } from "@/lib/crm/format"
import { repById } from "@/lib/crm/reps"
import { useCrm } from "@/lib/crm/store"
import {
  CHANNELS,
  STAGES,
  type Lead,
  type Stage,
  type Temperature,
} from "@/lib/crm/types"

const PAGE_SIZE = 12

type SortKey = "createdAt" | "score" | "value" | "company"

const TEMP_ITEMS = { all: "Toda temperatura", quente: "Quente", morno: "Morno", frio: "Frio" }
const STAGE_ITEMS = { all: "Todas as etapas", ...Object.fromEntries(STAGES.map((s) => [s.id, s.label])) }
const CHANNEL_ITEMS = { all: "Todos os canais", ...Object.fromEntries(CHANNELS.map((c) => [c, c])) }

function FilterSelect({
  items,
  value,
  onChange,
  className,
}: {
  items: Record<string, string>
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <Select items={items} value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className={cn("w-44", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([id, label]) => (
          <SelectItem key={id} value={id}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SortHead({
  label,
  k,
  sort,
  onSort,
  className,
}: {
  label: string
  k: SortKey
  sort: { key: SortKey; dir: "asc" | "desc" }
  onSort: (k: SortKey) => void
  className?: string
}) {
  const active = sort.key === k
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1 py-0.5 -mx-1 transition-colors hover:text-foreground",
          active && "text-foreground"
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </TableHead>
  )
}

function Row({ lead, now }: { lead: Lead; now: number }) {
  const select = useCrm((s) => s.selectLead)
  const owner = repById(lead.ownerId)
  const processing = lead.status === "processing"

  return (
    <TableRow
      tabIndex={0}
      onClick={() => select(lead.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          select(lead.id)
        }
      }}
      className={cn("cursor-pointer outline-none focus-visible:bg-muted/60", processing && "ai-shimmer")}
    >
      <TableCell>
        <div className="font-medium">{lead.company}</div>
        <div className="text-xs text-muted-foreground">
          {lead.name} · {lead.role}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{lead.service}</TableCell>
      <TableCell>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ChannelIcon channel={lead.channel} className="size-4" />
          {lead.channel}
        </span>
      </TableCell>
      <TableCell>
        {processing ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Loader2 className="size-3 animate-spin" /> Analisando…
          </span>
        ) : (
          <ScoreMeter score={lead.score} analysed={!!lead.ai} />
        )}
      </TableCell>
      <TableCell>{lead.ai && !processing ? <TemperatureBadge temperature={lead.temperature} /> : <span className="text-muted-foreground">—</span>}</TableCell>
      <TableCell>
        <StageBadge stage={lead.stage} />
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <RepAvatar repId={lead.ownerId} size={22} />
          <span className="text-muted-foreground">{owner ? owner.name.split(" ")[0] : "—"}</span>
        </span>
      </TableCell>
      <TableCell className="tabular text-right font-medium">
        {lead.ai ? formatBRL(lead.value) : "—"}
      </TableCell>
      <TableCell className="tabular whitespace-nowrap text-right text-muted-foreground">
        {timeAgo(lead.createdAt, now)}
      </TableCell>
    </TableRow>
  )
}

export default function LeadsPage() {
  const leads = useCrm((s) => s.leads)
  const now = useNow(5000)

  const [query, setQuery] = React.useState("")
  const [temp, setTemp] = React.useState("all")
  const [stage, setStage] = React.useState("all")
  const [channel, setChannel] = React.useState("all")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  })
  const [page, setPage] = React.useState(0)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = leads.filter((l) => {
      if (temp !== "all" && !(l.ai && l.temperature === (temp as Temperature))) return false
      if (stage !== "all" && l.stage !== (stage as Stage)) return false
      if (channel !== "all" && l.channel !== channel) return false
      if (q && !`${l.company} ${l.name} ${l.role} ${l.service} ${l.city}`.toLowerCase().includes(q)) return false
      return true
    })
    const dir = sort.dir === "asc" ? 1 : -1
    return [...list].sort((a, b) => {
      if (sort.key === "company") return a.company.localeCompare(b.company, "pt-BR") * dir
      return (a[sort.key] - b[sort.key]) * dir
    })
  }, [leads, query, temp, stage, channel, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(0)
  }

  const onSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "company" ? "asc" : "desc" }))
    setPage(0)
  }

  return (
    <div className="grid min-w-0 gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => reset(setQuery)(e.target.value)}
            placeholder="Buscar empresa, contato ou cidade"
            className="w-72 pl-8"
          />
        </div>
        <FilterSelect items={TEMP_ITEMS} value={temp} onChange={reset(setTemp)} />
        <FilterSelect items={STAGE_ITEMS} value={stage} onChange={reset(setStage)} />
        <FilterSelect items={CHANNEL_ITEMS} value={channel} onChange={reset(setChannel)} />
        <span className="tabular ml-auto text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </span>
      </div>

      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead label="Lead" k="company" sort={sort} onSort={onSort} />
              <TableHead>Serviço</TableHead>
              <TableHead>Canal</TableHead>
              <SortHead label="Nota" k="score" sort={sort} onSort={onSort} />
              <TableHead>Temperatura</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Responsável</TableHead>
              <SortHead label="Valor" k="value" sort={sort} onSort={onSort} className="text-right" />
              <SortHead label="Entrada" k="createdAt" sort={sort} onSort={onSort} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((lead) => <Row key={lead.id} lead={lead} now={now} />)
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  Nenhum lead encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
          <span className="tabular">
            {filtered.length
              ? `${current * PAGE_SIZE + 1}–${Math.min((current + 1) * PAGE_SIZE, filtered.length)} de ${filtered.length}`
              : "0 resultados"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft />
            </Button>
            <span className="tabular px-2">
              {current + 1} / {pages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
              aria-label="Próxima página"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
