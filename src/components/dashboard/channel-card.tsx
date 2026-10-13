import { Cell, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Metrics } from "@/lib/crm/metrics"
import type { Channel } from "@/lib/crm/types"

const KEYS: Record<Channel, { key: string; color: string }> = {
  WhatsApp: { key: "whatsapp", color: "var(--chart-2)" },
  Site: { key: "site", color: "var(--chart-1)" },
  "E-mail": { key: "email", color: "var(--chart-3)" },
  Telefone: { key: "telefone", color: "var(--chart-5)" },
  Indicação: { key: "indicacao", color: "var(--chart-4)" },
}

const config = Object.fromEntries(
  (Object.entries(KEYS) as [Channel, { key: string; color: string }][]).map(
    ([label, { key, color }]) => [key, { label, color }]
  )
) satisfies ChartConfig

export function ChannelCard({ channels }: { channels: Metrics["channels"] }) {
  const total = channels.reduce((s, c) => s + c.count, 0) || 1
  const data = channels.map((c) => ({
    key: KEYS[c.channel].key,
    count: c.count,
    fill: `var(--color-${KEYS[c.channel].key})`,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Origem dos contatos</CardTitle>
        <CardDescription>Por canal de entrada, últimas 24 h</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <ChartContainer config={config} className="aspect-square h-[150px] shrink-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="key"
              innerRadius={44}
              outerRadius={68}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="grid min-w-0 flex-1 gap-2 text-sm">
          {channels.map((c) => (
            <li key={c.channel} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: KEYS[c.channel].color }}
              />
              <span className="truncate">{c.channel}</span>
              <span className="tabular ml-auto text-muted-foreground">
                {c.count} · {Math.round((c.count / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
