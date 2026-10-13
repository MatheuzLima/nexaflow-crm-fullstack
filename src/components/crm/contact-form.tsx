import * as React from "react"
import { Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useCrm } from "@/lib/crm/store"
import { CHANNELS, type Channel } from "@/lib/crm/types"

const EXAMPLES = [
  {
    label: "Alta intenção",
    text: "Olá! Preciso de cotação de frete de Campinas para Curitiba, cerca de 24 paletes por semana. Seria contrato mensal e preciso começar na próxima semana. Tenho orçamento aprovado.",
  },
  {
    label: "Urgente",
    text: "Bom dia, vocês têm baú refrigerado? Urgente: tenho 8 toneladas de congelados saindo hoje de Goiânia para Salvador.",
  },
  {
    label: "Só pesquisando",
    text: "Oi, só estou pesquisando preços de frete, sem previsão de contratar agora.",
  },
]

const CHANNEL_ITEMS = Object.fromEntries(CHANNELS.map((c) => [c, c]))

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
      {label}
      {children}
    </label>
  )
}

export function ContactForm({
  onSent,
  showPayload = false,
}: {
  onSent?: () => void
  showPayload?: boolean
}) {
  const ingest = useCrm((s) => s.ingest)
  const [channel, setChannel] = React.useState<Channel>("WhatsApp")
  const [name, setName] = React.useState("Marcos Pereira")
  const [company, setCompany] = React.useState("Distribuidora Serra Azul")
  const [role, setRole] = React.useState("Gerente de Logística")
  const [message, setMessage] = React.useState(EXAMPLES[0].text)

  const payload = JSON.stringify(
    {
      source: channel.toLowerCase().replace("-", ""),
      contact: { name, company, role },
      message,
    },
    null,
    2
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    ingest({ name, company, role, channel, message })
    toast.add({
      title: "Contato enviado ao agente de IA",
      description: "Acompanhe a qualificação no feed ao vivo do dashboard.",
      type: "info",
      timeout: 4000,
    })
    onSent?.()
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Empresa">
          <Input value={company} onChange={(e) => setCompany(e.target.value)} />
        </Field>
        <Field label="Cargo">
          <Input value={role} onChange={(e) => setRole(e.target.value)} />
        </Field>
        <Field label="Canal de entrada">
          <Select
            items={CHANNEL_ITEMS}
            value={channel}
            onValueChange={(v) => v && setChannel(v as Channel)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Mensagem do contato
          </span>
          <div className="flex flex-wrap gap-1">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex.label}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setMessage(ex.text)}
              >
                {ex.label}
              </Button>
            ))}
          </div>
        </div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="min-h-28 resize-y"
          placeholder="Digite como um cliente escreveria no WhatsApp…"
        />
      </div>

      {showPayload && (
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Payload enviado ao webhook
          </span>
          <pre className="thin-scroll max-h-44 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed">
            <span className="text-muted-foreground">
              POST /api/webhooks/leads
              {"\n"}
            </span>
            {payload}
          </pre>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          A nota, a intenção e o responsável são definidos pelo agente.
        </p>
        <Button type="submit" disabled={!message.trim()}>
          <Send data-icon="inline-start" />
          Enviar ao agente
        </Button>
      </div>
    </form>
  )
}
