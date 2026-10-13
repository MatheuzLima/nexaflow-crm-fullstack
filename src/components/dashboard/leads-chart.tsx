import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { HourBucket } from "@/lib/crm/metrics"

const config = {
  total: { label: "Contatos recebidos", color: "var(--chart-1)" },
  qualified: { label: "Qualificados pela IA", color: "var(--chart-2)" },
} satisfies ChartConfig

export function LeadsChart({ data }: { data: HourBucket[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos por hora</CardTitle>
        <CardDescription>Últimas 24 horas, atualizado em tempo real</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <ChartContainer config={config} className="aspect-auto h-[230px] w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="fillQualified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-qualified)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--color-qualified)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={2}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="total"
              type="monotone"
              fill="url(#fillTotal)"
              stroke="var(--color-total)"
              strokeWidth={2}
            />
            <Area
              dataKey="qualified"
              type="monotone"
              fill="url(#fillQualified)"
              stroke="var(--color-qualified)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
