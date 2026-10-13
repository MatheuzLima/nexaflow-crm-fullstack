import { cn } from "cn"

import { initials } from "@/lib/crm/format"
import { repById } from "@/lib/crm/reps"

export function RepAvatar({
  repId,
  size = 24,
  className,
}: {
  repId: string
  size?: number
  className?: string
}) {
  const rep = repById(repId)
  if (!rep) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground",
          className
        )}
        style={{ width: size, height: size }}
        title="Sem responsável"
      >
        ?
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.4),
        background: `oklch(0.58 0.14 ${rep.hue})`,
      }}
      title={rep.name}
    >
      {initials(rep.name)}
    </span>
  )
}
