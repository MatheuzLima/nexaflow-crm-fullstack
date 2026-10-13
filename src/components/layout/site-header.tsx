import * as React from "react"
import { Pause, Play, Plus } from "lucide-react"
import { useLocation } from "react-router-dom"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandMenu, SearchTrigger } from "@/components/layout/command-menu"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { useCrm } from "@/lib/crm/store"

const TITLES: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/pipeline": "Pipeline de vendas",
  "/leads": "Leads",
  "/automacoes": "Automações e integrações",
}

export function LiveToggle() {
  const live = useCrm((s) => s.live)
  const setLive = useCrm((s) => s.setLive)

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLive(!live)}
      aria-pressed={live}
      title={live ? "Pausar a chegada de contatos simulados" : "Retomar contatos em tempo real"}
    >
      <span
        className={cn(
          "relative size-2 rounded-full",
          live ? "live-dot bg-emerald-500" : "bg-muted-foreground/50"
        )}
      />
      <span className="hidden sm:inline">{live ? "Ao vivo" : "Pausado"}</span>
      {live ? <Pause className="hidden sm:block" /> : <Play className="hidden sm:block" />}
    </Button>
  )
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const setNewContactOpen = useCrm((s) => s.setNewContactOpen)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 data-vertical:h-4 data-vertical:self-center" />
        <h1 className="truncate text-sm font-semibold sm:text-base">
          {TITLES[pathname] ?? "NexaFlow"}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger onClick={() => setSearchOpen(true)} />
          <LiveToggle />
          <Button size="sm" onClick={() => setNewContactOpen(true)}>
            <Plus data-icon="inline-start" />
            <span className="hidden sm:inline">Novo contato</span>
            <span className="sm:hidden">Novo</span>
          </Button>
          <ModeToggle />
        </div>
      </header>
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
