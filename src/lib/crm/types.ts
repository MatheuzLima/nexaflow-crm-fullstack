export type Stage =
  | "novo"
  | "qualificado"
  | "cotacao"
  | "negociacao"
  | "fechado"

export type Temperature = "quente" | "morno" | "frio"
export type Urgency = "alta" | "media" | "baixa"

export type Channel = "WhatsApp" | "Site" | "E-mail" | "Telefone" | "Indicação"

export type Service =
  | "Frete rodoviário"
  | "Armazenagem"
  | "Last mile"
  | "Carga refrigerada"
  | "Logística reversa"
  | "Comércio exterior"

export interface Rep {
  id: string
  name: string
  role: string
  /** matiz (0–360) usado para colorir o avatar */
  hue: number
  services: Service[]
}

export interface ScoreReason {
  label: string
  points: number
}

export interface AiAnalysis {
  summary: string
  intent: string
  urgency: Urgency
  /** 0–100 */
  confidence: number
  reasons: ScoreReason[]
  tags: string[]
  extracted: { volume?: string; route?: string; deadline?: string }
  nextAction: string
  suggestedReply: string
}

export interface Lead {
  id: string
  name: string
  company: string
  role: string
  phone: string
  email: string
  city: string
  channel: Channel
  service: Service
  message: string
  /** valor estimado do negócio, em reais */
  value: number
  /** 0–100; 0 quando ainda não qualificado */
  score: number
  temperature: Temperature
  stage: Stage
  ownerId: string
  createdAt: number
  /** "processing" enquanto o pipeline de automação roda; depois "ready" */
  status: "processing" | "ready"
  /** etapa atual (0–3) do pipeline de automação enquanto processa */
  step: number
  ai?: AiAnalysis
  /** segundos até a primeira resposta automática (se a automação estiver ativa) */
  firstResponseSec?: number
}

export type EventKind =
  | "webhook"
  | "ai"
  | "routing"
  | "message"
  | "stage"
  | "automation"

export interface ActivityEvent {
  id: string
  ts: number
  kind: EventKind
  level: "info" | "success" | "warn"
  title: string
  detail?: string
  leadId?: string
  flowId?: string
}

export type FlowNodeKind = "trigger" | "process" | "ai" | "logic" | "action"

export interface FlowNode {
  label: string
  kind: FlowNodeKind
}

export interface Flow {
  id: string
  name: string
  description: string
  nodes: FlowNode[]
  enabled: boolean
  runs: number
  successRate: number
  avgMs: number
}

export interface IncomingContact {
  name: string
  company: string
  role?: string
  channel: Channel
  message: string
  service?: Service
  city?: string
  phone?: string
  email?: string
}

export const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "novo", label: "Novos", hint: "Nota abaixo de 60 ou sem análise" },
  { id: "qualificado", label: "Qualificados", hint: "Aprovados pela IA" },
  { id: "cotacao", label: "Em cotação", hint: "Proposta enviada" },
  { id: "negociacao", label: "Negociação", hint: "Ajuste final" },
  { id: "fechado", label: "Fechados", hint: "Ganhos" },
]

export const STAGE_LABEL: Record<Stage, string> = {
  novo: "Novo",
  qualificado: "Qualificado",
  cotacao: "Em cotação",
  negociacao: "Negociação",
  fechado: "Fechado",
}

export const SERVICES: Service[] = [
  "Frete rodoviário",
  "Armazenagem",
  "Last mile",
  "Carga refrigerada",
  "Logística reversa",
  "Comércio exterior",
]

export const CHANNELS: Channel[] = [
  "WhatsApp",
  "Site",
  "E-mail",
  "Telefone",
  "Indicação",
]
