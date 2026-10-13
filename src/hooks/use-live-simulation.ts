import * as React from "react"

import { useCrm } from "@/lib/crm/store"

/**
 * Simula contatos chegando por webhook enquanto o modo "ao vivo" está ligado.
 * Deve ser montado uma única vez (no layout do app).
 */
export function useLiveSimulation() {
  const live = useCrm((s) => s.live)

  React.useEffect(() => {
    if (!live) return

    let timer = 0
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (!document.hidden) {
          const { simulateRandom, followUpTick } = useCrm.getState()
          simulateRandom()
          if (Math.random() < 0.3) followUpTick()
        }
        schedule(6500 + Math.random() * 6500)
      }, delay)
    }

    schedule(3000)
    return () => window.clearTimeout(timer)
  }, [live])
}
