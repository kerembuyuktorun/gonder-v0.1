"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { KargoStatusDistribution } from "../_types/kargo-dashboard"

interface Props {
  data: KargoStatusDistribution[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: KargoStatusDistribution }> }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-slate-900">{item.name}</p>
      <p className="text-sm text-slate-600">{item.value.toLocaleString("tr-TR")} kargo</p>
    </div>
  )
}

export function KargoStatusChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Kargo Durum Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-0 lg:flex-row">
        <div className="relative size-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight">{total.toLocaleString("tr-TR")}</span>
            <span className="text-xs text-muted-foreground">Toplam</span>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2.5">
          {data.map((item) => {
            const pct = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium tabular-nums text-slate-900">{pct}%</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
