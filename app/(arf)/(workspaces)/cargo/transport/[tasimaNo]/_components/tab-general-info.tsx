"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { ARF_ROUTES } from "../../../../../_shared/routes"
import type { MusteriDetay, TasimaDetayRecord, YukDetaySatiri } from "../_types/transport-detail"

/* ─── DetailField ─── */

function DetailField({ label, value, fullWidth }: { label: string; value?: string; fullWidth?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "-"}</p>
    </div>
  )
}

/* ─── PartyInfoCard ─── */

function PartyInfoCard({ title, party }: { title: string; party: MusteriDetay }) {
  const typeLabel = party.customerType === "corporate" ? "Kurumsal" : "Bireysel"
  const typeBadgeClass =
    party.customerType === "corporate"
      ? "border-secondary/30 bg-secondary/12 text-foreground"
      : "border-primary/30 bg-primary/15 text-foreground"

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-3 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <div className="flex items-center gap-2">
            {party.customerId && (
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-lg text-xs" asChild>
                <Link href={ARF_ROUTES.cargo.sales.customerDetail(party.customerId)}>
                  <ExternalLink className="size-3.5" />
                  Müşteri Detay
                </Link>
              </Button>
            )}
            <Badge className={`rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeBadgeClass}`}>
              {typeLabel}
            </Badge>
          </div>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          <DetailField
            label={party.customerType === "corporate" ? "Şirket Ünvanı" : "Müşteri"}
            value={party.customerType === "corporate" ? party.companyName || party.displayName : party.displayName}
          />

          {party.customerType === "corporate" ? (
            <>
              <DetailField label="Yetkili" value={party.contactName} />
              <DetailField label="Vergi Numarası" value={party.taxNumber} />
              <DetailField label="Vergi Dairesi" value={party.taxOffice} />
              <DetailField label="E-posta" value={party.email || "-"} />
            </>
          ) : (
            <>
              <DetailField label="TC Kimlik No" value={party.tcIdentityNumber} />
              <DetailField label="E-posta" value={party.email || "-"} />
            </>
          )}

          <DetailField label="Telefon" value={party.phone} />
          <DetailField label="Şube" value={party.branch} />
          <DetailField label="İl" value={party.city} />
          <DetailField label="İlçe" value={party.district} />
          <DetailField label="Mahalle" value={party.neighborhood} />
          <DetailField label="Açık Adres" value={party.fullAddress} fullWidth />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── PersonnelCard ─── */

function PersonnelCard({
  title,
  adSoyad,
  rol,
  telefon,
  email,
  userId,
}: {
  title: string
  adSoyad: string
  rol: string
  telefon: string
  email?: string
  userId?: string
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-3 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
          {userId && (
            <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-lg text-xs" asChild>
              <Link href={ARF_ROUTES.cargo.settings.system.userDetail(userId)}>
                <ExternalLink className="size-3.5" />
                Kullanıcı Detay
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          <DetailField label="Ad Soyad" value={adSoyad} />
          <DetailField label="Rol" value={rol} />
          <DetailField label="Telefon" value={telefon} />
          <DetailField label="E-posta" value={email} />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Tab Component ─── */

export function TabGeneralInfo({ data }: { data: TasimaDetayRecord }) {
  const toplamAdet = data.yukler.reduce((t, y) => t + y.adet, 0)
  const toplamAgirlik = data.yukler.reduce((t, y) => t + y.agirlik, 0)
  const toplamDesi = data.yukler.reduce((t, y) => t + (y.en * y.boy * y.genislik * y.adet) / 3000, 0)
  const toplamHacim = data.yukler.reduce((t, y) => t + (y.en * y.boy * y.genislik * y.adet) / 1_000_000, 0)

  const yukDataWithTotal = useMemo<YukDetaySatiri[]>(() => {
    if (data.yukler.length === 0) return []
    const toplamRow: YukDetaySatiri = {
      id: "toplam",
      yukTipi: "Toplam",
      adet: toplamAdet,
      en: 0,
      boy: 0,
      genislik: 0,
      agirlik: toplamAgirlik,
    }
    return [...data.yukler, toplamRow]
  }, [data.yukler, toplamAdet, toplamAgirlik])

  const isToplam = (row: YukDetaySatiri) => row.id === "toplam"

  const yukColumns = useMemo<ColumnDef<YukDetaySatiri>[]>(
    () => [
      {
        accessorKey: "yukTipi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Yük Tipi" />,
        cell: ({ row }) => (
          <span className={isToplam(row.original) ? "font-semibold" : "font-medium"}>
            {row.original.yukTipi}
          </span>
        ),
      },
      {
        accessorKey: "adet",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Adet" />,
        cell: ({ row }) => (
          <span className={`tabular-nums ${isToplam(row.original) ? "font-semibold" : ""}`}>
            {row.original.adet}
          </span>
        ),
      },
      {
        id: "olculer",
        enableSorting: false,
        header: () => <span>Ölçüler (cm)</span>,
        cell: ({ row }) =>
          isToplam(row.original) ? null : (
            <span className="tabular-nums">
              {row.original.en}×{row.original.boy}×{row.original.genislik}
            </span>
          ),
      },
      {
        accessorKey: "agirlik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ağırlık" />,
        cell: ({ row }) => (
          <span className={`tabular-nums ${isToplam(row.original) ? "font-semibold" : ""}`}>
            {new Intl.NumberFormat("tr-TR").format(row.original.agirlik)} kg
          </span>
        ),
      },
      {
        id: "desi",
        enableSorting: false,
        header: () => <span>Desi</span>,
        cell: ({ row }) => {
          if (isToplam(row.original)) {
            return (
              <span className="tabular-nums font-semibold">
                {new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(toplamDesi)}
              </span>
            )
          }
          const y = row.original
          const desi = (y.en * y.boy * y.genislik * y.adet) / 3000
          return (
            <span className="tabular-nums">
              {new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(desi)}
            </span>
          )
        },
      },
      {
        id: "hacim",
        enableSorting: false,
        header: () => <span>Hacim (m³)</span>,
        cell: ({ row }) => {
          if (isToplam(row.original)) {
            return (
              <span className="tabular-nums font-semibold">
                {new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(toplamHacim)}
              </span>
            )
          }
          const y = row.original
          const hacim = (y.en * y.boy * y.genislik * y.adet) / 1_000_000
          return (
            <span className="tabular-nums">
              {new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(hacim)}
            </span>
          )
        },
      },
    ],
    [toplamDesi, toplamHacim],
  )

  return (
    <div className="space-y-3">
      {/* ─── Yük Detayları ─── */}
      {data.yukler.length > 0 && (
        <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-3 p-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">Yük Detayları</h3>
              <Badge className="rounded-lg border border-secondary/30 bg-secondary/12 px-3 py-1 text-xs font-semibold text-foreground">
                {data.yukler.length} Yük
              </Badge>
            </div>

            <DataTable
              data={yukDataWithTotal}
              columns={yukColumns}
              enableSorting
              enableHorizontalScroll
              className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600 [&_tbody_tr:last-child]:border-t-2 [&_tbody_tr:last-child]:border-slate-300 [&_tbody_tr:last-child]:bg-slate-50/80"
              emptyMessage="Gösterilecek yük bulunamadı."
            />
          </CardContent>
        </Card>
      )}

      {/* Gönderici & Alıcı */}
      <div className="grid gap-3 lg:grid-cols-2">
        <PartyInfoCard title="Gönderici Bilgileri" party={data.gondericiMusteri} />
        <PartyInfoCard title="Alıcı Bilgileri" party={data.aliciMusteri} />
      </div>

      {/* Tedarikçi Bilgileri */}
      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-3 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">Tedarikçi Bilgileri</h3>
            {data.tedarikci.supplierId && (
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-lg text-xs" asChild>
                <Link href={ARF_ROUTES.cargo.operations.supplierDetail(data.tedarikci.supplierId)}>
                  <ExternalLink className="size-3.5" />
                  Tedarikçi Detay
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            <DetailField label="Firma Adı" value={data.tedarikci.firmaAdi} />
            <DetailField label="Şehir" value={data.tedarikci.sehir} />
            <DetailField label="Yetkili" value={data.tedarikci.yetkili} />
            <DetailField label="Unvan" value={data.tedarikci.unvan} />
            <DetailField label="Telefon" value={data.tedarikci.telefon} />
            <DetailField label="E-posta" value={data.tedarikci.email} />
          </div>

          {/* Araç Bilgileri */}
          <div className="border-t border-slate-200 pt-3">
            <h4 className="text-base font-semibold tracking-tight text-slate-900">Araç Bilgileri</h4>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            <DetailField label="Plaka" value={data.tedarikci.aracPlaka} />
            <DetailField label="Araç Tipi" value={data.tedarikci.aracTipi} />
            <DetailField label="Kasa Tipi" value={data.tedarikci.kasaTipi} />
            <DetailField
              label="Max Ağırlık Kapasitesi"
              value={data.tedarikci.maxAgirlikKapasitesi ? `${new Intl.NumberFormat("tr-TR").format(data.tedarikci.maxAgirlikKapasitesi)} kg` : undefined}
            />
            <DetailField
              label="Max Hacim Kapasitesi"
              value={data.tedarikci.maxHacimKapasitesi ? `${data.tedarikci.maxHacimKapasitesi} m³` : undefined}
            />
          </div>

          {/* Sürücü Bilgileri */}
          <div className="flex items-center gap-2.5 border-t border-slate-200 pt-3">
            <h4 className="text-base font-semibold tracking-tight text-slate-900">Sürücü Bilgileri</h4>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            <DetailField label="Ad" value={data.tedarikci.surucuAd} />
            <DetailField label="Soyad" value={data.tedarikci.surucuSoyad} />
            <DetailField label="Telefon" value={data.tedarikci.surucuTelefon} />
          </div>
        </CardContent>
      </Card>

      {/* Personel Bilgileri */}
      <div className="grid gap-3 lg:grid-cols-2">
        <PersonnelCard
          title="Operasyon Sorumlusu"
          adSoyad={data.operasyonSorumlusu.adSoyad}
          rol={data.operasyonSorumlusu.rol}
          telefon={data.operasyonSorumlusu.telefon}
          email={data.operasyonSorumlusu.email}
          userId={data.operasyonSorumlusu.userId}
        />
        <PersonnelCard
          title="Satış Sorumlusu"
          adSoyad={data.satisSorumlusu.adSoyad}
          rol={data.satisSorumlusu.rol}
          telefon={data.satisSorumlusu.telefon}
          email={data.satisSorumlusu.email}
          userId={data.satisSorumlusu.userId}
        />
      </div>
    </div>
  )
}
