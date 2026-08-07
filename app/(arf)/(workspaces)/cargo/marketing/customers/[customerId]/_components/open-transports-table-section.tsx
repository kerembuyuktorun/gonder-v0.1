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
  Loader2,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import { createInvoiceRecord } from "../../../../finance/headquarters/invoices/_api/invoices-api"
import type { CustomerTransportRecord, TransportDurum } from "../../_data/customers"
import type { GelirKalemi } from "../../../../transport/[tasimaNo]/_types/transport-detail"
import type { CreateInvoicePayload, InvoiceCustomerInfo } from "../_types/financial"
import { CreateTransportInvoiceModal } from "./create-transport-invoice-modal"

const transportStatusConfig: Record<
  TransportDurum,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  planlanmis: { label: "Planlanmış", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  yukleniyor: { label: "Yükleniyor", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Loader2 },
  yolda: { label: "Yolda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  iptal: { label: "İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Clock },
}

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
function TransportGelirExpandedRow({
  transport,
  selectedGelirIds,
  onToggleGelir,
}: {
  transport: CustomerTransportRecord
  selectedGelirIds: Set<string>
  onToggleGelir: (gelirId: string, tasimaNo: string) => void
}) {
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
              <th className="w-10 px-2 py-2" />
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
              const isSelected = selectedGelirIds.has(g.id)
              const canSelect = g.faturaDurumu === "olusturulmadi"

              return (
                <tr key={g.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-100/50">
                  <td className="px-2 py-2">
                    {canSelect && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleGelir(g.id, transport.tasimaNo)}
                        aria-label={`${g.aciklama} seç`}
                      />
                    )}
                  </td>
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

export function OpenTransportsTableSection({
  data,
  customerInfo,
}: {
  data: CustomerTransportRecord[]
  customerInfo: InvoiceCustomerInfo
}) {
  const [table, setTable] = useState<TanStackTable<CustomerTransportRecord> | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  /* gelir id → tasimaNo mapping for selection */
  const [selectedGelirMap, setSelectedGelirMap] = useState<Record<string, string>>({})

  const openTransports = useMemo(
    () => data.filter((t) => t.durum !== "teslim_edildi" && t.durum !== "iptal"),
    [data],
  )

  const selectedGelirIds = useMemo(() => new Set(Object.keys(selectedGelirMap)), [selectedGelirMap])

  const handleToggleGelir = useCallback((gelirId: string, tasimaNo: string) => {
    setSelectedGelirMap((prev) => {
      const next = { ...prev }
      if (next[gelirId]) {
        delete next[gelirId]
      } else {
        next[gelirId] = tasimaNo
      }
      return next
    })
  }, [])

  const selectedGelirler = useMemo<GelirKalemi[]>(() => {
    if (selectedGelirIds.size === 0) return []
    const result: GelirKalemi[] = []
    for (const t of openTransports) {
      for (const g of t.gelirler) {
        if (selectedGelirIds.has(g.id)) result.push(g)
      }
    }
    return result
  }, [openTransports, selectedGelirIds])

  const hasSelection = selectedGelirler.length > 0

  const selectedTotal = useMemo(
    () => selectedGelirler.reduce((acc, g) => acc + g.toplamTutar, 0),
    [selectedGelirler],
  )

  /* tasimaNo for modal naming */
  const selectedTasimaNoSet = useMemo(() => {
    const set = new Set<string>()
    for (const id of Object.keys(selectedGelirMap)) {
      set.add(selectedGelirMap[id])
    }
    return set
  }, [selectedGelirMap])

  const modalTasimaNo = useMemo(() => {
    const arr = Array.from(selectedTasimaNoSet)
    return arr.length === 1 ? arr[0] : `${arr.length} Taşıma`
  }, [selectedTasimaNoSet])

  const handleCreateInvoice = async (payload: CreateInvoicePayload) => {
    const firstTransport = openTransports.find((t) => selectedTasimaNoSet.has(t.tasimaNo))
    const operatingBranchName = firstTransport?.cikisAdres ?? "İstanbul Merkez"
    const operatingBranchId = operatingBranchName
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    await createInvoiceRecord({
      invoiceName: payload.invoiceName,
      invoiceNo: "",
      categoryLabel: "Taşıma",
      tagLabels: ["Taşıma Faturası"],
      customerId: customerInfo.customerId,
      customerName: customerInfo.tradeName,
      customerType: customerInfo.customerType,
      taxOffice: customerInfo.taxOffice,
      taxNumber: customerInfo.taxNumber,
      operatingBranchId: operatingBranchId || "istanbul-merkez",
      operatingBranchName,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      note: payload.note || payload.invoiceName,
      subTotal: payload.subTotal,
      vatTotal: payload.vatTotal,
      grandTotal: payload.grandTotal,
      source: "customer-detail",
      relatedCargoIds: selectedGelirler.map((g) => g.id),
      createdBy: "Mevcut Kullanıcı",
    })

    toast.success(
      `${selectedGelirler.length} gelir kalemi için ${payload.invoiceName} oluşturuldu. Toplam: ${formatCurrency(payload.grandTotal)}`,
    )
    setSelectedGelirMap({})
    setConfirmOpen(false)
  }

  const renderSubComponent = useCallback(
    (transport: CustomerTransportRecord) => (
      <TransportGelirExpandedRow
        transport={transport}
        selectedGelirIds={selectedGelirIds}
        onToggleGelir={handleToggleGelir}
      />
    ),
    [selectedGelirIds, handleToggleGelir],
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Taşımacı Firma" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Yük Tipleri" />,
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
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturmaTarihi}</span>,
      },
      {
        accessorKey: "olusturan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturan}</span>,
      },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        {hasSelection && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-secondary/20 bg-primary/5 px-3 py-2">
            <p className="text-sm font-medium text-secondary">
              Seçili: {selectedGelirler.length} gelir kalemi – Toplam: {formatCurrency(selectedTotal)}
            </p>
            <Button size="sm" onClick={() => setConfirmOpen(true)}>
              <FileText className="mr-2 size-4" />
              Fatura Oluştur
            </Button>
          </div>
        )}

        {table && (
          <div className="mb-3 flex items-center gap-2">
            <DataTableExcelActions
              table={table}
              filename="acik-tasimalar"
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
          data={openTransports}
          columns={columns}
          enablePagination
          enableSorting
          enableColumnVisibility
          enableHorizontalScroll
          stickyFirstColumn
          expandOnRowClick
          renderSubComponent={renderSubComponent}
          className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
          emptyMessage="Açık taşıma kaydı bulunmuyor."
          onTableReady={(instance) => setTable(instance as TanStackTable<CustomerTransportRecord>)}
        />

        {table && (
          <DataTablePagination
            table={table as TanStackTable<unknown>}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}

        <CreateTransportInvoiceModal
          mode="gelir"
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          selectedGelirler={selectedGelirler}
          tasimaNo={modalTasimaNo}
          customerInfo={customerInfo}
          onConfirm={handleCreateInvoice}
        />
      </CardContent>
    </Card>
  )
}
