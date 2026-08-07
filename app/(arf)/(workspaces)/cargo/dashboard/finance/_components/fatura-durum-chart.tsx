"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { FaturaDurumDistribution } from "../_types/finans-dashboard"

interface Props {
  data: FaturaDurumDistribution[]
}

function formatMoney(value: number) {
  return `₺${value.toLocaleString("tr-TR")}`
}

export function FaturaDurumChart({ data }: Props) {
  const totalAmount = data.reduce((s, d) => s + d.amount, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Fatura Durumu Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-6 pb-6">
        <div className="relative size-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
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
                  formatMoney(value),
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
            <span className="text-lg font-semibold">
              {formatMoney(totalAmount)}
            </span>
            <span className="text-xs text-muted-foreground">Toplam</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm text-muted-foreground">{d.label}</span>
              <span className="ml-auto text-sm font-medium">
                {formatMoney(d.amount)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({d.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
