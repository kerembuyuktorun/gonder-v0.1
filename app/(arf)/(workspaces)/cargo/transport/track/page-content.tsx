"use client"

import Link from "next/link"
import { type ChangeEvent, type KeyboardEvent, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Search,
  Truck,
} from "lucide-react"
import {
  mockTransportTrackRecords,
  type TransportTrackRecord,
  type TransportTrackStatus,
} from "./_mock/transport-track-mock-data"

/* ─── Durum Konfigürasyonu ─── */

const statusOrder: TransportTrackStatus[] = ["planlanmis", "yukleniyor", "yolda", "teslimatta", "teslim_edildi"]

const statusConfig: Record<
  TransportTrackStatus,
  {
    label: string
    badgeClass: string
    icon: React.ComponentType<{ className?: string }>
    progress: number
  }
> = {
  planlanmis: {
    label: "Planlanmış",
    badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
    icon: Clock,
    progress: 10,
  },
  yukleniyor: {
    label: "Yükleniyor",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Loader2,
    progress: 30,
  },
  yolda: {
    label: "Yolda",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Truck,
    progress: 60,
  },
  teslimatta: {
    label: "Teslimatta",
    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
    icon: Package,
    progress: 85,
  },
  teslim_edildi: {
    label: "Teslim Edildi",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
    progress: 100,
  },
}

/* ─── Yardımcılar ─── */

const normalizeTasimaNo = (value: string) => value.toUpperCase().replace(/\s+/g, "").trim()

/* ─── Sayfa Bileşeni ─── */

export default function TasimaSorgulaPage() {
  const searchParams = useSearchParams()
  const [tasimaNo, setTasimaNo] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<TransportTrackRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [recentQueries, setRecentQueries] = useState<string[]>([
    "TSM-20000001",
    "TSM-20000002",
    "TSM-20000003",
  ])

  const activeStatus = selectedRecord ? statusConfig[selectedRecord.status] : null
  const activeStepIndex = selectedRecord ? statusOrder.indexOf(selectedRecord.status) : -1

  const registerRecent = (query: string) => {
    setRecentQueries((current) => [query, ...current.filter((item) => item !== query)].slice(0, 30))
  }

  const handleSearch = (forcedQuery?: string) => {
    const rawQuery = (forcedQuery ?? tasimaNo).trim()

    if (!rawQuery) {
      setHasSearched(true)
      setSelectedRecord(null)
      setErrorMessage("Lütfen taşıma numarası girin.")
      return
    }

    const normalized = normalizeTasimaNo(rawQuery)
    setTasimaNo(normalized)
    setHasSearched(true)
    registerRecent(normalized)

    const found = mockTransportTrackRecords.find(
      (item) => normalizeTasimaNo(item.tasimaNo) === normalized,
    )

    if (!found) {
      setSelectedRecord(null)
      setErrorMessage("Kayıt bulunamadı. Taşıma numarasını kontrol edip tekrar deneyin.")
      return
    }

    setSelectedRecord(found)
    setErrorMessage("")
  }

  useEffect(() => {
    const query = searchParams.get("query")
    if (!query) return
    handleSearch(query)
  }, [searchParams])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Taşıma İşlemleri", href: "/arf/cargo/transport/list" },
          { label: "Taşıma Sorgula" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-3 lg:gap-5">
        {/* ─── Arama Kartı ─── */}
        <Card className="relative overflow-hidden rounded-[30px] border-slate-200 bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-secondary/10 blur-3xl" />

          <CardContent className="relative p-6 lg:p-7">
            <div className="grid gap-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Taşıma Sorgula</h1>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Örn: TSM-20000001"
                        value={tasimaNo}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setTasimaNo(event.target.value)}
                        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                          if (event.key === "Enter") {
                            handleSearch()
                          }
                        }}
                        className="h-11 rounded-2xl border-slate-200 bg-white pl-10"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleSearch()} className="h-11 rounded-2xl px-5 text-sm font-semibold">
                        <Search className="size-4" />
                        Sorgula
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTasimaNo("")
                          setHasSearched(false)
                          setErrorMessage("")
                          setSelectedRecord(null)
                        }}
                        className="h-11 rounded-2xl px-5 text-sm font-semibold"
                      >
                        Temizle
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium tracking-wide text-slate-500">Son Sorgular</p>
                    <div className="max-h-10 overflow-hidden">
                      <div className="flex flex-wrap gap-2">
                        {recentQueries.map((item) => (
                          <Button
                            key={item}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-xl border-slate-200 bg-slate-50 px-5 text-slate-600 hover:bg-slate-100"
                            onClick={() => {
                              setTasimaNo(item)
                              handleSearch(item)
                            }}
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Hata ─── */}
        {hasSearched && !selectedRecord && (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50/70 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="mt-0.5 size-5 text-rose-600" />
              <div>
                <p className="text-sm font-semibold text-rose-700">Sorgu Sonucu Bulunamadı</p>
                <p className="mt-1 text-sm text-rose-700/90">{errorMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Boş durum ─── */}
        {!hasSearched && (
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-800">Detay alanı</p>
                  <p className="text-sm text-slate-500">Taşıma numarasını yazarak sorgu yapabilir ve detayları inceleyebilirsiniz.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Sonuç ─── */}
        {selectedRecord && activeStatus && (
          <>
            {/* Durum + Progress */}
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-[22px] font-semibold tracking-tight text-slate-900">{selectedRecord.tasimaNo}</CardTitle>
                    <CardDescription className="mt-1 text-sm text-slate-500">Tahmini Teslim: {selectedRecord.eta}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("rounded-xl border px-3 py-1.5 text-sm font-medium", selectedRecord.gonderiTipi === "FTL" ? "bg-violet-500/10 text-violet-600 border-violet-500/20" : "bg-sky-500/10 text-sky-600 border-sky-500/20")}>
                      {selectedRecord.gonderiTipi}
                    </Badge>
                    <Badge className={cn("rounded-xl border px-3 py-1.5 text-sm font-medium", activeStatus.badgeClass)}>
                      {activeStatus.label}
                    </Badge>
                    <Button asChild variant="outline" className="h-9 rounded-xl px-4 text-sm font-semibold">
                      <Link href={`/arf/cargo/transport/${selectedRecord.tasimaNo}`}>Taşıma Detayına Git</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-secondary/85 transition-all duration-500" style={{ width: `${activeStatus.progress}%` }} />
                </div>

                <div className="grid gap-2 sm:grid-cols-5">
                  {statusOrder.map((step, index) => {
                    const config = statusConfig[step]
                    const Icon = config.icon
                    const isPassed = activeStepIndex >= index
                    return (
                      <div
                        key={step}
                        className={cn(
                          "rounded-2xl border p-3 transition",
                          isPassed ? "border-secondary/25 bg-secondary/10" : "border-border bg-muted/50",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", isPassed ? "text-secondary" : "text-muted-foreground")} />
                          <span className={cn("text-xs font-medium", isPassed ? "text-secondary" : "text-muted-foreground")}>{config.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
