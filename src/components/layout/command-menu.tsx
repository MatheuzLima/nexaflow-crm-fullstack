import { useNavigate } from "react-router-dom"
import {
  Kanban,
  LayoutDashboard,
  Plus,
  Search,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { ScoreChip } from "@/components/crm/badges"
import { useCrm } from "@/lib/crm/store"

const PAGES: { title: string; url: string; icon: LucideIcon }[] = [
  { title: "Visão geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline de vendas", url: "/pipeline", icon: Kanban },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Automações e integrações", url: "/automacoes", icon: Workflow },
]

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const leads = useCrm((s) => s.leads)
  const selectLead = useCrm((s) => s.selectLead)
  const setNewContactOpen = useCrm((s) => s.setNewContactOpen)

  const close = () => onOpenChange(false)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Busca rápida"
      description="Navegue pelas páginas ou encontre um lead"
      className="sm:max-w-[600px]"
    >
      <Command>
        <CommandInput placeholder="Buscar página, empresa ou contato…" autoFocus />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>Nada encontrado.</CommandEmpty>

          <CommandGroup heading="Ações">
            <CommandItem
              value="simular novo contato"
              onSelect={() => {
                close()
                setNewContactOpen(true)
              }}
            >
              <Plus />
              Simular novo contato
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Páginas">
            {PAGES.map(({ title, url, icon: Icon }) => (
              <CommandItem
                key={url}
                value={title}
                onSelect={() => {
                  navigate(url)
                  close()
                }}
              >
                <Icon />
                {title}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Leads recentes">
            {leads.slice(0, 40).map((lead) => (
              <CommandItem
                key={lead.id}
                value={`${lead.company} ${lead.name} ${lead.service} ${lead.id}`}
                onSelect={() => {
                  close()
                  selectLead(lead.id)
                }}
              >
                <Users />
                <span className="truncate">{lead.company}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {lead.name} · {lead.service}
                </span>
                {lead.ai && <ScoreChip score={lead.score} className="ml-auto" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="relative hidden w-56 justify-start pr-12 font-normal text-muted-foreground lg:flex"
      >
        <Search data-icon="inline-start" />
        Buscar…
        <Kbd className="absolute top-1/2 right-1.5 -translate-y-1/2">Ctrl K</Kbd>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        className="lg:hidden"
        aria-label="Buscar"
      >
        <Search />
      </Button>
    </>
  )
}
