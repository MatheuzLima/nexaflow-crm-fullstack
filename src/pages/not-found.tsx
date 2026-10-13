import { Compass } from "lucide-react"
import { Link } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Compass className="size-7" />
      </span>
      <div>
        <h2 className="text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O endereço que você abriu não existe nesta demonstração.
        </p>
      </div>
      <Link to="/dashboard" className={buttonVariants()}>
        Voltar à visão geral
      </Link>
    </div>
  )
}
