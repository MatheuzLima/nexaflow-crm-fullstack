import * as React from "react"

import { REPS } from "./reps"
import { QUALIFIED_THRESHOLD } from "./thresholds"
import { useCrm } from "./store"
import {
  CHANNELS,
  STAGES,
  type Channel,
  type Lead,
  type Stage,
} from "./types"

const HOUR = 3_600_000

export interface HourBucket {
  label: string
  total: number
  qualified: number
}

export interface Metrics {
  leads24h: number
  leadsLastHour: number
  analysed: number
  qualified: number
  qualificationRate: number
  avgFirstResponse: number | null
  openCount: number
  pipelineValue: number
  closedValue: number
  closedCount: number
  hotOpen: number
  hourly: HourBucket[]
  funnel: { stage: Stage; label: string; count: number; value: number; reached: number }[]
  channels: { channel: Channel; count: number }[]
  team: { repId: string; open: number; value: number; hot: number }[]
}

const STAGE_ORDER = STAGES.map((s) => s.id)

export function computeMetrics(leads: Lead[], now: number): Metrics {
  const since = now - 24 * HOUR
  const last24 = leads.filter((l) => l.createdAt >= since)
  const analysedLeads = leads.filter((l) => l.ai)
  const qualified = analysedLeads.filter((l) => l.score >= QUALIFIED_THRESHOLD)

  const responses = leads
    .map((l) => l.firstResponseSec)
    .filter((v): v is number => typeof v === "number")

  const open = leads.filter((l) => l.stage !== "fechado")
  const closed = leads.filter((l) => l.stage === "fechado")

  const currentHour = Math.floor(now / HOUR) * HOUR
  const hourly: HourBucket[] = []
  for (let i = 23; i >= 0; i--) {
    const start = currentHour - i * HOUR
    const inBucket = last24.filter(
      (l) => l.createdAt >= start && l.createdAt < start + HOUR
    )
    hourly.push({
      label: `${String(new Date(start).getHours()).padStart(2, "0")}h`,
      total: inBucket.length,
      qualified: inBucket.filter((l) => l.ai && l.score >= QUALIFIED_THRESHOLD).length,
    })
  }

  const funnel = STAGES.map((s, i) => {
    const inStage = leads.filter((l) => l.stage === s.id)
    const reached = leads.filter((l) => STAGE_ORDER.indexOf(l.stage) >= i).length
    return {
      stage: s.id,
      label: s.label,
      count: inStage.length,
      value: inStage.reduce((sum, l) => sum + l.value, 0),
      reached,
    }
  })

  const channels = CHANNELS.map((channel) => ({
    channel,
    count: last24.filter((l) => l.channel === channel).length,
  }))

  const team = REPS.map((rep) => {
    const mine = open.filter((l) => l.ownerId === rep.id)
    return {
      repId: rep.id,
      open: mine.length,
      value: mine.reduce((sum, l) => sum + l.value, 0),
      hot: mine.filter((l) => l.ai && l.temperature === "quente").length,
    }
  })

  return {
    leads24h: last24.length,
    leadsLastHour: leads.filter((l) => l.createdAt >= now - HOUR).length,
    analysed: analysedLeads.length,
    qualified: qualified.length,
    qualificationRate: analysedLeads.length
      ? qualified.length / analysedLeads.length
      : 0,
    avgFirstResponse: responses.length
      ? responses.reduce((a, b) => a + b, 0) / responses.length
      : null,
    openCount: open.length,
    pipelineValue: open.reduce((sum, l) => sum + l.value, 0),
    closedValue: closed.reduce((sum, l) => sum + l.value, 0),
    closedCount: closed.length,
    hotOpen: open.filter((l) => l.ai && l.temperature === "quente").length,
    hourly,
    funnel,
    channels,
    team,
  }
}

/** Métricas do dashboard, recalculadas quando os leads mudam ou a cada minuto. */
export function useMetrics(now: number): Metrics {
  const leads = useCrm((s) => s.leads)
  const minute = Math.floor(now / 60_000)
  return React.useMemo(
    () => computeMetrics(leads, minute * 60_000),
    [leads, minute]
  )
}
