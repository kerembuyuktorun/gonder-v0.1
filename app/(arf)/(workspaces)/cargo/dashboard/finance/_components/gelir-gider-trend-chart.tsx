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
  Legend,
} from "recharts"
import type { GelirGiderTrend } from "../_types/finans-dashboard"

interface Props {
  data: GelirGiderTrend[]
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `₺${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₺${(value / 1_000).toFixed(0)}K`
  return `₺${value}`
}

export function GelirGiderTrendChart({ data }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Gelir & Gider Trendi
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `₺${value.toLocaleString("tr-TR")}`,
                  name === "gelir" ? "Gelir" : "Gider",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="circle"
                iconSize={8}
                formatter={(v: string) =>
                  v === "gelir" ? "Gelir" : "Gider"
                }
              />
              <Bar
                dataKey="gelir"
                fill="#a3e635"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="gider"
                fill="#f87171"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
