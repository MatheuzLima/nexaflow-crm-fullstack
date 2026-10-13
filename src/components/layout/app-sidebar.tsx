import * as React from "react"
import {
  ArrowUpRight,
  Bot,
  EllipsisVertical,
  Kanban,
  LayoutDashboard,
  RotateCcw,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "cn"

import { NexaLogo } from "@/components/crm/brand"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { useCrm } from "@/lib/crm/store"

const NAV: { title: string; url: string; icon: LucideIcon; badge?: "novos" }[] = [
  { title: "Visão geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Leads", url: "/leads", icon: Users, badge: "novos" },
  { title: "Automações", url: "/automacoes", icon: Workflow },
]

const PORTFOLIO_URL = "https://website.matheuslima.site"

function AgentStatus() {
  const live = useCrm((s) => s.live)
  const qualifyOn = useCrm((s) => s.flows.find((f) => f.id === "qualify")?.enabled ?? false)
  const runs = useCrm((s) => s.flows.find((f) => f.id === "qualify")?.runs ?? 0)
  const online = qualifyOn

  return (
    <div className="rounded-xl border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Bot className="size-4 text-primary" />
        Agente de IA
        <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
          <span
            className={cn(
              "relative size-1.5 rounded-full",
              online ? "bg-emerald-500" : "bg-amber-500",
              online && live && "live-dot"
            )}
          />
          {online ? "online" : "pausado"}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {online
          ? `${runs.toLocaleString("pt-BR")} contatos qualificados automaticamente.`
          : "Qualificação desligada. Os contatos chegam sem análise."}
      </p>
    </div>
  )
}

function NavUser() {
  const { isMobile } = useSidebar()
  const reset = useCrm((s) => s.reset)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
              ML
            </span>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Matheus Lima</span>
              <span className="truncate text-xs text-muted-foreground">
                Administrador (demo)
              </span>
            </div>
            <EllipsisVertical className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Demonstração com dados fictícios
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  reset()
                  toast.add({ title: "Demonstração reiniciada", type: "success", timeout: 2500 })
                }}
              >
                <RotateCcw />
                Reiniciar demonstração
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                render={<a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" />}
              >
                <ArrowUpRight />
                Voltar ao portfólio
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const newCount = useCrm((s) => s.leads.filter((l) => l.stage === "novo").length)

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <NexaLogo size={32} className="shrink-0" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-base font-semibold tracking-tight">
                  NexaFlow
                </span>
                <span className="truncate text-xs text-muted-foreground">CRM &amp; Ops</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={pathname === item.url}
                  render={<Link to={item.url} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {item.badge === "novos" && newCount > 0 && (
                  <SidebarMenuBadge>{newCount}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3">
        <AgentStatus />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
