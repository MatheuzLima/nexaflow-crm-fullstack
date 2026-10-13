import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = React.useMemo(
    () =>
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
    [theme]
  )

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
