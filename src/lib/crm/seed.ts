import { qualify } from "./ai"
import { evAi, evRouting, evWebhook, evReply } from "./events"
import { between, generateContact, mulberry32, type Rng } from "./generator"
import { QUALIFIED_THRESHOLD } from "./thresholds"
import { pickRep, repById } from "./reps"
import type { ActivityEvent, Lead, Stage, Temperature } from "./types"

const HOUR = 3_600_000

/** Peso por hora do dia: mais contatos em horário comercial. */
function hourWeight(hour: number): number {
  if (hour >= 8 && hour <= 17) return 1
  if (hour === 6 || hour === 7 || (hour >= 18 && hour <= 21)) return 0.5
  return 0.12
}

/** Mesma regra do fluxo ao vivo: nota < 60 fica em "Novos"; a partir de 60 o lead avança. */
function pickStage(rng: Rng, score: number, temp: Temperature, ageHours: number): Stage {
  if (score < QUALIFIED_THRESHOLD) return "novo"
  if (ageHours < 1.2) return "qualificado"
  const r = rng()
  if (temp === "morno") return r < 0.55 ? "qualificado" : r < 0.88 ? "cotacao" : "negociacao"
  if (r < 0.2) return "qualificado"
  if (r < 0.5) return "cotacao"
  if (r < 0.8) return "negociacao"
  return "fechado"
}

export function buildSeed(now: number = Date.now()) {
  const rng = mulberry32(20261011)
  const load: Record<string, number> = {}
  const leads: Lead[] = []

  for (let i = 0; i < 46; i++) {
    let offset = 0
    for (let tries = 0; tries < 25; tries++) {
      offset = rng() * 24 * HOUR
      if (rng() < hourWeight(new Date(now - offset).getHours())) break
    }

    const c = generateContact(rng)
    const service = c.service!
    const rep = pickRep(service, load, rng)
    const result = qualify({
      name: c.name,
      company: c.company,
      role: c.role ?? "",
      channel: c.channel,
      message: c.message,
      service,
      repName: rep.name,
    })

    const stage = pickStage(rng, result.score, result.temperature, offset / HOUR)
    if (stage !== "fechado") load[rep.id] = (load[rep.id] ?? 0) + 1

    leads.push({
      id: `seed-${i + 1}`,
      name: c.name,
      company: c.company,
      role: c.role ?? "Contato",
      phone: c.phone ?? "",
      email: c.email ?? "",
      city: c.city ?? "",
      channel: c.channel,
      service,
      message: c.message,
      value: result.value,
      score: result.score,
      temperature: result.temperature,
      stage,
      ownerId: rep.id,
      createdAt: Math.round(now - offset),
      status: "ready",
      step: 4,
      ai: result.ai,
      firstResponseSec: between(rng, 6, 58),
    })
  }

  leads.sort((a, b) => b.createdAt - a.createdAt)

  // Histórico de atividade a partir dos leads mais recentes
  const events: ActivityEvent[] = []
  for (const lead of leads.slice(0, 9)) {
    const rep = repById(lead.ownerId)
    if (!rep) continue
    const drafts = [
      { dt: 0, d: evWebhook(lead) },
      { dt: 1900, d: evAi(lead) },
      { dt: 2600, d: evRouting(lead, rep) },
      { dt: 4000, d: evReply(lead) },
    ]
    for (const { dt, d } of drafts) {
      events.push({
        ...d,
        id: `seed-ev-${lead.id}-${dt}`,
        ts: lead.createdAt + dt,
      })
    }
  }
  events.sort((a, b) => b.ts - a.ts)

  return { leads, events }
}
