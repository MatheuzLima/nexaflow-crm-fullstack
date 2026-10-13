import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ContactForm } from "@/components/crm/contact-form"
import { useCrm } from "@/lib/crm/store"

export function NewContactDialog() {
  const open = useCrm((s) => s.newContactOpen)
  const setOpen = useCrm((s) => s.setNewContactOpen)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Simular novo contato</DialogTitle>
          <DialogDescription>
            Escreva uma mensagem como um cliente enviaria. O agente lê o texto,
            extrai os dados, dá a nota e roteia para o vendedor certo.
          </DialogDescription>
        </DialogHeader>
        <ContactForm onSent={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
