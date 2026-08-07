"use client"

import { useState } from "react"
import Link from "next/link"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  ChevronDown,
  Eye,
  GitBranch,
  Gauge,
  MapPin,
  MessageSquare,
  Power,
  Plus,
  PowerOff,
  Search,
  Share2,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { transferCenters, type TransferCenter } from "./_data/transfer-centers"

type ListStatus = Exclude<TransferCenter["status"], "maintenance">
type ListStatusFilter = ListStatus | "all"

const statusConfig: Record<ListStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  passive: { label: "Pasif", className: "bg-red-500/10 text-red-700 border-red-500/20" },
}

function normalizeStatus(status: TransferCenter["status"]): ListStatus {
  return status === "maintenance" ? "passive" : status
}

export default function TransferMerkezleriPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<ListStatusFilter>("all")

  const filtered = transferCenters.filter((tc) => {
    const normalizedStatus = normalizeStatus(tc.status)
    const matchSearch =
      tc.name.toLowerCase().includes(search.toLowerCase()) ||
      tc.code.toLowerCase().includes(search.toLowerCase()) ||
      tc.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || normalizedStatus === filterStatus
    return matchSearch && matchStatus
  })

  const filterLabels: Record<ListStatusFilter, string> = {
    all: "Tümü",
    active: "Aktif",
    passive: "Pasif",
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Ayarlar", href: "/arf/cargo/settings" },
          { label: "Transfer Merkezleri" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        {/* Header */}
        <div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Transfer Merkezleri</h1>
          </div>
        </div>

        {/* Arama & Filtre */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Merkez adı, kod veya şehir ara..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <Gauge className="size-4" />
                  {filterLabels[filterStatus]}
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {(["all", "active", "passive"] as const).map((val) => (
                  <DropdownMenuItem
                    key={val}
                    onClick={() => setFilterStatus(val)}
                    className={filterStatus === val ? "font-medium" : ""}
                  >
                    {filterLabels[val]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild className="h-9">
              <Link href="/arf/cargo/settings/transfer-centers/new">
                <Plus className="mr-2 size-4" />
                Transfer Merkezi Ekle
              </Link>
            </Button>
          </div>
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
              <Building2 className="size-10" />
              <p className="text-sm">Arama kriterlerine uygun merkez bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((tc) => {
              const normalizedStatus = normalizeStatus(tc.status)
              const isPassive = normalizedStatus === "passive"
              const cfg = statusConfig[normalizedStatus]

              return (
                <Card key={tc.id} className="group rounded-2xl border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    {/* Kart Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-slate-900">{tc.name}</h2>
                          <Badge variant="outline" className={cn("border text-xs", cfg.className)}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="size-3" />
                          {tc.district}, {tc.city}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2 shrink-0 border-slate-200 bg-slate-50 font-mono text-xs text-slate-600">
                        {tc.code}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Çalışma Saati</span>
                        <span className="font-medium text-slate-700">{tc.workingHours ?? "-"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Acente Sahibi</span>
                        <span className="font-medium text-slate-700">{tc.agencyOwner ?? "-"}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50 py-2">
                      <div className="flex flex-col items-center gap-0.5 px-2">
                        <Building2 className="size-3.5 text-slate-400" />
                        <span className="text-base font-bold text-slate-800">{tc.branches.length}</span>
                        <span className="text-[10px] text-slate-400">Şube</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 px-2">
                        <GitBranch className="size-3.5 text-slate-400" />
                        <span className="text-base font-bold text-slate-800">{tc.routes.length}</span>
                        <span className="text-[10px] text-slate-400">Hat</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 px-2">
                        <Users className="size-3.5 text-slate-400" />
                        <span className="text-base font-bold text-slate-800">{tc.users.length}</span>
                        <span className="text-[10px] text-slate-400">Kullanıcı</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 px-2">
                        <MessageSquare className="size-3.5 text-slate-400" />
                        <span className="text-base font-bold text-slate-800">{tc.notes.length}</span>
                        <span className="text-[10px] text-slate-400">Not</span>
                      </div>
                    </div>

                    {/* Alt bilgi + İşlemler */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Yönetici: {tc.managerName}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 rounded-lg px-2.5 text-xs">
                            İşlemler
                            <ChevronDown className="ml-1 size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>{tc.code} İşlemleri</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/arf/cargo/settings/transfer-centers/${tc.id}`}>
                              <Eye className="mr-2 size-4" />
                              Detay Görüntüle
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const detailUrl = `${window.location.origin}/arf/cargo/settings/transfer-centers/${tc.id}`
                              void navigator.clipboard.writeText(detailUrl)
                            }}
                          >
                            <Share2 className="mr-2 size-4" />
                            Paylaş
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(tc.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="mr-2 size-4" />
                              Konum
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-900 focus:text-slate-900">
                            {isPassive ? (
                              <Power className="mr-2 size-4" />
                            ) : (
                              <PowerOff className="mr-2 size-4" />
                            )}
                            {isPassive ? "Aktif Yap" : "Pasif Yap"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
