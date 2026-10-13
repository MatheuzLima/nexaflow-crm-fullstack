import * as React from "react"
import { Outlet } from "react-router-dom"

import { LeadDrawer } from "@/components/crm/lead-drawer"
import { NewContactDialog } from "@/components/crm/new-contact-dialog"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useLiveSimulation } from "@/hooks/use-live-simulation"

function SiteFooter() {
  return (
    <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground lg:px-6">
      NexaFlow CRM &amp; Ops · Demonstração com dados fictícios e simulados ·
      Desenvolvido por{" "}
      <a
        href="https://website.matheuslima.site"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Matheus Lima
      </a>
    </footer>
  )
}

export function AppLayout() {
  useLiveSimulation()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15.5rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" collapsible="icon" />
      <SidebarInset className="app-glow min-w-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
        <SiteFooter />
      </SidebarInset>
      <LeadDrawer />
      <NewContactDialog />
    </SidebarProvider>
  )
}
