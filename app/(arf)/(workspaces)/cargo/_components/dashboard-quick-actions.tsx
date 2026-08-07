"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { SystemStatus } from "../_types/dashboard"

const quickActions = [
  { title: "Yeni Kargo", description: "Hızlı kargo oluştur", href: "/arf/cargo/shipments/new", icon: Plus },
  { title: "Kargo Sorgula", description: "Takip numarası ile ara", href: "/arf/cargo/shipments/track", icon: Package },
]

const statusDotClass: Record<string, string> = {
  active: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
}
const statusLabel: Record<string, string> = {
  active: "Aktif",
  warning: "Uyarı",
  error: "Hata",
}

interface Props {
  systemStatuses: SystemStatus[]
}

export function DashboardQuickActions({ systemStatuses }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Hızlı İşlemler</CardTitle>
          <CardDescription className="text-sm">Sık kullanılan işlemler</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-muted/50"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
                <action.icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Sistem Durumu</CardTitle>
          <CardDescription className="text-sm">Anlık sistem bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemStatuses.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full animate-pulse ${statusDotClass[s.status]}`} />
                <span className="text-sm">{s.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{statusLabel[s.status]}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
