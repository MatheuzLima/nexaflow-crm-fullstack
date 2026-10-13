import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { routes } from "@/routes"

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nexaflow-theme">
      <Toaster>
        <RouterProvider router={router} />
      </Toaster>
    </ThemeProvider>
  )
}
