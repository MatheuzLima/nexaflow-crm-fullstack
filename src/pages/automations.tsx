import * as React from "react"
import {
  BellRing,
  ChevronRight,
  Cog,
  Database,
  FileSpreadsheet,
  GitBranch,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ActivityCard } from "@/components/dashboard/activity-card"
import { ContactForm } from "@/components/crm/contact-form"
import { useCrm } from "@/lib/crm/store"
import type { Flow, FlowNodeKind } from "@/lib/crm/types"

const NODE_STYLE: Record<FlowNodeKind, { icon: LucideIcon; tone: string; label: string }> = {
  trigger: { icon: Zap, tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300", label: "Gatilho" },
  process: { icon: Cog, tone: "bg-slate-500/15 text-slate-700 dark:text-slate-300", label: "Processo" },
  ai: { icon: Sparkles, tone: "bg-primary/15 text-primary", label: "IA" },
  logic: { icon: GitBranch, tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300", label: "Regra" },
  action: { icon: Send, tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", label: "Ação" },
}

function FlowDiagram({ flow }: { flow: Flow }) {
  return (
    <ol
      className={cn(
        "thin-scroll -mx-1 flex items-stretch gap-1 overflow-x-auto px-1 pb-2 transition-opacity",
        !flow.enabled && "opacity-50 grayscale"
      )}
    >
      {flow.nodes.map((node, i) => {
        const style = NODE_STYLE[node.kind]
        const Icon = style.icon
        return (
          <React.Fragment key={node.label}>
            <li className="flex w-36 shrink-0 flex-col gap-2 rounded-xl border bg-card p-2.5">
              <span className={cn("flex size-7 items-center justify-center rounded-lg", style.tone)}>
                <Icon className="size-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {style.label}
                </p>
                <p className="text-xs leading-snug font-medium">{node.label}</p>
              </div>
            </li>
            {i < flow.nodes.length - 1 && (
              <li aria-hidden className="flex shrink-0 items-center text-muted-foreground/60">
                <ChevronRight className="size-4" />
              </li>
            )}
          </React.Fragment>
        )
      })}
    </ol>
  )
}

function FlowCard({ flow }: { flow: Flow }) {
  const toggle = useCrm((s) => s.toggleFlow)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {flow.name}
          <Badge variant="ghost" className={flow.enabled ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}>
            {flow.enabled ? "Ativa" : "Pausada"}
          </Badge>
        </CardTitle>
        <CardDescription>{flow.description}</CardDescription>
        <CardAction>
          <Switch
            checked={flow.enabled}
            onCheckedChange={() => toggle(flow.id)}
            aria-label={`${flow.enabled ? "Pausar" : "Ativar"} ${flow.name}`}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <FlowDiagram flow={flow} />
        <dl className="mt-3 grid grid-cols-3 gap-3 border-t pt-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Execuções</dt>
            <dd className="tabular mt-0.5 text-sm font-semibold">{flow.runs.toLocaleString("pt-BR")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sucesso</dt>
            <dd className="tabular mt-0.5 text-sm font-semibold">
              {flow.successRate.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tempo médio</dt>
            <dd className="tabular mt-0.5 text-sm font-semibold">
              {(flow.avgMs / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

const INTEGRATIONS: { name: string; desc: string; icon: LucideIcon; status: string }[] = [
  { name: "WhatsApp Business API", desc: "Envio e recebimento de mensagens", icon: MessageCircle, status: "Conectado" },
  { name: "Webhook de formulários", desc: "POST /api/webhooks/leads", icon: Webhook, status: "Ativo" },
  { name: "Google Planilhas", desc: "Sincronização de contatos", icon: FileSpreadsheet, status: "Sincronizado" },
  { name: "Alertas no Slack", desc: "Leads quentes e cotações paradas", icon: BellRing, status: "Conectado" },
  { name: "E-mail (SMTP)", desc: "Propostas e pesquisa NPS", icon: Mail, status: "Conectado" },
  { name: "Banco de dados", desc: "Histórico e auditoria", icon: Database, status: "Online" },
]

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="tabular mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export default function AutomationsPage() {
  const flows = useCrm((s) => s.flows)

  const totals = React.useMemo(() => {
    const runs = flows.reduce((s, f) => s + f.runs, 0)
    const weighted = (pick: (f: Flow) => number) =>
      runs ? flows.reduce((s, f) => s + pick(f) * f.runs, 0) / runs : 0
    return {
      runs,
      success: weighted((f) => f.successRate),
      avgMs: weighted((f) => f.avgMs),
      // estimativa: ~4 min de trabalho manual evitado por execução
      hoursSaved: Math.round((runs * 4) / 60),
      active: flows.filter((f) => f.enabled).length,
    }
  }, [flows])

  return (
    <div className="grid min-w-0 gap-4 p-4 lg:p-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Execuções" value={totals.runs.toLocaleString("pt-BR")} hint={`${totals.active} de ${flows.length} automações ativas`} />
        <Stat
          label="Taxa de sucesso"
          value={`${totals.success.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
          hint="Média ponderada por execução"
        />
        <Stat
          label="Tempo médio"
          value={`${(totals.avgMs / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s`}
          hint="Do gatilho à ação final"
        />
        <Stat label="Horas economizadas" value={`≈ ${totals.hoursSaved} h`} hint="Estimativa de trabalho manual evitado" />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <div className="grid min-w-0 gap-4 xl:col-span-7">
          {flows.map((flow) => (
            <FlowCard key={flow.id} flow={flow} />
          ))}
        </div>

        <div className="grid min-w-0 gap-4 xl:sticky xl:top-4 xl:col-span-5">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Simulador de webhook</CardTitle>
              <CardDescription>
                Escreva uma mensagem como um cliente e veja a automação rodar no
                dashboard, em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm showPayload />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>Ilustrativas nesta demonstração</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-1">
                {INTEGRATIONS.map(({ name, desc, icon: Icon, status }) => (
                  <li key={name} className="flex min-w-0 items-center gap-3 rounded-lg p-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {status}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <ActivityCard limit={12} />
    </div>
  )
}
