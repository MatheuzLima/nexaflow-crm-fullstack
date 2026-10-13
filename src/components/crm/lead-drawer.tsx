import * as React from "react"
import {
  ArrowUpRight,
  Building2,
  Clock,
  Copy,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Timer,
  Wallet,
} from "lucide-react"
import { cn } from "cn"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import { useNow } from "@/hooks/use-now"
import { ChannelIcon } from "@/components/crm/channel-icon"
import { scoreTone, StageBadge, TemperatureBadge } from "@/components/crm/badges"
import { ProcessingSteps } from "@/components/crm/processing-steps"
import { RepAvatar } from "@/components/crm/rep-avatar"
import {
  formatBRL,
  formatDateTime,
  formatDuration,
  formatTime,
  timeAgo,
} from "@/lib/crm/format"
import { repById } from "@/lib/crm/reps"
import { useCrm } from "@/lib/crm/store"
import { STAGES, type Lead, type Stage } from "@/lib/crm/types"

const STAGE_ITEMS = Object.fromEntries(STAGES.map((s) => [s.id, s.label]))

function ScoreRing({ score }: { score: number }) {
  const r = 30
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-[76px] shrink-0">
      <svg viewBox="0 0 76 76" className="size-full -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className={cn("stroke-current transition-all duration-700", scoreTone(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("tabular text-xl leading-none font-bold", scoreTone(score))}>
          {score}
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">nota</span>
      </div>
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{children}</div>
      </div>
    </div>
  )
}

const URGENCY_LABEL = { alta: "Alta", media: "Média", baixa: "Baixa" } as const

function LeadDetail({ lead }: { lead: Lead }) {
  const now = useNow(1000)
  const events = useCrm((s) => s.events)
  const moveLead = useCrm((s) => s.moveLead)
  const owner = repById(lead.ownerId)
  const timeline = React.useMemo(
    () => events.filter((e) => e.leadId === lead.id).slice(0, 8),
    [events, lead.id]
  )
  const ai = lead.ai
  const processing = lead.status === "processing"

  const copyReply = async () => {
    if (!ai) return
    try {
      await navigator.clipboard.writeText(ai.suggestedReply)
      toast.add({ title: "Resposta copiada", type: "success", timeout: 2500 })
    } catch {
      toast.add({ title: "Não foi possível copiar", type: "error", timeout: 2500 })
    }
  }

  const sendReply = () =>
    toast.add({
      title: "Mensagem enviada (demonstração)",
      description: `Em produção, sai pela API do WhatsApp Business para ${lead.name}.`,
      type: "success",
      timeout: 4000,
    })

  return (
    <>
      <SheetHeader className="gap-3 border-b p-5 pr-12">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-lg font-semibold text-primary">
            {lead.company[0]}
          </span>
          <div className="min-w-0">
            <SheetTitle className="truncate text-lg">{lead.company}</SheetTitle>
            <SheetDescription className="truncate">
              {lead.name} · {lead.role}
            </SheetDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StageBadge stage={lead.stage} />
          {!processing && lead.ai && <TemperatureBadge temperature={lead.temperature} />}
          <Badge variant="outline" className="gap-1">
            <ChannelIcon channel={lead.channel} />
            {lead.channel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {timeAgo(lead.createdAt, now)}
          </span>
        </div>
      </SheetHeader>

      <div className="grid gap-6 p-5">
        {processing ? (
          <section className="ai-shimmer rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-primary" />
              O agente está analisando este contato…
            </div>
            <ProcessingSteps step={lead.step} />
          </section>
        ) : ai ? (
          <section className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/8 to-transparent p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" />
                Análise do agente de IA
              </div>
              <span className="text-xs text-muted-foreground">
                Confiança {ai.confidence}%
              </span>
            </div>

            <div className="flex items-center gap-4">
              <ScoreRing score={lead.score} />
              <p className="text-sm leading-relaxed">{ai.summary}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="secondary">Intenção: {ai.intent}</Badge>
              <Badge variant="secondary">Urgência: {URGENCY_LABEL[ai.urgency]}</Badge>
              {ai.extracted.volume && <Badge variant="secondary">Volume: {ai.extracted.volume}</Badge>}
              {ai.extracted.route && <Badge variant="secondary">Rota: {ai.extracted.route}</Badge>}
              {ai.extracted.deadline && <Badge variant="secondary">Prazo: {ai.extracted.deadline}</Badge>}
            </div>

            <div className="mt-5">
              <h4 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Por que essa nota?
              </h4>
              <ul className="grid gap-1.5">
                {ai.reasons.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span
                      className={cn(
                        "tabular shrink-0 font-semibold",
                        r.points >= 0
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-rose-600 dark:text-rose-300"
                      )}
                    >
                      {r.points > 0 ? "+" : ""}
                      {r.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {ai.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-background/60 p-3 text-sm ring-1 ring-foreground/8">
              <span className="font-medium">Próxima ação sugerida: </span>
              {ai.nextAction}.
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Este contato entrou sem análise porque a automação de qualificação
            estava pausada.{" "}
            <Link to="/automacoes" className="font-medium text-primary underline-offset-4 hover:underline">
              Ver automações
            </Link>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold">Mensagem recebida</h3>
          <blockquote className="rounded-lg border-l-2 border-primary/50 bg-muted/50 p-3 text-sm leading-relaxed">
            {lead.message}
          </blockquote>
        </section>

        {ai && !processing && (
          <section>
            <h3 className="mb-2 text-sm font-semibold">Resposta sugerida pela IA</h3>
            <div className="rounded-lg border bg-card p-3 text-sm leading-relaxed">
              {ai.suggestedReply}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={sendReply}>
                <Send data-icon="inline-start" />
                Enviar no WhatsApp
              </Button>
              <Button size="sm" variant="outline" onClick={copyReply}>
                <Copy data-icon="inline-start" />
                Copiar
              </Button>
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border p-4">
          <Info icon={Building2} label="Serviço">{lead.service}</Info>
          <Info icon={Wallet} label="Valor estimado">
            {lead.ai ? formatBRL(lead.value) : "—"}
          </Info>
          <Info icon={Phone} label="Telefone">{lead.phone}</Info>
          <Info icon={Mail} label="E-mail">{lead.email}</Info>
          <Info icon={MapPin} label="Cidade">{lead.city}</Info>
          <Info icon={Timer} label="1ª resposta">
            {lead.firstResponseSec ? formatDuration(lead.firstResponseSec) : "—"}
          </Info>
          <div className="col-span-2 flex items-center gap-2.5 border-t pt-4">
            <RepAvatar repId={lead.ownerId} size={28} />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Responsável</div>
              <div className="truncate text-sm font-medium">
                {owner ? `${owner.name} · ${owner.role}` : "Aguardando roteamento"}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-2">
          <h3 className="text-sm font-semibold">Etapa do funil</h3>
          <Select
            items={STAGE_ITEMS}
            value={lead.stage}
            disabled={processing}
            onValueChange={(v) => v && moveLead(lead.id, v as Stage)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold">Linha do tempo</h3>
          {timeline.length ? (
            <ol className="relative grid gap-4 border-l pl-4">
              {timeline.map((e) => (
                <li key={e.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[21px] size-2.5 rounded-full ring-4 ring-background",
                      e.level === "success" ? "bg-emerald-500" : e.level === "warn" ? "bg-amber-500" : "bg-primary"
                    )}
                  />
                  <div className="text-sm leading-snug">{e.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatTime(e.ts)}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              Entrou em {formatDateTime(lead.createdAt)}. Sem eventos recentes.
            </p>
          )}
        </section>

        <Link
          to="/leads"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Ver todos os leads <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </>
  )
}

export function LeadDrawer() {
  const selectedId = useCrm((s) => s.selectedLeadId)
  const lead = useCrm((s) => s.leads.find((l) => l.id === selectedId))
  const selectLead = useCrm((s) => s.selectLead)

  // mantém o último lead visível durante a animação de fechamento do painel
  const [shown, setShown] = React.useState<Lead | undefined>(lead)
  if (lead && lead !== shown) setShown(lead)

  // foco inicial no topo do painel (e não no primeiro botão, que fica lá embaixo)
  const topRef = React.useRef<HTMLDivElement>(null)

  return (
    <Sheet open={!!lead} onOpenChange={(open) => !open && selectLead(null)}>
      <SheetContent
        initialFocus={topRef}
        className="thin-scroll gap-0 overflow-y-auto p-0 data-[side=right]:w-[94%] data-[side=right]:sm:max-w-lg"
      >
        <div ref={topRef} tabIndex={-1} className="outline-none">
          {shown && <LeadDetail lead={shown} />}
        </div>
      </SheetContent>
    </Sheet>
  )
}
