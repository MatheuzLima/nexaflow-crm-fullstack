import * as React from "react"
import { Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCrm } from "@/lib/crm/store"

const KEY = "nexaflow-demo-banner-dismissed"

function readDismissed() {
  try {
    return localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

export function DemoBanner() {
  const [hidden, setHidden] = React.useState(readDismissed)
  const setNewContactOpen = useCrm((s) => s.setNewContactOpen)

  if (hidden) return null

  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem(KEY, "1")
    } catch {
      /* sem armazenamento: o aviso só reaparece no próximo acesso */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm">
      <Sparkles className="size-4 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 basis-64 leading-relaxed">
        <b>Demonstração interativa.</b> Os contatos chegam sozinhos, mas você
        pode escrever o seu: o agente de IA lê a mensagem, dá a nota e roteia
        para o vendedor certo em segundos.
      </p>
      <Button size="sm" onClick={() => setNewContactOpen(true)}>
        Simular um contato
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={dismiss} aria-label="Dispensar aviso">
        <X />
      </Button>
    </div>
  )
}
