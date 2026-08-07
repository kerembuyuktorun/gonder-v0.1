"use client"

import { type ChangeEvent, useMemo, useState, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, createSelectionColumn } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Plus, LinkIcon, ChevronDown, FileText, Eye } from "lucide-react"
import { FinanceExpenseDialog } from "../../../_shared/finance/FinanceExpenseDialog"
import { CreateTransportInvoiceModal } from "../../../marketing/customers/[customerId]/_components/create-transport-invoice-modal"
import type { CreateInvoicePayload, InvoiceCustomerInfo } from "../../../marketing/customers/[customerId]/_types/financial"
import type {
  GelirKalemi,
  GelirFaturaDurumu,
  GiderKalemi,
  GiderFaturaDurumu,
  TasimaFatura,
  TasimaDetayRecord,
  GelirGiderDurum,
  FaturaDurum,
  FaturaTipi,
} from "../_types/transport-detail"

/* ─── Helpers ─── */

const fmt = (v: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

const tahsilatConfig: Record<GelirGiderDurum, { label: string; cls: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  odendi: { label: "Ödendi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  bekliyor: { label: "Bekliyor", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  gecikti: { label: "Gecikti", cls: "border-rose-200 bg-rose-50 text-rose-700" },
}

const faturaDurumuConfig: Record<GelirFaturaDurumu, { label: string; cls: string }> = {
  olusturuldu: { label: "Oluşturuldu", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  olusturulmadi: { label: "Oluşturulmadı", cls: "border-slate-200 bg-slate-50 text-slate-600" },
}

const giderFaturaDurumuConfig: Record<GiderFaturaDurumu, { label: string; cls: string }> = {
  eslestirildi: { label: "Eşleştirildi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  eslestirilmedi: { label: "Eşleştirilmedi", cls: "border-slate-200 bg-slate-50 text-slate-600" },
}

const faturaDurumConfig: Record<FaturaDurum, { label: string; cls: string }> = {
  odendi: { label: "Ödendi", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  kismi: { label: "Kısmi Ödeme", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  bekliyor: { label: "Bekliyor", cls: "border-slate-200 bg-slate-50 text-slate-700" },
  gecikti: { label: "Gecikti", cls: "border-rose-200 bg-rose-50 text-rose-700" },
  iptal: { label: "İptal", cls: "border-slate-200 bg-slate-100 text-slate-500" },
}

const faturaTipiConfig: Record<FaturaTipi, { label: string; cls: string }> = {
  satis: { label: "Satış Faturası", cls: "border-violet-200 bg-violet-50 text-violet-700" },
  alis: { label: "Alış Faturası", cls: "border-blue-200 bg-blue-50 text-blue-700" },
  tedarikci: { label: "Tedarikçi Faturası", cls: "border-orange-200 bg-orange-50 text-orange-700" },
}

/* ─── Özet Kartı ─── */

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", color)}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  )
}

/* ─── Tevkifat Seçenekleri ─── */

const tevkifatSecenekleri = [
  { value: "yok", label: "Yok" },
  { value: "2/10", label: "2/10" },
]

const kdvSecenekleri = [
  { value: "0", label: "%0" },
  { value: "1", label: "%1" },
  { value: "10", label: "%10" },
  { value: "20", label: "%20" },
]

/* ─── Form Field Helper ─── */

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  )
}

/* ─── Gelir Ekle Dialog ─── */

function GelirEkleDialog({ open, onOpenChange, faturaMusteri }: { open: boolean; onOpenChange: (v: boolean) => void; faturaMusteri: string }) {
  const [aciklama, setAciklama] = useState("")
  const [tarih, setTarih] = useState("")
  const [birimFiyat, setBirimFiyat] = useState("")
  const [tevkifat, setTevkifat] = useState("yok")
  const [kdvOran, setKdvOran] = useState("20")

  const birim = parseFloat(birimFiyat) || 0
  const kdv = parseFloat(kdvOran) || 0
  const tevkifatParts = tevkifat !== "yok" ? tevkifat.split("/").map(Number) : null
  const tevkifatOran = tevkifatParts ? tevkifatParts[0] / tevkifatParts[1] : 0
  const kdvTutar = birim * (kdv / 100)
  const tevkifatTutar = kdvTutar * tevkifatOran
  const toplamTutar = birim + kdvTutar - tevkifatTutar

  const handleSubmit = () => {
    // TODO: Gelir kalemi kaydet
    onOpenChange(false)
  }

  const handleOpenChange = useCallback((v: boolean) => {
    if (!v) {
      setAciklama("")
      setTarih("")
      setBirimFiyat("")
      setTevkifat("yok")
      setKdvOran("20")
    }
    onOpenChange(v)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gelir Ekle</DialogTitle>
          <DialogDescription>Yeni gelir kalemi ekleyin.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <FormField label="Açıklama">
            <Input placeholder="Örn: Taşıma Ücreti" value={aciklama} onChange={(e: ChangeEvent<HTMLInputElement>) => setAciklama(e.target.value)} />
          </FormField>

          <FormField label="Müşteri">
            <Input value={faturaMusteri} disabled className="bg-slate-50 text-slate-600" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tarih">
              <Input type="date" value={tarih} onChange={(e: ChangeEvent<HTMLInputElement>) => setTarih(e.target.value)} />
            </FormField>
            <FormField label="Birim Fiyat (₺)">
              <Input type="number" min="0" step="0.01" placeholder="0,00" value={birimFiyat} onChange={(e: ChangeEvent<HTMLInputElement>) => setBirimFiyat(e.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tevkifat">
              <Select value={tevkifat} onValueChange={setTevkifat}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tevkifatSecenekleri.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="KDV Oranı">
              <Select value={kdvOran} onValueChange={setKdvOran}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kdvSecenekleri.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Hesaplanan Değerler */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">KDV Tutarı</p>
                <p className="font-semibold tabular-nums">{fmt(kdvTutar)}₺</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tevkifat Tutarı</p>
                <p className="font-semibold tabular-nums">{fmt(tevkifatTutar)}₺</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Toplam Tutar</p>
                <p className="font-bold tabular-nums text-emerald-700">{fmt(toplamTutar)}₺</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Vazgeç</Button>
          <Button onClick={handleSubmit} disabled={!aciklama || !faturaMusteri || !tarih || !birimFiyat}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Gelir Sekmesi ─── */

function GelirTab({ data }: { data: TasimaDetayRecord }) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [gelirDialogOpen, setGelirDialogOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invoiceGelirler, setInvoiceGelirler] = useState<GelirKalemi[]>([])
  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length
  const selectedTotal = useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    return data.gelirler.filter((_, i) => selectedIds.includes(String(i))).reduce((t, g) => t + g.toplamTutar, 0)
  }, [rowSelection, data.gelirler])

  const toplamMatrah = data.gelirler.reduce((t, g) => t + g.birimFiyat, 0)
  const toplamKdv = data.gelirler.reduce((t, g) => t + g.kdvTutar, 0)
  const toplamTevkifat = data.gelirler.reduce((t, g) => t + g.tevfikatTutar, 0)
  const genelToplam = data.gelirler.reduce((t, g) => t + g.toplamTutar, 0)

  const openInvoiceForSelection = () => {
    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    const selected = data.gelirler.filter((_, i) => selectedIds.includes(String(i)))
    setInvoiceGelirler(selected)
    setInvoiceModalOpen(true)
  }

  const openInvoiceForRow = (gelir: GelirKalemi) => {
    setInvoiceGelirler([gelir])
    setInvoiceModalOpen(true)
  }

  const handleInvoiceConfirm = (payload: CreateInvoicePayload) => {
    void payload
    setInvoiceModalOpen(false)
    setRowSelection({})
  }

  const customerInfo: InvoiceCustomerInfo = {
    customerId: data.gondericiMusteri.customerId ?? "",
    customerType: data.gondericiMusteri.customerType === "corporate" ? "corporate" : "individual",
    tradeName: data.gondericiMusteri.displayName,
    taxOffice: data.gondericiMusteri.taxOffice ?? "-",
    taxNumber: data.gondericiMusteri.taxNumber ?? data.gondericiMusteri.tcIdentityNumber ?? "-",
  }

  const columns = useMemo<ColumnDef<GelirKalemi>[]>(
    () => [
      createSelectionColumn<GelirKalemi>(),
      {
        accessorKey: "aciklama",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
        cell: ({ row }) => <span className="font-medium">{row.original.aciklama}</span>,
      },
      {
        accessorKey: "musteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri" />,
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
          const cfg = faturaDurumuConfig[row.original.faturaDurumu]
          return <Badge className={cn("rounded-md border text-xs whitespace-nowrap", cfg.cls)}>{cfg.label}</Badge>
        },
      },
      {
        accessorKey: "tahsilatDurumu",
        header: () => <span>Tahsilat Durumu</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const cfg = tahsilatConfig[row.original.tahsilatDurumu]
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
          const faturaOlusturuldu = row.original.faturaDurumu === "olusturuldu"
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
                  {faturaOlusturuldu ? (
                    <DropdownMenuItem>
                      <Eye className="mr-2 size-4" />
                      Faturayı Görüntüle
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => openInvoiceForRow(row.original)}>
                      <FileText className="mr-2 size-4" />
                      Fatura Oluştur
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
        <SummaryCard label="Genel Toplam" value={`${fmt(genelToplam)}₺`} color="border-emerald-200 bg-emerald-50 text-emerald-800" />
      </div>

      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          {selectedCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-secondary/20 bg-primary/5 px-3 py-2">
              <p className="text-sm font-medium text-secondary">
                Seçili: {selectedCount} gelir kalemi – Toplam: {fmt(selectedTotal)}₺
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={openInvoiceForSelection}>
                  <FileText className="mr-2 size-4" />
                  Fatura Oluştur
                </Button>
                <Button size="sm" onClick={() => setGelirDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Gelir Ekle
                </Button>
              </div>
            </div>
          )}

          {selectedCount === 0 && (
            <div className="mb-3 flex items-center justify-end gap-2">
              <Button size="sm" onClick={() => setGelirDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                Gelir Ekle
              </Button>
            </div>
          )}

          <DataTable
            data={data.gelirler}
            columns={columns}
            enableSorting
            enableRowSelection={(row) => row.original.faturaDurumu !== "olusturuldu"}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            enableHorizontalScroll
            className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
            emptyMessage="Henüz gelir kalemi bulunmamaktadır."
          />
        </CardContent>
      </Card>
      <GelirEkleDialog open={gelirDialogOpen} onOpenChange={setGelirDialogOpen} faturaMusteri={data.gondericiMusteri.displayName} />
      <CreateTransportInvoiceModal
        mode="gelir"
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        selectedGelirler={invoiceGelirler}
        customerInfo={customerInfo}
        tasimaNo={data.tasimaNo}
        onConfirm={handleInvoiceConfirm}
      />
    </div>
  )
}

/* ─── Gider Sekmesi ─── */

function GiderTab({ data }: { data: TasimaDetayRecord }) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [giderDialogOpen, setGiderDialogOpen] = useState(false)
  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length
  const selectedTotal = useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
    return data.giderler.filter((_, i) => selectedIds.includes(String(i))).reduce((t, g) => t + g.toplamTutar, 0)
  }, [rowSelection, data.giderler])

  const toplamMatrah = data.giderler.reduce((t, g) => t + g.birimFiyat, 0)
  const toplamKdv = data.giderler.reduce((t, g) => t + g.kdvTutar, 0)
  const toplamTevkifat = data.giderler.reduce((t, g) => t + g.tevfikatTutar, 0)
  const genelToplam = data.giderler.reduce((t, g) => t + g.toplamTutar, 0)

  const gelirToplam = data.gelirler.reduce((t, g) => t + g.toplamTutar, 0)
  const kar = gelirToplam - genelToplam
  const marj = gelirToplam > 0 ? (kar / gelirToplam) * 100 : 0

  const columns = useMemo<ColumnDef<GiderKalemi>[]>(
    () => [
      createSelectionColumn<GiderKalemi>(),
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
      <div className="grid grid-cols-5 gap-3">
        <SummaryCard label="Matrah" value={`${fmt(toplamMatrah)}₺`} color="border-slate-200 bg-white text-slate-900" />
        <SummaryCard label="Tevkifat Toplam" value={`${fmt(toplamTevkifat)}₺`} color="border-slate-200 bg-white text-slate-900" />
        <SummaryCard label="KDV" value={`${fmt(toplamKdv)}₺`} color="border-slate-200 bg-white text-slate-900" />
        <SummaryCard label="Genel Toplam" value={`${fmt(genelToplam)}₺`} color="border-rose-200 bg-rose-50 text-rose-800" />
        <SummaryCard
          label="Kar / Zarar"
          value={`${kar >= 0 ? "+" : ""}${fmt(kar)}₺ (%${marj.toFixed(1)})`}
          color={kar >= 0 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}
        />
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
            data={data.giderler}
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
        supplierName={data.tedarikci.firmaAdi}
        description="Yeni gider kalemi ekleyin."
        amountPlaceholder="Örn: Köprü Geçiş Ücreti"
        includeDate
        withholdingBase="kdv"
        tevkifatOptions={tevkifatSecenekleri}
        kdvOptions={kdvSecenekleri}
      />
    </div>
  )
}

/* ─── Faturalar Sekmesi ─── */

function FaturalarTab({ data }: { data: TasimaDetayRecord }) {
  const columns = useMemo<ColumnDef<TasimaFatura>[]>(
    () => [
      {
        accessorKey: "faturaTipi",
        header: () => <span>Tip</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const cfg = faturaTipiConfig[row.original.faturaTipi]
          return <Badge className={cn("rounded-md border text-xs whitespace-nowrap", cfg.cls)}>{cfg.label}</Badge>
        },
      },
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri / Tedarikçi" />,
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
        header: () => <span>Tahsil / Ödenen</span>,
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

  const satisFaturalari = data.faturalar.filter((f) => f.faturaTipi === "satis")
  const alisFaturalari = data.faturalar.filter((f) => f.faturaTipi === "alis" || f.faturaTipi === "tedarikci")

  return (
    <div className="space-y-3">
      {data.faturalar.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label={`Satış Faturaları (${satisFaturalari.length})`}
            value={`${fmt(satisFaturalari.reduce((t, f) => t + f.toplamTutar, 0))}₺`}
            color="border-violet-200 bg-violet-50 text-violet-800"
          />
          <SummaryCard
            label={`Alış Faturaları (${alisFaturalari.length})`}
            value={`${fmt(alisFaturalari.reduce((t, f) => t + f.toplamTutar, 0))}₺`}
            color="border-blue-200 bg-blue-50 text-blue-800"
          />
        </div>
      )}

      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <DataTable
            data={data.faturalar}
            columns={columns}
            enableSorting
            enableHorizontalScroll
            className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
            emptyMessage="Henüz bu taşımayla eşleştirilmiş fatura bulunmamaktadır."
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Ana Tab Component ─── */

type FinanceSubTab = "gelir" | "gider" | "faturalar"

export function TabFinance({ data }: { data: TasimaDetayRecord }) {
  const [activeTab, setActiveTab] = useState<FinanceSubTab>("gelir")

  const tabs: { key: FinanceSubTab; label: string }[] = [
    { key: "gelir", label: "Gelir" },
    { key: "gider", label: "Gider" },
    { key: "faturalar", label: "Faturalar" },
  ]

  return (
    <div className="space-y-3">
      <div className="grid h-10 w-full grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "rounded-lg border border-transparent text-sm font-medium transition-colors hover:bg-slate-50 hover:text-slate-900",
              activeTab === tab.key
                ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                : "text-slate-700",
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "gelir" && <GelirTab data={data} />}
      {activeTab === "gider" && <GiderTab data={data} />}
      {activeTab === "faturalar" && <FaturalarTab data={data} />}
    </div>
  )
}
