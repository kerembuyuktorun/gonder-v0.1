"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { SupplierTypeDistribution } from "../_types/operasyon-dashboard"

interface Props {
  data: SupplierTypeDistribution[]
}

export function SupplierTypeChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Tedarikçi Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-6">
        <div className="size-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={75}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((d) => (
                  <Cell key={d.type} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} firma`,
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
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {data.map((d) => (
            <div key={d.type} className="flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <span className="text-xs font-medium">
                {d.count} ({((d.count / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
