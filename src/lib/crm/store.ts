import { create } from "zustand"

import { toast } from "@/components/ui/toast"

import { detectService, qualify } from "./ai"
import {
  evAi,
  evHot,
  evManual,
  evReply,
  evRouting,
  evWebhook,
  nextId,
} from "./events"
import { FLOWS_SEED, type FlowId } from "./flows"
import { formatBRL } from "./format"
import {
  fakeEmail,
  fakePhone,
  generateContact,
  homeCityFor,
} from "./generator"
import { openLoad, pickRep, repById } from "./reps"
import { buildSeed } from "./seed"
import { QUALIFIED_THRESHOLD } from "./thresholds"
import {
  STAGE_LABEL,
  type ActivityEvent,
  type Flow,
  type IncomingContact,
  type Lead,
  type Stage,
} from "./types"

const MAX_EVENTS = 80
const MAX_LEADS = 400

type EventDraft = Omit<ActivityEvent, "id" | "ts">

interface CrmState {
  leads: Lead[]
  events: ActivityEvent[]
  flows: Flow[]
  /** simulação de contatos chegando em tempo real */
  live: boolean
  selectedLeadId: string | null
  newContactOpen: boolean

  setLive: (live: boolean) => void
  selectLead: (id: string | null) => void
  setNewContactOpen: (open: boolean) => void
  moveLead: (id: string, stage: Stage) => void
  ingest: (contact: IncomingContact) => string
  simulateRandom: () => void
  followUpTick: () => void
  toggleFlow: (id: string) => void
  reset: () => void
}

function freshState() {
  const seed = buildSeed()
  return {
    leads: seed.leads,
    events: seed.events,
    flows: FLOWS_SEED.map((f) => ({ ...f })),
  }
}

export const useCrm = create<CrmState>()((set, get) => {
  /** invalida timers de processamento pendentes quando a demo é reiniciada */
  let generation = 0

  const isOn = (id: FlowId) =>
    get().flows.find((f) => f.id === id)?.enabled ?? false

  const pushEvents = (drafts: EventDraft[], ts: number = Date.now()) =>
    set((s) => ({
      events: [
        ...drafts
          .map((d, i) => ({ ...d, id: nextId("ev"), ts: ts + i }))
          .reverse(),
        ...s.events,
      ].slice(0, MAX_EVENTS),
    }))

  const bumpFlow = (id: FlowId, n = 1) =>
    set((s) => ({
      flows: s.flows.map((f) => (f.id === id ? { ...f, runs: f.runs + n } : f)),
    }))

  const patchLead = (id: string, patch: Partial<Lead>) =>
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))

  const finalize = (id: string) => {
    const current = get().leads.find((l) => l.id === id)
    if (!current) return

    const rep = pickRep(current.service, openLoad(get().leads))

    // automação de qualificação pausada: o lead entra sem análise
    if (!isOn("qualify")) {
      patchLead(id, { status: "ready", step: 4, ownerId: rep.id })
      pushEvents([evManual(current)])
      return
    }

    const result = qualify({
      name: current.name,
      company: current.company,
      role: current.role,
      channel: current.channel,
      message: current.message,
      service: current.service,
      repName: rep.name,
    })

    const replyOn = isOn("reply")
    const updated: Lead = {
      ...current,
      status: "ready",
      step: 4,
      ownerId: rep.id,
      score: result.score,
      temperature: result.temperature,
      value: result.value,
      ai: result.ai,
      stage: result.score >= QUALIFIED_THRESHOLD ? "qualificado" : "novo",
      firstResponseSec: replyOn ? 6 + Math.floor(Math.random() * 44) : undefined,
    }
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? updated : l)) }))

    const drafts: EventDraft[] = [evAi(updated), evRouting(updated, rep)]
    bumpFlow("qualify")
    if (replyOn) {
      drafts.push(evReply(updated))
      bumpFlow("reply")
    }
    if (updated.score >= 75 && isOn("hot")) {
      drafts.push(evHot(updated))
      bumpFlow("hot")
      toast.add({
        title: "Lead quente chegando",
        description: `${updated.company} · nota ${updated.score} · ${formatBRL(updated.value)} estimado`,
        type: "success",
        timeout: 6000,
      })
    }
    pushEvents(drafts)
  }

  return {
    ...freshState(),
    live: true,
    selectedLeadId: null,
    newContactOpen: false,

    setLive: (live) => set({ live }),
    selectLead: (id) => set({ selectedLeadId: id }),
    setNewContactOpen: (open) => set({ newContactOpen: open }),

    ingest: (contact) => {
      const gen = generation
      const id = nextId("lead")
      const home = homeCityFor(Math.random)
      const company = contact.company.trim() || "Pessoa física"

      const lead: Lead = {
        id,
        name: contact.name.trim() || "Contato sem nome",
        company,
        role: contact.role?.trim() || "Contato",
        phone: contact.phone ?? fakePhone(Math.random, home.ddd),
        email: contact.email ?? fakeEmail(contact.name || "contato", company),
        city: contact.city ?? `${home.name}/${home.uf}`,
        channel: contact.channel,
        service: contact.service ?? detectService(contact.message),
        message: contact.message.trim(),
        value: 0,
        score: 0,
        temperature: "frio",
        stage: "novo",
        ownerId: "",
        createdAt: Date.now(),
        status: "processing",
        step: 0,
      }

      set((s) => ({ leads: [lead, ...s.leads].slice(0, MAX_LEADS) }))
      pushEvents([evWebhook(lead)])

      const qualifyOn = isOn("qualify")
      if (qualifyOn) {
        ;[650, 1450, 2350].forEach((ms, i) =>
          setTimeout(() => {
            if (gen === generation) patchLead(id, { step: i + 1 })
          }, ms)
        )
      }
      setTimeout(
        () => {
          if (gen === generation) finalize(id)
        },
        qualifyOn ? 3100 : 900
      )
      return id
    },

    simulateRandom: () => {
      get().ingest(generateContact())
    },

    followUpTick: () => {
      if (!isOn("followup")) return
      const stalled = get().leads.filter((l) => l.stage === "cotacao")
      if (!stalled.length) return
      const lead = stalled[Math.floor(Math.random() * stalled.length)]
      const owner = repById(lead.ownerId)
      pushEvents([
        {
          kind: "automation",
          level: "info",
          flowId: "followup",
          leadId: lead.id,
          title: `Lembrete de cotação parada enviado a ${lead.company}`,
          detail: owner ? `Responsável avisado: ${owner.name}` : undefined,
        },
      ])
      bumpFlow("followup")
    },

    moveLead: (id, stage) => {
      const lead = get().leads.find((l) => l.id === id)
      if (!lead || lead.stage === stage) return
      patchLead(id, { stage })
      pushEvents([
        {
          kind: "stage",
          level: "info",
          leadId: id,
          title: `${lead.company} movido para ${STAGE_LABEL[stage]}`,
          detail: `Antes: ${STAGE_LABEL[lead.stage]}`,
        },
      ])
      if (stage === "fechado") {
        toast.add({
          title: "Negócio fechado",
          description: `${lead.company} · ${formatBRL(lead.value)}`,
          type: "success",
          timeout: 5000,
        })
        if (isOn("nps")) {
          bumpFlow("nps")
          pushEvents([
            {
              kind: "automation",
              level: "success",
              flowId: "nps",
              leadId: id,
              title: `Pesquisa NPS agendada para ${lead.company}`,
              detail: "Envio automático em 7 dias",
            },
          ])
        }
      }
    },

    toggleFlow: (id) => {
      const flow = get().flows.find((f) => f.id === id)
      if (!flow) return
      const enabled = !flow.enabled
      set((s) => ({
        flows: s.flows.map((f) => (f.id === id ? { ...f, enabled } : f)),
      }))
      pushEvents([
        {
          kind: "automation",
          level: enabled ? "success" : "warn",
          flowId: id,
          title: `Automação "${flow.name}" ${enabled ? "ativada" : "pausada"}`,
        },
      ])
    },

    reset: () => {
      generation++
      set({ ...freshState(), selectedLeadId: null })
    },
  }
})
