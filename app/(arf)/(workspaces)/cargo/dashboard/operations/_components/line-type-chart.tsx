"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { LineTypeDistribution } from "../_types/operasyon-dashboard"

interface Props {
  data: LineTypeDistribution[]
}

export function LineTypeChart({ data }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Hat Tipi Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="label"
                width={90}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number) => [`${value} hat`]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((d) => (
                  <Cell key={d.type} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          {data.map((d) => (
            <div key={d.type} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <span className="text-xs font-medium">{d.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
