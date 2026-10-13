import type {
  AiAnalysis,
  Channel,
  ScoreReason,
  Service,
  Temperature,
  Urgency,
} from "./types"

/**
 * Motor de qualificação do NexaFlow (versão de demonstração).
 *
 * É determinístico e explicável: lê a mensagem, extrai sinais (intenção, urgência,
 * volume, recorrência, poder de decisão) e devolve nota, temperatura e o "porquê"
 * de cada ponto. Em produção, `qualify()` é o ponto onde entra uma chamada a um
 * LLM (ex.: uma função serverless que devolve o mesmo formato `QualifyResult`).
 */

export interface QualifyInput {
  name: string
  company: string
  role: string
  channel: Channel
  message: string
  service?: Service
  repName?: string
}

export interface QualifyResult {
  score: number
  temperature: Temperature
  value: number
  service: Service
  ai: AiAnalysis
}

const RX = {
  buy: /(contratar|fechar|fechamento|contrato|proposta|cota[cç][aã]o|cotar|or[cç]amento|preciso|precisamos|quero|queremos|gostaria de contratar)/i,
  urgent:
    /(urgente|urg[êe]ncia|amanh[ãa]|essa semana|esta semana|nesta semana|imediat|o quanto antes|prazo curto|pr[óo]xima semana)/i,
  /** "hoje" só conta como prazo quando ligado a uma ação ("a carga sai hoje"), não em "hoje temos 600 pallets" */
  today:
    /(?:sai|sair|saindo|despach|colet|entreg|embarc|retirar)[^.!?]{0,40}\bhoje\b|\bhoje\b[^.!?]{0,40}(?:sai|despach|colet|entreg|embarc|preciso)|ainda hoje|para hoje|at[ée] hoje/i,
  recurring:
    /(mensal|semanal|recorrente|contrato|toda semana|por semana|por m[êe]s|por dia|di[áa]rio|giro mensal|todo m[êe]s)/i,
  decision:
    /(or[çc]amento aprovado|verba aprovada|diretoria|diretor|ger[êe]ncia|gerente|decis[ãa]o|s[óo]cio|compras|procurement|dono da empresa|sou o respons[áa]vel)/i,
  negative:
    /(s[óo] (estou )?(pesquisando|olhando)|curiosidade|sem previs[ãa]o|estudante|trabalho (da )?faculdade|apenas pre[çc]o|talvez ano que vem|s[óo] quero saber)/i,
  quote: /(cota|or[çc]amento|valor|quanto (custa|sai)|pre[çc]o)/i,
  meeting: /(reuni[ãa]o|conversar|agendar|ligar|call|apresenta[çc][ãa]o)/i,
  volume:
    /(\d[\d.]*)\s*(paletes?|pallets?|toneladas?|ton\b|caminh[õo]es|viagens|entregas|pedidos|pacotes|containers?|contêineres?|lojas|volumes?)(?:\s*(?:por|\/|ao)\s*(dia|semana|m[êe]s))?/i,
  route:
    /\bde\s+([A-ZÀ-Ý][\wÀ-ÿ]+(?:\s[A-ZÀ-Ý][\wÀ-ÿ]+)?)\s+(?:para|pra|até|a)\s+([A-ZÀ-Ý][\wÀ-ÿ]+(?:\s[A-ZÀ-Ý][\wÀ-ÿ]+)?)/,
  deadline:
    /(amanh[ãa]|(?:nessa|essa|esta|nesta) semana|pr[óo]xima semana|(?:ainda )?(?:este|esse) m[êe]s|\d{1,2}\/\d{1,2})/i,
}

export function detectService(message: string): Service {
  if (/(refriger|congelad|temperatura controlada|ba[úu] frio|cadeia fria)/i.test(message))
    return "Carga refrigerada"
  if (/(importa|exporta|container|contêiner|aduan|porto de|desembara)/i.test(message))
    return "Comércio exterior"
  if (/(revers|devolu[çc]|recolh)/i.test(message)) return "Logística reversa"
  if (/(last mile|consumidor final|entrega expressa|motoboy|e-?commerce|entregas por dia)/i.test(message))
    return "Last mile"
  if (/(armazen|estoque|centro de distribui|\bcd\b|guardar|pallets? em)/i.test(message))
    return "Armazenagem"
  return "Frete rodoviário"
}

export function temperatureOf(score: number): Temperature {
  if (score >= 75) return "quente"
  if (score >= 50) return "morno"
  return "frio"
}

const BASE_VALUE: Record<Service, number> = {
  "Frete rodoviário": 4500,
  Armazenagem: 9000,
  "Last mile": 6500,
  "Carga refrigerada": 8000,
  "Logística reversa": 12000,
  "Comércio exterior": 15000,
}

const QUESTION: Record<Service, string> = {
  "Frete rodoviário": "tipo de carga, peso aproximado e a janela de coleta",
  Armazenagem: "quantidade de paletes, giro mensal e se há controle de lote",
  "Last mile": "volume diário de entregas, regiões atendidas e janela de entrega",
  "Carga refrigerada": "faixa de temperatura, tipo de produto e frequência",
  "Logística reversa": "tipos de material, número de pontos de coleta e periodicidade",
  "Comércio exterior":
    "tipo de operação (importação ou exportação), porto e volume mensal de containers",
}

function roundTo(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step)
}

export function qualify(input: QualifyInput): QualifyResult {
  const { message, channel, company, role } = input
  const service = input.service ?? detectService(message)
  const text = `${message} ${role}`

  const reasons: ScoreReason[] = [{ label: "Ponto de partida", points: 30 }]
  const add = (label: string, points: number) => reasons.push({ label, points })

  const negative = RX.negative.test(message)
  const vague = message.trim().length < 45
  const buy = RX.buy.test(message)
  const urgentToday = RX.today.test(message)
  const urgent = RX.urgent.test(message) || urgentToday
  const recurring = RX.recurring.test(message)
  const decision = RX.decision.test(text)
  const volumeMatch = message.match(RX.volume)
  const routeMatch = message.match(RX.route)
  const deadlineMatch = message.match(RX.deadline)

  if (buy) add("Intenção explícita de cotar ou contratar", 15)
  if (urgent) add("Prazo curto ou urgência declarada", 15)
  if (volumeMatch) add("Informou volume da operação", 12)
  if (recurring) add("Demanda recorrente (contrato)", 10)
  if (routeMatch) add("Rota de origem e destino definida", 6)
  if (decision) add("Sinal de poder de decisão ou verba", 10)
  if (company && !/pessoa f[ií]sica/i.test(company)) add("Empresa identificada", 5)
  if (channel === "Indicação") add("Veio por indicação", 8)
  else if (channel === "WhatsApp") add("Contato direto pelo WhatsApp", 3)
  if (negative) add("Linguagem de baixa intenção (só pesquisando)", -25)
  if (vague) add("Mensagem curta, poucas informações", -8)

  const raw = reasons.reduce((sum, r) => sum + r.points, 0)
  const score = Math.max(5, Math.min(98, raw))
  const temperature = temperatureOf(score)

  const urgency: Urgency = urgent ? "alta" : buy && !negative ? "media" : "baixa"

  const volumeNumber = volumeMatch
    ? Number(volumeMatch[1].replace(/\./g, ""))
    : 0
  const volumeLabel = volumeMatch
    ? `${volumeMatch[1]} ${volumeMatch[2].toLowerCase()}${volumeMatch[3] ? ` por ${volumeMatch[3].toLowerCase()}` : ""}`
    : undefined
  const route = routeMatch ? `${routeMatch[1]} → ${routeMatch[2]}` : undefined
  const deadline = urgentToday ? "hoje" : deadlineMatch ? deadlineMatch[1].toLowerCase() : undefined

  let value = BASE_VALUE[service]
  if (volumeNumber > 0) value *= 1 + Math.min(volumeNumber, 100) / 50
  if (recurring) value *= 1.6
  if (decision) value *= 1.15
  if (vague || negative) value *= 0.5
  value = roundTo(value, 500)

  const intent = negative
    ? "Apenas pesquisando"
    : /(contratar|fechar|contrato|proposta)/i.test(message)
      ? "Contratação"
      : RX.quote.test(message)
        ? "Cotação"
        : RX.meeting.test(message)
          ? "Reunião comercial"
          : "Primeiro contato"

  const tags: string[] = [service, channel]
  if (urgent) tags.push("Urgente")
  if (recurring) tags.push("Recorrente")
  if (volumeNumber >= 20) tags.push("Alto volume")
  if (decision) tags.push("Decisor")
  if (negative) tags.push("Baixa intenção")

  const who = company && !/pessoa f[ií]sica/i.test(company) ? company : input.name
  const summary =
    `${who} busca ${service.toLowerCase()}` +
    (route ? ` na rota ${route}` : "") +
    (volumeLabel ? `, com ${volumeLabel}` : "") +
    (urgent ? " e prazo curto" : "") +
    (negative ? ", mas demonstra baixa intenção de compra agora" : "") +
    "."

  const nextAction =
    temperature === "quente"
      ? "Ligar em até 15 min e enviar uma proposta preliminar"
      : temperature === "morno"
        ? "Responder no WhatsApp com perguntas de qualificação e propor uma call"
        : "Enviar material institucional e incluir na cadência de nutrição (7 dias)"

  const first = input.name.split(" ")[0]
  const rep = input.repName ?? "a equipe comercial"
  const suggestedReply =
    `Olá, ${first}! Aqui é ${rep} da NexaFlow. Recebi sua mensagem sobre ${service.toLowerCase()}` +
    (route ? ` (${route})` : "") +
    `. Para montar uma cotação certeira, você consegue me confirmar ${QUESTION[service]}?` +
    (urgent ? " Como o prazo é curto, já deixei seu pedido como prioridade." : "")

  const confidence = Math.max(
    55,
    Math.min(97, 60 + reasons.length * 4 - (vague ? 12 : 0) + (negative ? 10 : 0))
  )

  return {
    score,
    temperature,
    value,
    service,
    ai: {
      summary,
      intent,
      urgency,
      confidence,
      reasons,
      tags,
      extracted: { volume: volumeLabel, route, deadline },
      nextAction: urgent && temperature !== "frio" ? `${nextAction} (prioridade do dia)` : nextAction,
      suggestedReply,
    },
  }
}
