"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, createSelectionColumn } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Plus, LinkIcon, ChevronDown, Coins, Eye, FileText } from "lucide-react"
import { FinanceExpenseDialog } from "../../../../_shared/finance/FinanceExpenseDialog"
import type {
  TripDetailRecord,
  TripGiderKalemi,
  TripFatura,
  GelirGiderDurum,
  GiderFaturaDurumu,
  FaturaDurum,
} from "../../_types"

/* ─── Helpers ─── */

const fmt = (v: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

const tahsilatConfig: Record<GelirGiderDurum, { label: string; cls: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  odendi: { label: "Ödendi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  bekliyor: { label: "Bekliyor", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  gecikti: { label: "Gecikti", cls: "border-rose-200 bg-rose-50 text-rose-700" },
}

const giderFaturaDurumuConfig: Record<GiderFaturaDurumu, { label: string; cls: string }> = {
  eslestirildi: { label: "Eşleştirildi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  eslestirilmedi: { label: "Eşleştirilmedi", cls: "border-amber-200 bg-amber-50 text-amber-700" },
}

const faturaDurumConfig: Record<FaturaDurum, { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  kismi: { label: "Kısmi Ödendi", cls: "border-sky-200 bg-sky-50 text-sky-700" },
  odendi: { label: "Ödendi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  gecikti: { label: "Gecikti", cls: "border-rose-200 bg-rose-50 text-rose-700" },
  iptal: { label: "İptal", cls: "border-slate-200 bg-slate-50 text-slate-500" },
}

const tevkifatSecenekleri = [
  { value: "yok", label: "Yok" },
  { value: "2/10", label: "2/10" },
  { value: "5/10", label: "5/10" },
  { value: "7/10", label: "7/10" },
  { value: "9/10", label: "9/10" },
]

const kdvSecenekleri = [
  { value: "0", label: "%0" },
  { value: "1", label: "%1" },
  { value: "10", label: "%10" },
  { value: "20", label: "%20" },
]

/* ─── Summary Card ─── */

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", color)}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums">{value}</p>
    </div>
  )
}

/* ─── Gider Sekmesi ─── */

function GiderTab({ data }: { data: TripDetailRecord }) {
  const giderler = data.giderler ?? []
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [giderDialogOpen, setGiderDialogOpen] = useState(false)
  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length
  const selectedTotal = useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    return giderler.filter((_, i) => selectedIds.includes(String(i))).reduce((t, g) => t + g.toplamTutar, 0)
  }, [rowSelection, giderler])

  const toplamMatrah = giderler.reduce((t, g) => t + g.birimFiyat, 0)
  const toplamKdv = giderler.reduce((t, g) => t + g.kdvTutar, 0)
  const toplamTevkifat = giderler.reduce((t, g) => t + g.tevfikatTutar, 0)
  const genelToplam = giderler.reduce((t, g) => t + g.toplamTutar, 0)

  const columns = useMemo<ColumnDef<TripGiderKalemi>[]>(
    () => [
      createSelectionColumn<TripGiderKalemi>(),
      {
        accessorKey: "aciklama",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
        cell: ({ row }) => <span className="font-medium">{row.original.aciklama}</span>,
      },
      {
        accessorKey: "tedarikci",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi" />,
      },
      {
        accessorKey: "tarih",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tarih" />,
      },
      {
        accessorKey: "birimFiyat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Birim Fiyat" />,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.birimFiyat)}₺</span>,
      },
      {
        accessorKey: "tevkifat",
        header: () => <span>Tevkifat</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <span className={cn("text-sm", row.original.tevkifat === "yok" ? "text-slate-400" : "font-medium")}>
            {row.original.tevkifat === "yok" ? "Yok" : row.original.tevkifat}
          </span>
        ),
      },
      {
        accessorKey: "tevfikatTutar",
        header: () => <span>Tevkifat Tutarı</span>,
        enableSorting: false,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.tevfikatTutar)}₺</span>,
      },
      {
        accessorKey: "kdvOran",
        header: () => <span>KDV %</span>,
        enableSorting: false,
        cell: ({ row }) => <span className="tabular-nums">%{row.original.kdvOran}</span>,
      },
      {
        accessorKey: "kdvTutar",
        header: () => <span>KDV Tutarı</span>,
        enableSorting: false,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.kdvTutar)}₺</span>,
      },
      {
        accessorKey: "toplamTutar",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Fiyat" />,
        cell: ({ row }) => <span className="tabular-nums font-semibold">{fmt(row.original.toplamTutar)}₺</span>,
      },
      {
        accessorKey: "faturaDurumu",
        header: () => <span>Fatura Durumu</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const cfg = giderFaturaDurumuConfig[row.original.faturaDurumu]
          return <Badge className={cn("rounded-md border text-xs whitespace-nowrap", cfg.cls)}>{cfg.label}</Badge>
        },
      },
      {
        accessorKey: "odemeDurumu",
        header: () => <span>Ödeme Durumu</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const cfg = tahsilatConfig[row.original.odemeDurumu]
          return <Badge className={cn("rounded-md border text-xs whitespace-nowrap", cfg.cls)}>{cfg.label}</Badge>
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        size: 120,
        cell: ({ row }) => {
          const eslestirildi = row.original.faturaDurumu === "eslestirildi"
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                    İşlemler
                    <ChevronDown className="ml-1 size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {eslestirildi ? (
                    <DropdownMenuItem>
                      <Eye className="mr-2 size-4" />
                      Faturayı Görüntüle
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <LinkIcon className="mr-2 size-4" />
                      Fatura Eşleştir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard label="Matrah" value={`${fmt(toplamMatrah)}₺`} color="border-slate-200 bg-white text-slate-900" />
        <SummaryCard label="Tevkifat Toplam" value={`${fmt(toplamTevkifat)}₺`} color="border-slate-200 bg-white text-slate-900" />
        <SummaryCard label="KDV" value={`${fmt(toplamKdv)}₺`} color="border-slate-200 bg-white text-slate-900" />
        <SummaryCard label="Genel Toplam" value={`${fmt(genelToplam)}₺`} color="border-rose-200 bg-rose-50 text-rose-800" />
      </div>

      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          {selectedCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-secondary/20 bg-primary/5 px-3 py-2">
              <p className="text-sm font-medium text-secondary">
                Seçili: {selectedCount} gider kalemi – Toplam: {fmt(selectedTotal)}₺
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm">
                  <LinkIcon className="mr-2 size-4" />
                  Fatura Eşleştir
                </Button>
                <Button size="sm" onClick={() => setGiderDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Gider Ekle
                </Button>
              </div>
            </div>
          )}

          {selectedCount === 0 && (
            <div className="mb-3 flex items-center justify-end gap-2">
              <Button size="sm" onClick={() => setGiderDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                Gider Ekle
              </Button>
            </div>
          )}

          <DataTable
            data={giderler}
            columns={columns}
            enableSorting
            enableRowSelection={(row) => row.original.faturaDurumu !== "eslestirildi"}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            enableHorizontalScroll
            className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
            emptyMessage="Henüz gider kalemi bulunmamaktadır."
          />
        </CardContent>
      </Card>
      <FinanceExpenseDialog
        open={giderDialogOpen}
        onOpenChange={setGiderDialogOpen}
        supplierName={data.supplierDisplay}
        description="Sefer için yeni gider kalemi oluşturun."
        amountPlaceholder="Gider açıklaması"
        withholdingBase="base"
        tevkifatOptions={tevkifatSecenekleri}
        kdvOptions={kdvSecenekleri}
        totalClassName="font-semibold tabular-nums"
      />
    </div>
  )
}

/* ─── Faturalar Sekmesi ─── */

function FaturalarTab({ data }: { data: TripDetailRecord }) {
  const faturalar = data.faturalar ?? []
  const columns = useMemo<ColumnDef<TripFatura>[]>(
    () => [
      {
        accessorKey: "faturaIsmi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura İsmi" />,
        cell: ({ row }) => <span className="font-medium">{row.original.faturaIsmi}</span>,
      },
      {
        accessorKey: "faturaNo",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura No" />,
        cell: ({ row }) => <span className="font-medium text-slate-600">{row.original.faturaNo}</span>,
      },
      {
        accessorKey: "mulesteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi" />,
      },
      {
        accessorKey: "kesimTarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Düzenlenme Tarihi" />,
      },
      {
        accessorKey: "vadeTarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vade Tarihi" />,
      },
      {
        accessorKey: "matrah",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Matrah" />,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.matrah)}₺</span>,
      },
      {
        accessorKey: "tevkifat",
        header: () => <span>Tevkifat</span>,
        enableSorting: false,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.tevkifat)}₺</span>,
      },
      {
        accessorKey: "kdvTutar",
        header: () => <span>KDV</span>,
        enableSorting: false,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.kdvTutar)}₺</span>,
      },
      {
        accessorKey: "toplamTutar",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
        cell: ({ row }) => <span className="tabular-nums font-semibold">{fmt(row.original.toplamTutar)}₺</span>,
      },
      {
        accessorKey: "odenenTutar",
        header: () => <span>Ödenen</span>,
        enableSorting: false,
        cell: ({ row }) => <span className="tabular-nums">{fmt(row.original.odenenTutar)}₺</span>,
      },
      {
        accessorKey: "kalanTutar",
        header: () => <span>Kalan</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const kalan = row.original.kalanTutar
          return (
            <span className={cn("tabular-nums font-medium", kalan > 0 ? "text-rose-600" : "text-slate-700")}>
              {fmt(kalan)}₺
            </span>
          )
        },
      },
      {
        accessorKey: "kategori",
        header: () => <span>Kategori</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-md border-slate-200 text-xs font-medium text-slate-600">
            {row.original.kategori}
          </Badge>
        ),
      },
      {
        accessorKey: "etiketler",
        header: () => <span>Etiket</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.etiketler.map((e) => (
              <Badge key={e} variant="secondary" className="rounded-md text-[10px] font-medium">
                {e}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "durum",
        header: () => <span>Durum</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const cfg = faturaDurumConfig[row.original.durum]
          return <Badge className={cn("rounded-md border text-xs whitespace-nowrap", cfg.cls)}>{cfg.label}</Badge>
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        size: 120,
        cell: () => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                  İşlemler
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
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
    <div className="space-y-3">
      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <DataTable
            data={faturalar}
            columns={columns}
            enableSorting
            enableHorizontalScroll
            className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
            emptyMessage="Henüz bu seferle eşleştirilmiş fatura bulunmamaktadır."
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Ana Tab Component ─── */

type FinanceSubTab = "gider" | "faturalar"

export function TripTabFinance({ data }: { data: TripDetailRecord }) {
  const [activeTab, setActiveTab] = useState<FinanceSubTab>("gider")

  const tabs: { key: FinanceSubTab; label: string; icon: React.ReactNode }[] = [
    { key: "gider", label: "Gider", icon: <Coins className="mr-1.5 size-3.5" /> },
    { key: "faturalar", label: "Faturalar", icon: <FileText className="mr-1.5 size-3.5" /> },
  ]

  return (
    <div className="space-y-3">
      <div className="grid h-10 w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-colors hover:bg-slate-50 hover:text-slate-900",
              activeTab === tab.key
                ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                : "text-slate-700",
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "gider" && <GiderTab data={data} />}
      {activeTab === "faturalar" && <FaturalarTab data={data} />}
    </div>
  )
}
