const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
})

export const formatBRL = (value: number) => brl.format(value)
export const formatBRLCompact = (value: number) => brlCompact.format(value)

/** "agora", "há 12 s", "há 5 min", "há 3 h", "há 2 d" */
export function timeAgo(ts: number, now: number = Date.now()): string {
  const sec = Math.max(0, Math.round((now - ts) / 1000))
  if (sec < 5) return "agora"
  if (sec < 60) return `há ${sec} s`
  const min = Math.round(sec / 60)
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.round(h / 24)} d`
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return s ? `${m}min ${s}s` : `${m}min`
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}
