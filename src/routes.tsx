import type { ComponentType } from "react"
import { Navigate, type RouteObject } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

/** Cada página é carregada sob demanda (code-splitting). */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

function Fallback() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    HydrateFallback: Fallback,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", lazy: page(() => import("@/pages/dashboard")) },
      { path: "/pipeline", lazy: page(() => import("@/pages/pipeline")) },
      { path: "/leads", lazy: page(() => import("@/pages/leads")) },
      { path: "/automacoes", lazy: page(() => import("@/pages/automations")) },
      { path: "*", lazy: page(() => import("@/pages/not-found")) },
    ],
  },
]
