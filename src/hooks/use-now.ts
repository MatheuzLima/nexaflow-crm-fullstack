import * as React from "react"

/** Devolve `Date.now()` atualizado a cada `intervalMs` (para "há 12 s", "há 3 min"…). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
