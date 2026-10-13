import { ActivityCard } from "@/components/dashboard/activity-card"
import { ChannelCard } from "@/components/dashboard/channel-card"
import { FunnelCard } from "@/components/dashboard/funnel-card"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { LeadsChart } from "@/components/dashboard/leads-chart"
import { LiveFeed } from "@/components/dashboard/live-feed"
import { TeamCard } from "@/components/dashboard/team-card"
import { DemoBanner } from "@/components/crm/demo-banner"
import { useNow } from "@/hooks/use-now"
import { useMetrics } from "@/lib/crm/metrics"

export default function DashboardPage() {
  const now = useNow(15_000)
  const m = useMetrics(now)

  return (
    <div className="grid gap-4 p-4 lg:p-6">
      <DemoBanner />
      <KpiCards m={m} />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="grid content-start gap-4 xl:col-span-8">
          <LeadsChart data={m.hourly} />
          <div className="grid gap-4 lg:grid-cols-2">
            <FunnelCard funnel={m.funnel} />
            <ChannelCard channels={m.channels} />
          </div>
        </div>
        <div className="xl:col-span-4">
          <LiveFeed />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamCard team={m.team} />
        <ActivityCard />
      </div>
    </div>
  )
}
