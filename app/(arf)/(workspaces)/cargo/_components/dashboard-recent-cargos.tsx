"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { RecentCargo } from "../_types/dashboard"

const statusConfig: Record<string, { label: string; className: string }> = {
  beklemede: { label: "Beklemede", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  teslim_alindi: { label: "Teslim Alındı", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  transfer: { label: "Transfer", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  iptal: { label: "İptal", className: "bg-red-500/10 text-red-500 border-red-500/20" },
}

interface Props {
  cargos: RecentCargo[]
}

export function DashboardRecentCargos({ cargos }: Props) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-medium">Son Kargolar</CardTitle>
          <CardDescription className="text-sm">Son eklenen kargoların durumu</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/arf/cargo/shipments" className="gap-1">
            Tümü
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {cargos.map((cargo) => {
            const st = statusConfig[cargo.status]
            return (
              <div key={cargo.id} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Link href={`/arf/cargo/shipments/${cargo.id}`} className="text-sm font-medium hover:underline">
                      {cargo.id}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {cargo.customer} · {cargo.destination}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={st?.className}>
                    {st?.label}
                  </Badge>
                  <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                    <Clock className="size-3" />
                    {cargo.time}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
