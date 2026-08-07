import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const benchmarkTargets = [
  {
    area: 'Cargo Dashboard',
    metric: 'LCP',
    target: '<= 2.5s',
    status: 'Takipte',
  },
  {
    area: 'DataTable Advanced',
    metric: 'Interaction Latency',
    target: '<= 100ms',
    status: 'Takipte',
  },
  {
    area: 'Form Wizard',
    metric: 'Re-render Count',
    target: 'Stable baseline',
    status: 'Takipte',
  },
]

export default function BenchmarksPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Test Hub', href: '/test' },
          { label: 'Performance Benchmarks' },
        ]}
        searchPlaceholder="Benchmark metriği ara..."
        notificationCount={0}
      />

      <main className="flex flex-1 flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Performans Benchmark Paneli</CardTitle>
            <CardDescription>
              Task2 boyunca takip edilecek temel performans hedefleri.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {benchmarkTargets.map((row) => (
              <div key={row.area} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{row.area}</p>
                  <p className="text-xs text-muted-foreground">{row.metric} hedefi: {row.target}</p>
                </div>
                <Badge variant="outline">{row.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
