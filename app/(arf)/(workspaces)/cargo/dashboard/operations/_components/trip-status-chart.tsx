"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { TripStatusDistribution } from "../_types/operasyon-dashboard"

interface Props {
  data: TripStatusDistribution[]
}

export function TripStatusChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Sefer Durumu Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-6 pb-6">
        <div className="relative size-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((d) => (
                  <Cell key={d.status} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} sefer`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{total}</span>
            <span className="text-xs text-muted-foreground">Toplam</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm text-muted-foreground">{d.label}</span>
              <span className="ml-auto text-sm font-medium">{d.count}</span>
              <span className="text-xs text-muted-foreground">
                ({((d.count / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
