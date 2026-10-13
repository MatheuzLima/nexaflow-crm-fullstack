import type { Lead, Rep, Service } from "./types"

export const REPS: Rep[] = [
  {
    id: "r1",
    name: "Camila Rocha",
    role: "Executiva de contas",
    hue: 285,
    services: ["Frete rodoviário", "Comércio exterior"],
  },
  {
    id: "r2",
    name: "Bruno Tavares",
    role: "Executivo de contas",
    hue: 205,
    services: ["Armazenagem", "Logística reversa"],
  },
  {
    id: "r3",
    name: "Larissa Mendes",
    role: "Executiva de contas",
    hue: 335,
    services: ["Last mile", "Carga refrigerada"],
  },
  {
    id: "r4",
    name: "Rafael Duarte",
    role: "Executivo de contas",
    hue: 150,
    services: ["Frete rodoviário", "Armazenagem"],
  },
  {
    id: "r5",
    name: "Juliana Prado",
    role: "Executiva sênior",
    hue: 60,
    services: ["Carga refrigerada", "Comércio exterior", "Last mile"],
  },
]

export const repById = (id: string): Rep | undefined =>
  REPS.find((r) => r.id === id)

/** Quantidade de negócios em aberto por responsável. */
export function openLoad(leads: Lead[]): Record<string, number> {
  const load: Record<string, number> = {}
  for (const lead of leads) {
    if (lead.stage === "fechado" || !lead.ownerId) continue
    load[lead.ownerId] = (load[lead.ownerId] ?? 0) + 1
  }
  return load
}

/**
 * Roteamento: entre quem atende o serviço, escolhe o responsável com menos
 * negócios em aberto (empate resolvido ao acaso).
 */
export function pickRep(
  service: Service,
  load: Record<string, number>,
  rng: () => number = Math.random
): Rep {
  const specialists = REPS.filter((r) => r.services.includes(service))
  const pool = specialists.length ? specialists : REPS
  const min = Math.min(...pool.map((r) => load[r.id] ?? 0))
  const lightest = pool.filter((r) => (load[r.id] ?? 0) === min)
  return lightest[Math.floor(rng() * lightest.length)]
}
