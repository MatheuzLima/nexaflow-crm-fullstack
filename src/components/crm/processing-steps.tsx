import { Check, Loader2 } from "lucide-react"
import { cn } from "cn"

export const PIPELINE_STEPS = [
  "Webhook recebido",
  "Extraindo dados da mensagem",
  "Qualificando com IA",
  "Roteando para o vendedor",
]

/** Etapas do pipeline de automação (0–3 em andamento, 4 = concluído). */
export function ProcessingSteps({
  step,
  className,
}: {
  step: number
  className?: string
}) {
  return (
    <ol className={cn("grid gap-2", className)}>
      {PIPELINE_STEPS.map((label, i) => {
        const done = i < step
        const current = i === step
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2.5 text-sm transition-colors",
              done && "text-foreground",
              current && "font-medium text-primary",
              !done && !current && "text-muted-foreground/60"
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border",
                done && "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
                current && "border-primary/40 bg-primary/10"
              )}
            >
              {done ? (
                <Check className="size-3" />
              ) : current ? (
                <Loader2 className="size-3 animate-spin" />
              ) : null}
            </span>
            {label}
          </li>
        )
      })}
    </ol>
  )
}
