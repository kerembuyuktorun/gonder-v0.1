"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { findTasimaDetay } from "./_mock/transport-detail-mock-data"
import { TabGeneralInfo } from "./_components/tab-general-info"
import { TabTransportStatus } from "./_components/tab-transport-status"
import { TabFinance } from "./_components/tab-finance"
import { TabOffers } from "./_components/tab-offers"

/* ─── Status Badge Config ─── */

const statusBadgeConfig: Record<string, string> = {
  tasima_olusturuldu: "border-slate-200 bg-slate-100 text-slate-700",
  surucu_atandi: "border-emerald-200 bg-emerald-50 text-emerald-700",
  surucu_alim_adresine_gidiyor: "border-blue-200 bg-blue-50 text-blue-700",
  yukleme_yapiliyor: "border-amber-200 bg-amber-50 text-amber-700",
  yolda: "border-blue-200 bg-blue-50 text-blue-700",
  teslimatta: "border-violet-200 bg-violet-50 text-violet-700",
  teslim_edildi: "border-emerald-200 bg-emerald-50 text-emerald-700",
  iptal: "border-rose-200 bg-rose-50 text-rose-700",
}

/* ─── InfoCell ─── */

function InfoCell({ label, value, compact }: { label: string; value: string | number; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold tracking-tight text-slate-900 ${compact ? "text-sm leading-snug" : "text-base leading-tight"}`}>
        {value}
      </p>
    </div>
  )
}

/* ─── Page Component ─── */

export default function TransportDetailPage() {
  const params = useParams<{ tasimaNo: string }>()
  const tasimaNo = params.tasimaNo

  const data = useMemo(() => findTasimaDetay(decodeURIComponent(tasimaNo)), [tasimaNo])

  if (!data) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Taşıma İşlemleri", href: "/arf/cargo/transport/list" },
            { label: "Taşıma Detay" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center bg-slate-50 p-8">
          <div className="text-center">
            <Search className="mx-auto size-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-700">Taşıma Bulunamadı</h2>
            <p className="mt-1 text-sm text-slate-500">
              &ldquo;{decodeURIComponent(tasimaNo)}&rdquo; numaralı taşıma kaydı bulunamadı.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Taşıma İşlemleri", href: "/arf/cargo/transport/list" },
          { label: "Taşıma Detay" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-3 bg-slate-50 p-3 pt-2.5 lg:gap-4">
        {/* ─── Header Card ─── */}
        <Card className="relative overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-secondary/10 blur-3xl" />

          <CardContent className="relative space-y-3 p-3.5 lg:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
                    Taşıma No: #{data.tasimaNo.replace("TSM-", "")}
                  </h1>
                  <Badge
                    className={cn(
                      "rounded-lg border px-2.5 py-0.5 text-xs font-medium",
                      statusBadgeConfig[data.durum] ?? "border-slate-200 bg-slate-100 text-slate-700",
                    )}
                  >
                    {data.durumLabel}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  Gönderici: {data.gondericiMusteri.displayName} · Alıcı: {data.aliciMusteri.displayName}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <InfoCell label="Rota" value={data.rota} compact />
              <InfoCell label="Gönderi Tipi" value={`${data.gonderiTipi} Gönderi`} />
              <InfoCell label="Sürücü" value={data.surucuAdi} />
              <InfoCell label="Araç Plaka" value={data.aracPlaka} />
              <InfoCell label="Araç Tipi" value={data.aracTipi} />
              <InfoCell
                label="Toplam Ağırlık"
                value={`${new Intl.NumberFormat("tr-TR").format(data.yukler.reduce((t, y) => t + y.agirlik, 0))} kg`}
              />
              <InfoCell
                label="Toplam Desi"
                value={new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(
                  data.yukler.reduce((t, y) => t + (y.en * y.boy * y.genislik * y.adet) / 3000, 0),
                )}
              />
              <InfoCell
                label="Toplam Tutar"
                value={`${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.fiyatlandirma.satisFiyatDetay.toplamFiyat)}₺`}
              />
              <InfoCell label="Oluşturulma Zamanı" value={data.tarih} compact />
              <InfoCell label="Oluşturan" value={data.olusturan} compact />
            </div>
          </CardContent>
        </Card>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="genel" className="space-y-3">
          <TabsList className="grid h-10 w-full grid-cols-4 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger
              value="genel"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Genel Bilgiler
            </TabsTrigger>
            <TabsTrigger
              value="durum"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Taşıma Durumu
            </TabsTrigger>
            <TabsTrigger
              value="finans"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Finans & Muhasebe
            </TabsTrigger>
            <TabsTrigger
              value="teklifler"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Teklifler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="genel" className="space-y-3">
            <TabGeneralInfo data={data} />
          </TabsContent>
          <TabsContent value="durum" className="space-y-3">
            <TabTransportStatus data={data} />
          </TabsContent>
          <TabsContent value="finans" className="space-y-3">
            <TabFinance data={data} />
          </TabsContent>
          <TabsContent value="teklifler" className="space-y-3">
            <TabOffers data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
