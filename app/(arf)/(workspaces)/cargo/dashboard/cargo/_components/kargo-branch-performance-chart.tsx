"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts"
import type { BranchPerformance } from "../_types/kargo-dashboard"

interface Props {
  data: BranchPerformance[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: BranchPerformance }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-slate-900">{d.branchName}</p>
      <p className="text-sm text-slate-600">Kargo: {d.kargoSayisi.toLocaleString("tr-TR")}</p>
      <p className="text-sm text-slate-600">Teslim: {d.teslimSayisi.toLocaleString("tr-TR")}</p>
      <p className="text-sm font-medium text-emerald-600">Oran: %{d.teslimatOrani}</p>
    </div>
  )
}

function getBarColor(oran: number): string {
  if (oran >= 92) return "#10b981"
  if (oran >= 89) return "#3b82f6"
  return "#f59e0b"
}

export function KargoBranchPerformanceChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.kargoSayisi - a.kargoSayisi)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Şube Performansı</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="branchName"
                tick={{ fontSize: 12, fill: "#334155" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="kargoSayisi" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {sorted.map((entry) => (
                  <Cell key={entry.branchName} fill={getBarColor(entry.teslimatOrani)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
