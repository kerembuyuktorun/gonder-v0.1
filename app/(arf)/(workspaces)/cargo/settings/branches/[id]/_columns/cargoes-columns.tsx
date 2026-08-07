"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ArrowRightLeft,
  Ban,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Package,
  Truck,
} from "lucide-react"
import type { BranchCargoRecord, CargoStatus } from "../_types"

const directionConfig = {
  gonderici: {
    label: "Gönderici",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  alici: {
    label: "Alıcı",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
} satisfies Record<BranchCargoRecord["yon"], { label: string; className: string }>

const kargoStatusConfig: Record<CargoStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  olusturuldu: { label: "Oluşturuldu", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  transfer_surecinde: { label: "Transfer Sürecinde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  varis_subede: { label: "Varış Şubede", className: "bg-amber-500/10 text-amber-700 border-amber-500/20", icon: Building2 },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  devredildi: { label: "Devredildi", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20", icon: ArrowRightLeft },
  iptal_edildi: { label: "Kargo İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Ban },
  iade: { label: "İade", className: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: Package },
}

const faturaStatusConfig: Record<string, { label: string; className: string }> = {
  kesildi: { label: "Kesildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  kesilmedi: { label: "Kesilmedi", className: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
}

const tahsilatStatusConfig: Record<string, { label: string; className: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  beklemede: { label: "Beklemede", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  iptal: { label: "İptal", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

const arrayFilterFn = (row: { getValue: (id: string) => unknown }, id: string, value: string[]) =>
  value.includes(String(row.getValue(id) ?? ""))

export const cargoesColumns: ColumnDef<BranchCargoRecord>[] = [
  {
    accessorKey: "takipNo",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
    cell: ({ row }) => (
      <Link
        href={`/arf/cargo/shipments?search=${row.original.takipNo}`}
        className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
      >
        {row.original.takipNo}
      </Link>
    ),
  },
  {
    accessorKey: "yon",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Yön" />,
    cell: ({ row }) => {
      const config = directionConfig[row.original.yon]
      return (
        <Badge variant="outline" className={cn("border", config.className)}>
          {config.label}
        </Badge>
      )
    },
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "gondericiAdSoyad",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Müşteri" />,
  },
  {
    accessorKey: "gondericiSubeAdi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Şube" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.gondericiSubeAdi || "—"}</span>,
  },
  {
    accessorKey: "aliciSubeAdi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.aliciSubeAdi || "—"}</span>,
  },
  {
    accessorKey: "aliciAdSoyad",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Müşteri" />,
  },
  {
    accessorKey: "aliciTelefon",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Telefon" />,
    cell: ({ row }) => <span className="tabular-nums">{row.original.aliciTelefon || "—"}</span>,
  },
  {
    accessorKey: "odemeTuru",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.odemeTuru || "—"}</span>,
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "faturaTuru",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.faturaTuru || "—"}</span>,
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "matrah",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Matrah (Fiyat)" />,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.matrah != null
          ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.matrah)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "kdv",
    header: ({ column }) => <DataTableColumnHeader column={column} title="KDV (%20)" />,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.kdv != null
          ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.kdv)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "toplam",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.toplam)}
      </span>
    ),
  },
  {
    accessorKey: "tAdet",
    header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
    cell: ({ row }) => <span className="tabular-nums">{row.original.tAdet ?? "—"}</span>,
  },
  {
    accessorKey: "tDesi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
    cell: ({ row }) => <span className="tabular-nums">{row.original.tDesi ?? "—"}</span>,
  },
  {
    accessorKey: "parcaListesi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Listesi" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.parcaListesi || "—"}</span>,
  },
  {
    accessorKey: "irsaliyeNo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İrsaliye No" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.irsaliyeNo || "—"}</span>,
  },
  {
    accessorKey: "atfNo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ATF No" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.atfNo || "—"}</span>,
  },
  {
    accessorKey: "tarih",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.tarih}</span>,
    filterFn: (row, id, value: { from?: string; to?: string }) => {
      const { from, to } = value ?? {}
      if (!from && !to) return true
      const dateOnly = String(row.getValue(id) ?? "").split("T")[0] ?? ""
      if (!dateOnly) return false
      if (from && dateOnly < from) return false
      if (to && dateOnly > to) return false
      return true
    },
  },
  {
    accessorKey: "sonIslemZamani",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.sonIslemZamani || "—"}</span>,
  },
  {
    accessorKey: "varisTarihi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Zamanı" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.varisTarihi || "—"}</span>,
  },
  {
    accessorKey: "teslimTarihi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.teslimTarihi || "—"}</span>,
  },
  {
    accessorKey: "durum",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
    cell: ({ row }) => {
      const status = kargoStatusConfig[row.original.durum]
      const StatusIcon = status?.icon ?? Package
      return (
        <Badge variant="outline" className={cn("border", status?.className)}>
          <StatusIcon className="mr-1.5 size-3" />
          {status?.label ?? row.original.durum}
        </Badge>
      )
    },
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "parcaDurumu",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.parcaDurumu || "—"}</span>,
  },
  {
    accessorKey: "faturaDurumu",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
    cell: ({ row }) => {
      const status = faturaStatusConfig[row.original.faturaDurumu ?? ""]
      if (!status) return <span className="text-muted-foreground">—</span>
      return (
        <Badge variant="outline" className={cn("border", status.className)}>
          {status.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tahsilatDurumu",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tahsilat Durumu" />,
    cell: ({ row }) => {
      const status = tahsilatStatusConfig[row.original.tahsilatDurumu ?? ""]
      if (!status) return <span className="text-muted-foreground">—</span>
      return (
        <Badge variant="outline" className={cn("border", status.className)}>
          {status.label}
        </Badge>
      )
    },
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "olusturan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturan || "—"}</span>,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">İşlemler</span>,
    enableSorting: false,
    enableHiding: false,
    size: 120,
    minSize: 104,
    maxSize: 136,
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
            <DropdownMenuLabel>{`Takip No ${row.original.takipNo} İşlemler:`}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/arf/cargo/shipments?search=${row.original.takipNo}`}>
                <Eye className="mr-2 size-4" />
                Detay Görüntüle
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
