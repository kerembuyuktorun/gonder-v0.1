"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import type { ComponentType } from "react"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Loader2,
  Package,
  Truck,
} from "lucide-react"
import type { CustomerTransportRecord, TransportDurum } from "../../_data/customers"

type TransportFilter = "all" | "teslim_edildi" | "iptal"

const filterLabels: Record<TransportFilter, string> = {
  all: "Tümü",
  teslim_edildi: "Teslim Edilenler",
  iptal: "İptal Edilenler",
}

const transportStatusConfig: Record<
  TransportDurum,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  planlanmis: { label: "Planlanmış", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  yukleniyor: { label: "Yükleniyor", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Loader2 },
  yolda: { label: "Yolda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  iptal: { label: "İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Ban },
}

const statusFilterOptions = [
  { label: "Planlanmış", value: "planlanmis" },
  { label: "Yükleniyor", value: "yukleniyor" },
  { label: "Yolda", value: "yolda" },
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "İptal", value: "iptal" },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

const formatNumber = (value: number) =>
  new Intl.NumberFormat("tr-TR").format(value)

const gonderiTipiBadge: Record<string, { label: string; className: string }> = {
  FTL: { label: "FTL", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  LTL: { label: "LTL", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
}

const faturaDurumuConfig: Record<string, { label: string; className: string }> = {
  olusturuldu: { label: "Fatura Oluşturuldu", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  olusturulmadi: { label: "Fatura Oluşturulmadı", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
}

const tahsilatDurumuConfig: Record<string, { label: string; className: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  odendi: { label: "Ödendi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  bekliyor: { label: "Bekliyor", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  gecikti: { label: "Gecikti", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
}

/* ── Gelir Expanded Row ── */
function TransportGelirRow({ transport }: { transport: CustomerTransportRecord }) {
  const gelirler = transport.gelirler

  if (!gelirler || gelirler.length === 0) {
    return (
      <div className="px-10 py-4 text-sm text-muted-foreground">
        Bu taşıma için gelir kalemi bulunmuyor.
      </div>
    )
  }

  return (
    <div className="bg-slate-50/50 px-6 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Gelir Kalemleri – {transport.tasimaNo}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
              <th className="px-2 py-2">Açıklama</th>
              <th className="px-2 py-2">Müşteri</th>
              <th className="px-2 py-2">Tarih</th>
              <th className="px-2 py-2 text-right">Birim Fiyat</th>
              <th className="px-2 py-2 text-center">Tevkifat</th>
              <th className="px-2 py-2 text-right">Tevkifat Tutarı</th>
              <th className="px-2 py-2 text-center">KDV %</th>
              <th className="px-2 py-2 text-right">KDV Tutarı</th>
              <th className="px-2 py-2 text-right">Toplam Fiyat</th>
              <th className="px-2 py-2 text-center">Fatura Durumu</th>
              <th className="px-2 py-2 text-center">Tahsilat Durumu</th>
            </tr>
          </thead>
          <tbody>
            {gelirler.map((g) => {
              const fd = faturaDurumuConfig[g.faturaDurumu]
              const td = tahsilatDurumuConfig[g.tahsilatDurumu]
              return (
                <tr key={g.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-100/50">
                  <td className="px-2 py-2 font-medium">{g.aciklama}</td>
                  <td className="px-2 py-2 text-muted-foreground">{g.musteri}</td>
                  <td className="px-2 py-2 text-muted-foreground">{g.tarih}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(g.birimFiyat)}</td>
                  <td className="px-2 py-2 text-center text-muted-foreground">{g.tevkifat}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(g.tevfikatTutar)}</td>
                  <td className="px-2 py-2 text-center text-muted-foreground">%{g.kdvOran}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(g.kdvTutar)}</td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums">{formatCurrency(g.toplamTutar)}</td>
                  <td className="px-2 py-2 text-center">
                    <Badge variant="outline" className={`text-[11px] ${fd?.className}`}>{fd?.label ?? g.faturaDurumu}</Badge>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Badge variant="outline" className={`text-[11px] ${td?.className}`}>{td?.label ?? g.tahsilatDurumu}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CustomerTransportsSection({
  transports,
}: {
  transports: CustomerTransportRecord[]
}) {
  const [filter, setFilter] = useState<TransportFilter>("all")
  const [table, setTable] = useState<TanStackTable<CustomerTransportRecord> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const filteredTransports = useMemo(() => {
    if (filter === "all") return transports
    return transports.filter((t) => t.durum === filter)
  }, [filter, transports])

  const counts = useMemo(
    () => ({
      all: transports.length,
      teslim_edildi: transports.filter((t) => t.durum === "teslim_edildi").length,
      iptal: transports.filter((t) => t.durum === "iptal").length,
    }),
    [transports],
  )

  const renderSubComponent = useCallback(
    (transport: CustomerTransportRecord) => <TransportGelirRow transport={transport} />,
    [],
  )

  const columns = useMemo<ColumnDef<CustomerTransportRecord>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          const hasGelir = row.original.gelirler && row.original.gelirler.length > 0
          if (!hasGelir) return null
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); row.toggleExpanded() }}
              className="flex size-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              {row.getIsExpanded() ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          )
        },
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      {
        accessorKey: "tasimaNo",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Taşıma No" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/transport/${row.original.tasimaNo}`}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.tasimaNo}
          </Link>
        ),
      },
      {
        accessorKey: "yuklemeTarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Yükleme Tarihi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.yuklemeTarihi}</span>,
      },
      {
        accessorKey: "gonderiTipi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderi Tipi" />,
        cell: ({ row }) => {
          const tip = gonderiTipiBadge[row.original.gonderiTipi]
          return (
            <Badge variant="outline" className={tip?.className}>
              {tip?.label ?? row.original.gonderiTipi}
            </Badge>
          )
        },
      },
      {
        accessorKey: "gondericiMusteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici" />,
      },
      {
        accessorKey: "aliciMusteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı" />,
      },
      {
        accessorKey: "cikisAdres",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Çıkış Adresi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.cikisAdres}</span>,
      },
      {
        accessorKey: "varisAdres",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Adresi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.varisAdres}</span>,
      },
      {
        accessorKey: "tasimaciFirma",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi" />,
      },
      {
        accessorKey: "aracPlaka",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Plaka" />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.aracPlaka}</span>,
      },
      {
        accessorKey: "surucu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sürücü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.surucu}</span>,
      },
      {
        accessorKey: "yukTipleri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Yük Tipi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.yukTipleri}</span>,
      },
      {
        accessorKey: "toplamAdet",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.toplamAdet)}</span>,
      },
      {
        accessorKey: "toplamAgirlik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Ağırlık (kg)" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.toplamAgirlik)}</span>,
      },
      {
        accessorKey: "toplamDesi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.toplamDesi)}</span>,
      },
      {
        accessorKey: "satisFiyat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Satış Fiyat" />,
        cell: ({ row }) => {
          const gelirToplam = row.original.gelirler.reduce((acc, g) => acc + g.toplamTutar, 0)
          return (
            <div className="text-right">
              <span className="tabular-nums font-medium">{formatCurrency(row.original.gelirler.length > 0 ? row.original.gelirler[0].toplamTutar : row.original.satisFiyat)}</span>
              {gelirToplam > 0 && gelirToplam !== (row.original.gelirler.length > 0 ? row.original.gelirler[0].toplamTutar : 0) && (
                <div className="text-[11px] text-muted-foreground">Gelir Toplamı: {formatCurrency(gelirToplam)}</div>
              )}
            </div>
          )
        },
      },
      {
        id: "giderKalemleri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gelir Kalemleri" />,
        cell: ({ row }) => {
          const toplam = row.original.giderKalemleriSayisi
          const eslesmemis = row.original.giderEslesmemisSayisi
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <Badge variant="outline" className="text-[11px]">{toplam} kalem</Badge>
              {eslesmemis > 0 && (
                <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-600">
                  {eslesmemis} faturasız
                </Badge>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "durum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
        filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
        cell: ({ row }) => {
          const config = transportStatusConfig[row.original.durum]
          const StatusIcon = config?.icon ?? Package
          return (
            <Badge variant="outline" className={config?.className}>
              <StatusIcon className="mr-1.5 size-3" />
              {config?.label ?? row.original.durum}
            </Badge>
          )
        },
      },
      {
        accessorKey: "olusturmaTarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturma Tarihi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturmaTarihi}</span>,
      },
      {
        accessorKey: "olusturan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturan}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        size: 136,
        minSize: 120,
        maxSize: 152,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                  İşlemler
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{`${row.original.tasimaNo} İşlemler:`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/transport/${row.original.tasimaNo}`}>
                    <Eye className="mr-2 size-4" />
                    Detay Görüntüle
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">Müşteri Taşıma Geçmişi</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(["all", "teslim_edildi", "iptal"] as TransportFilter[]).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
            >
              {filterLabels[item]} ({counts[item]})
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {table && (
          <div className="flex items-center gap-2">
            {!showFacetedFilters && (
              <DataTableExcelActions
                table={table}
                filename="musteri-tasima-gecmisi"
                exportSelected={false}
                exportLabel="Dışarı Aktar"
              />
            )}
            <DataTableToolbar
              table={table}
              showColumnSelector={!showFacetedFilters}
              viewLabel="Görünüm"
              columnsLabel="Sütunlar"
              resetLabel="Sıfırla"
            >
              <Button
                type="button"
                variant={showFacetedFilters ? "default" : "outline"}
                size="sm"
                className="mr-3 h-8"
                onClick={() => setShowFacetedFilters((prev) => !prev)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtreler
              </Button>

              {showFacetedFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <DataTableFacetedFilter
                    column={table.getColumn("durum")}
                    title="Durum"
                    options={statusFilterOptions}
                  />
                </div>
              )}
            </DataTableToolbar>
          </div>
        )}

        <DataTable
          data={filteredTransports}
          columns={columns}
          enablePagination
          enableSorting
          enableColumnVisibility
          enableHorizontalScroll
          stickyFirstColumn
          stickyLastColumn
          expandOnRowClick
          renderSubComponent={renderSubComponent}
          className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
          emptyMessage={
            filter === "all"
              ? "Bu müşteriye ait taşıma kaydı bulunmuyor."
              : `${filterLabels[filter]} için kayıt bulunmuyor.`
          }
          onTableReady={(instance) => setTable(instance as TanStackTable<CustomerTransportRecord>)}
        />

        {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} />}
      </CardContent>
    </Card>
  )
}
