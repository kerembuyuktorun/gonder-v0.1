"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import type { ComponentType } from "react"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Link2,
  Loader2,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import type { SupplierTransportRecord, SupplierTransportDurum } from "../_types"
import type { GiderKalemi } from "../../../../transport/[tasimaNo]/_types/transport-detail"
import { supplierTransportsMock } from "../_mock/supplier-transport-mock-data"

/* ── Status config ── */

const transportStatusConfig: Record<
  SupplierTransportDurum,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  planlanmis: { label: "Planlanmış", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  yukleniyor: { label: "Yükleniyor", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Loader2 },
  yolda: { label: "Yolda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  iptal: { label: "İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Clock },
}

const gonderiTipiBadge: Record<string, { label: string; className: string }> = {
  FTL: { label: "FTL", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  LTL: { label: "LTL", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
}

const faturaDurumuConfig: Record<string, { label: string; className: string }> = {
  eslestirildi: { label: "Eşleştirildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  eslestirilmedi: { label: "Eşleştirilmedi", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
}

const odemeDurumuConfig: Record<string, { label: string; className: string }> = {
  odendi: { label: "Ödendi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  tahsil_edildi: { label: "Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  bekliyor: { label: "Bekliyor", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  gecikti: { label: "Gecikti", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
}

/* ── Helpers ── */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

const formatNumber = (value: number) =>
  new Intl.NumberFormat("tr-TR").format(value)

/* ── Gider Expanded Row (with checkboxes) ── */

function TransportGiderExpandedRow({
  transport,
  selectedGiderIds,
  onToggleGider,
}: {
  transport: SupplierTransportRecord
  selectedGiderIds: Set<string>
  onToggleGider: (giderId: string, tasimaNo: string) => void
}) {
  const giderler = transport.giderler

  if (!giderler || giderler.length === 0) {
    return (
      <div className="px-10 py-4 text-sm text-muted-foreground">
        Bu taşıma için gider kalemi bulunmuyor.
      </div>
    )
  }

  return (
    <div className="bg-slate-50/50 px-6 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Gider Kalemleri – {transport.tasimaNo}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
              <th className="w-10 px-2 py-2" />
              <th className="px-2 py-2">Açıklama</th>
              <th className="px-2 py-2">Tedarikçi</th>
              <th className="px-2 py-2">Tarih</th>
              <th className="px-2 py-2 text-right">Birim Fiyat</th>
              <th className="px-2 py-2 text-center">Tevkifat</th>
              <th className="px-2 py-2 text-right">Tevkifat Tutarı</th>
              <th className="px-2 py-2 text-center">KDV %</th>
              <th className="px-2 py-2 text-right">KDV Tutarı</th>
              <th className="px-2 py-2 text-right">Toplam Fiyat</th>
              <th className="px-2 py-2 text-center">Fatura Durumu</th>
              <th className="px-2 py-2 text-center">Ödeme Durumu</th>
            </tr>
          </thead>
          <tbody>
            {giderler.map((g) => {
              const fd = faturaDurumuConfig[g.faturaDurumu]
              const od = odemeDurumuConfig[g.odemeDurumu]
              const isSelected = selectedGiderIds.has(g.id)
              const canSelect = g.faturaDurumu === "eslestirilmedi"

              return (
                <tr key={g.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-100/50">
                  <td className="px-2 py-2">
                    {canSelect && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleGider(g.id, transport.tasimaNo)}
                        aria-label={`${g.aciklama} seç`}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 font-medium">{g.aciklama}</td>
                  <td className="px-2 py-2 text-muted-foreground">{g.tedarikci}</td>
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
                    <Badge variant="outline" className={`text-[11px] ${od?.className}`}>{od?.label ?? g.odemeDurumu}</Badge>
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

/* ── Component ── */

interface Props {
  supplierId: string
}

export function SupplierUnmatchedTransportsSection({ supplierId }: Props) {
  const allTransports = useMemo(() => supplierTransportsMock[supplierId] ?? [], [supplierId])
  const [table, setTable] = useState<TanStackTable<SupplierTransportRecord> | null>(null)

  /* gider id → tasimaNo mapping for selection */
  const [selectedGiderMap, setSelectedGiderMap] = useState<Record<string, string>>({})

  /* Only show transports that have at least one unmatched gider */
  const unmatchedTransports = useMemo(
    () => allTransports.filter((t) =>
      t.giderler.some((g) => g.faturaDurumu === "eslestirilmedi"),
    ),
    [allTransports],
  )

  const selectedGiderIds = useMemo(() => new Set(Object.keys(selectedGiderMap)), [selectedGiderMap])

  const handleToggleGider = useCallback((giderId: string, tasimaNo: string) => {
    setSelectedGiderMap((prev) => {
      const next = { ...prev }
      if (next[giderId]) {
        delete next[giderId]
      } else {
        next[giderId] = tasimaNo
      }
      return next
    })
  }, [])

  const selectedGiderler = useMemo<GiderKalemi[]>(() => {
    if (selectedGiderIds.size === 0) return []
    const result: GiderKalemi[] = []
    for (const t of unmatchedTransports) {
      for (const g of t.giderler) {
        if (selectedGiderIds.has(g.id)) result.push(g)
      }
    }
    return result
  }, [unmatchedTransports, selectedGiderIds])

  const hasSelection = selectedGiderler.length > 0

  const selectedTotal = useMemo(
    () => selectedGiderler.reduce((acc, g) => acc + g.toplamTutar, 0),
    [selectedGiderler],
  )

  const handleMatch = () => {
    toast.success(
      `${selectedGiderler.length} gider kalemi eşleştirme için seçildi. Toplam: ${formatCurrency(selectedTotal)}`,
    )
    setSelectedGiderMap({})
  }

  const renderSubComponent = useCallback(
    (transport: SupplierTransportRecord) => (
      <TransportGiderExpandedRow
        transport={transport}
        selectedGiderIds={selectedGiderIds}
        onToggleGider={handleToggleGider}
      />
    ),
    [selectedGiderIds, handleToggleGider],
  )

  const columns = useMemo<ColumnDef<SupplierTransportRecord>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          const hasGider = row.original.giderler && row.original.giderler.length > 0
          if (!hasGider) return null
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
        accessorKey: "tedarikciUnvan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi" />,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.tedarikciUnvan}</span>,
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
        cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.yukTipleri}</span>,
      },
      {
        accessorKey: "toplamAdet",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
        cell: ({ row }) => <span className="text-sm tabular-nums text-slate-700">{formatNumber(row.original.toplamAdet)}</span>,
      },
      {
        accessorKey: "toplamAgirlik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Ağırlık (kg)" />,
        cell: ({ row }) => <span className="text-sm tabular-nums text-slate-700">{formatNumber(row.original.toplamAgirlik)}</span>,
      },
      {
        accessorKey: "toplamDesi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
        cell: ({ row }) => <span className="text-sm tabular-nums text-slate-700">{formatNumber(row.original.toplamDesi)}</span>,
      },
      {
        accessorKey: "alisFiyat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alış Fiyat" />,
        cell: ({ row }) => {
          const giderler = row.original.giderler ?? []
          const giderToplam = giderler.reduce((acc, g) => acc + g.toplamTutar, 0)
          return (
            <div className="text-right">
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(giderler.length > 0 ? giderler[0].toplamTutar : row.original.alisFiyat)}
              </span>
              {giderToplam > 0 && giderToplam !== (giderler.length > 0 ? giderler[0].toplamTutar : 0) && (
                <div className="text-[11px] text-muted-foreground">Gider Toplamı: {formatCurrency(giderToplam)}</div>
              )}
            </div>
          )
        },
      },
      {
        id: "giderDurum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gider Kalemleri" />,
        cell: ({ row }) => {
          const giderler = row.original.giderler
          if (!giderler || giderler.length === 0) return <span className="text-muted-foreground">—</span>
          const faturasiz = giderler.filter((g) => g.faturaDurumu === "eslestirilmedi").length
          return (
            <div className="text-xs">
              <span className="font-medium">{giderler.length} kalem</span>
              {faturasiz > 0 && (
                <span className="ml-1 text-amber-600">({faturasiz} eşleşmemiş)</span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "durum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
        cell: ({ row }) => {
          const config = transportStatusConfig[row.original.durum]
          const StatusIcon = config?.icon ?? Truck
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
        cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.olusturmaTarihi}</span>,
      },
      {
        accessorKey: "olusturan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.olusturan}</span>,
      },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        {unmatchedTransports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-50">
              <Link2 className="size-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Tüm taşımalar eşleştirildi</p>
            <p className="mt-1 text-xs text-muted-foreground">Bu tedarikçiye ait eşleşmemiş gider kalemi bulunmuyor.</p>
          </div>
        ) : (
          <>
            {hasSelection && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-secondary/20 bg-primary/5 px-3 py-2">
                <p className="text-sm font-medium text-secondary">
                  Seçili: {selectedGiderler.length} gider kalemi – Toplam: {formatCurrency(selectedTotal)}
                </p>
                <Button size="sm" onClick={handleMatch}>
                  <FileText className="mr-2 size-4" />
                  Fatura Eşleştir
                </Button>
              </div>
            )}



            {table && (
              <div className="mb-3 flex items-center gap-2">
                <DataTableExcelActions
                  table={table}
                  filename="eslesmemis-tasimalar"
                  exportSelected={false}
                  exportLabel="Dışarı Aktar"
                />
                <DataTableToolbar
                  table={table}
                  showColumnSelector
                  viewLabel="Görünüm"
                  columnsLabel="Sütunlar"
                  resetLabel="Sıfırla"
                />
              </div>
            )}

            <DataTable
              data={unmatchedTransports}
              columns={columns}
              expandOnRowClick
              renderSubComponent={renderSubComponent}
              onTableReady={(instance) => setTable(instance as TanStackTable<SupplierTransportRecord>)}
            />

            {table && (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
