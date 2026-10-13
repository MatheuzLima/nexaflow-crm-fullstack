import type { Flow } from "./types"

export type FlowId = "qualify" | "reply" | "hot" | "followup" | "nps"

export const FLOWS_SEED: Flow[] = [
  {
    id: "qualify",
    name: "Qualificação automática com IA",
    description:
      "Lê cada mensagem recebida, extrai volume, rota e prazo, calcula a nota do lead e define a temperatura. Sem essa automação, os leads chegam sem análise.",
    nodes: [
      { label: "Webhook de entrada", kind: "trigger" },
      { label: "Extrair dados", kind: "process" },
      { label: "Agente de IA: nota e intenção", kind: "ai" },
      { label: "Roteamento por especialidade", kind: "logic" },
      { label: "Notificar vendedor", kind: "action" },
    ],
    enabled: true,
    runs: 412,
    successRate: 99.3,
    avgMs: 1840,
  },
  {
    id: "reply",
    name: "Resposta imediata no WhatsApp",
    description:
      "A IA redige e envia a primeira resposta em segundos, mesmo fora do horário comercial. Desligada, o tempo de primeira resposta deixa de ser medido.",
    nodes: [
      { label: "Novo lead qualificado", kind: "trigger" },
      { label: "IA redige a resposta", kind: "ai" },
      { label: "Enviar no WhatsApp", kind: "action" },
      { label: "Registrar no CRM", kind: "process" },
    ],
    enabled: true,
    runs: 389,
    successRate: 98.7,
    avgMs: 2120,
  },
  {
    id: "hot",
    name: "Alerta de lead quente",
    description:
      "Quando a nota passa de 75, avisa o time na hora e cria a tarefa de ligar em até 15 minutos.",
    nodes: [
      { label: "Nota ≥ 75", kind: "trigger" },
      { label: "Priorizar no pipeline", kind: "logic" },
      { label: "Avisar no Slack", kind: "action" },
      { label: "Criar tarefa: ligar em 15 min", kind: "action" },
    ],
    enabled: true,
    runs: 96,
    successRate: 100,
    avgMs: 410,
  },
  {
    id: "followup",
    name: "Follow-up de cotações paradas",
    description:
      "Detecta cotações sem retorno há mais de 48 horas, sugere a mensagem de cobrança e alerta o responsável.",
    nodes: [
      { label: "Cotação parada há 48 h", kind: "trigger" },
      { label: "IA sugere a mensagem", kind: "ai" },
      { label: "Enviar lembrete", kind: "action" },
      { label: "Alertar responsável", kind: "action" },
    ],
    enabled: true,
    runs: 58,
    successRate: 96.6,
    avgMs: 1730,
  },
  {
    id: "nps",
    name: "Pós-venda e pesquisa NPS",
    description:
      "Após o fechamento, aguarda 7 dias, envia a pesquisa de satisfação e atualiza o cadastro do cliente.",
    nodes: [
      { label: "Negócio fechado", kind: "trigger" },
      { label: "Aguardar 7 dias", kind: "logic" },
      { label: "Enviar pesquisa NPS", kind: "action" },
      { label: "Atualizar CRM", kind: "process" },
    ],
    enabled: true,
    runs: 21,
    successRate: 100,
    avgMs: 960,
  },
]
