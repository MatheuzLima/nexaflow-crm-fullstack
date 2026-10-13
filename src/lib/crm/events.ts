import type { ActivityEvent, Lead, Rep } from "./types"

type EventDraft = Omit<ActivityEvent, "id" | "ts">

export const evWebhook = (lead: Lead): EventDraft => ({
  kind: "webhook",
  level: "info",
  leadId: lead.id,
  flowId: "qualify",
  title: `Webhook recebido via ${lead.channel}`,
  detail: `${lead.company} · ${lead.name}`,
})

export const evAi = (lead: Lead): EventDraft => ({
  kind: "ai",
  level: lead.score >= 60 ? "success" : "info",
  leadId: lead.id,
  flowId: "qualify",
  title: `IA qualificou ${lead.company}: nota ${lead.score} (${lead.temperature})`,
  detail: lead.ai?.summary,
})

export const evRouting = (lead: Lead, rep: Rep): EventDraft => ({
  kind: "routing",
  level: "info",
  leadId: lead.id,
  flowId: "qualify",
  title: `Roteado para ${rep.name}`,
  detail: `Especialidade: ${lead.service}`,
})

export const evReply = (lead: Lead): EventDraft => ({
  kind: "message",
  level: "success",
  leadId: lead.id,
  flowId: "reply",
  title: `Resposta automática enviada em ${lead.firstResponseSec}s`,
  detail: `${lead.company} · WhatsApp`,
})

export const evHot = (lead: Lead): EventDraft => ({
  kind: "automation",
  level: "success",
  leadId: lead.id,
  flowId: "hot",
  title: `Alerta de lead quente enviado ao time`,
  detail: `${lead.company} · nota ${lead.score}`,
})

export const evManual = (lead: Lead): EventDraft => ({
  kind: "automation",
  level: "warn",
  leadId: lead.id,
  flowId: "qualify",
  title: `Qualificação pausada: ${lead.company} aguarda triagem manual`,
  detail: "Ative a automação para analisar com IA",
})

let counter = 0
export const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 5)}`
