import {
  Globe,
  Handshake,
  Mail,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react"

import type { Channel } from "@/lib/crm/types"

const ICONS: Record<Channel, LucideIcon> = {
  WhatsApp: MessageCircle,
  Site: Globe,
  "E-mail": Mail,
  Telefone: Phone,
  Indicação: Handshake,
}

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel
  className?: string
}) {
  const Icon = ICONS[channel]
  return <Icon className={className} aria-label={channel} />
}
