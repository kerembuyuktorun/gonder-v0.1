"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowDownLeft, ChevronRight } from "lucide-react"
import type { FinancialExstreRecord, InvoicePaymentStatus, TransactionMatchStatus, TransactionMatchSource } from "../_types/financial"

/* ── Formatters ─────────────────────────────────────────────── */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

const formatDate = (iso?: string) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

/* ── Status & Type configs ──────────────────────────────────── */

const statusConfig: Record<InvoicePaymentStatus, { label: string; className: string }> = {
  odendi: { label: "Tahsil Edildi", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  bekliyor: { label: "Bekliyor", className: "border-amber-200 bg-amber-50 text-amber-700" },
  kismi: { label: "Kısmi Ödeme", className: "border-blue-200 bg-blue-50 text-blue-700" },
  gecikti: { label: "Gecikti", className: "border-rose-200 bg-rose-50 text-rose-700" },
  reddedildi: { label: "Reddedildi", className: "border-red-200 bg-red-50 text-red-700" },
  iade: { label: "İade", className: "border-purple-200 bg-purple-50 text-purple-700" },
  iptal: { label: "İptal", className: "border-slate-200 bg-slate-100 text-slate-500" },
}

const typeLabel: Record<string, { label: string; className: string }> = {
  fatura: { label: "Fatura", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  gelen_odeme: { label: "Tahsilat", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
}

const matchStatusLabel: Record<TransactionMatchStatus, { label: string; className: string }> = {
  unmatched: { label: "Bekliyor", className: "border-amber-200 bg-amber-50 text-amber-700" },
  auto_matched: { label: "Otomatik", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  manual_matched: { label: "Manuel", className: "border-blue-200 bg-blue-50 text-blue-700" },
}

const matchSourceLabel: Record<TransactionMatchSource, string> = {
  branch_transfer: "Şube Transferi",
  customer_invoice: "Müşteri Faturası",
  supplier_payment: "Tedarikçi Ödemesi",
}

/* ── Column definitions (ortak sütunlar) ────────────────────── */

export const invoicesColumns: ColumnDef<FinancialExstreRecord>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          row.toggleExpanded()
        }}
        className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100"
      >
        <ChevronRight
          className={cn(
            "size-4 text-slate-500 transition-transform duration-200",
            row.getIsExpanded() && "rotate-90",
          )}
        />
      </button>
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Tipi" />,
    filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
    cell: ({ row }) => {
      const cfg = typeLabel[row.original.type]
      return cfg ? (
        <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
      ) : <span>{row.original.type}</span>
    },
  },
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Belge No" />,
    cell: ({ row }) => {
      if (row.original.type === "fatura" && row.original.invoiceId) {
        return (
          <Link
            href={`/arf/cargo/finance/headquarters/invoices/${row.original.invoiceId}`}
            className="font-mono text-sm font-medium text-slate-900 hover:text-blue-700"
          >
            {row.original.invoiceNo}
          </Link>
        )
      }
      return <span className="font-mono text-sm">{row.original.invoiceNo}</span>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tarih" />,
    cell: ({ row }) => (
      <span className="text-sm text-slate-700">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama / Fatura İsmi" />,
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate text-sm text-slate-600">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tutar" />,
    cell: ({ row }) => {
      const isTahsilat = row.original.type === "gelen_odeme"
      return (
        <div className="flex items-center gap-1.5">
          {isTahsilat ? (
            <ArrowDownLeft className="size-3.5 text-emerald-500" />
          ) : null}
          <span className={cn("text-sm font-semibold tabular-nums", isTahsilat ? "text-emerald-700" : "text-slate-900")}>
            {isTahsilat ? "+" : ""}{formatCurrency(row.original.amount)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "remainingBalance",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kalan Bakiye" />,
    cell: ({ row }) => {
      const value = row.original.remainingBalance
      const isTahsilat = row.original.type === "gelen_odeme"
      if (isTahsilat) {
        return <span className="text-sm text-slate-400">—</span>
      }
      // fatura
      return (
        <span className={cn("text-sm font-medium tabular-nums", value > 0 ? "text-rose-600" : "text-emerald-600")}>
          {formatCurrency(value)}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
    filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status]
      const isTahsilat = row.original.type === "gelen_odeme"
      const statusLabel = isTahsilat
        ? row.original.status === "odendi" ? "Tamamlandı"
          : row.original.status === "kismi" ? "Kısmi Tahsilat"
          : row.original.status === "bekliyor" ? "Bekleniyor"
          : cfg?.label ?? row.original.status
        : cfg?.label ?? row.original.status
      return cfg ? (
        <Badge variant="outline" className={cn("text-xs", cfg.className)}>{statusLabel}</Badge>
      ) : <span>{row.original.status}</span>
    },
  },
]

/* ── Detay helper (satır genişletildiğinde) ─────────────────── */

function DetailItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value || "—"}</p>
    </div>
  )
}

export function InvoiceExpandedRow({ row }: { row: FinancialExstreRecord }) {
  if (row.type === "fatura") {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Fatura Detayı</p>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <DetailItem label="Fatura İsmi" value={row.invoiceName} />
          <DetailItem label="Müşteri" value={row.customerName} />
          <DetailItem label="Düzenlenme Tarihi" value={formatDate(row.issueDate)} />
          <DetailItem label="Vade Tarihi" value={formatDate(row.dueDate)} />
          <DetailItem label="Matrah" value={row.subTotal != null ? formatCurrency(row.subTotal) : "—"} />
          <DetailItem label="KDV" value={row.vatTotal != null ? formatCurrency(row.vatTotal) : "—"} />
          <DetailItem label="Toplam" value={row.grandTotal != null ? formatCurrency(row.grandTotal) : "—"} />
          <DetailItem label="Tahsil" value={
            <span className="text-emerald-700">{row.paidTotal != null ? formatCurrency(row.paidTotal) : "—"}</span>
          } />
          <DetailItem label="Kategori" value={
            row.categoryLabel ? (
              <Badge variant="outline" className="border-slate-200 bg-white text-xs text-slate-700">{row.categoryLabel}</Badge>
            ) : "—"
          } />
          <DetailItem label="Etiketler" value={
            row.tagLabels && row.tagLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.tagLabels.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-blue-200 bg-blue-50 text-[11px] text-blue-700">{tag}</Badge>
                ))}
              </div>
            ) : "—"
          } />
          {row.invoiceId && (
            <DetailItem label="İşlem" value={
              <Link
                href={`/arf/cargo/finance/headquarters/invoices/${row.invoiceId}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Fatura Detayına Git →
              </Link>
            } />
          )}
        </div>
      </div>
    )
  }

  // gelen_odeme – Tahsilat (banka hareketi) detayı
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-6 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-500">Tahsilat Detayı</p>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <DetailItem label="Gönderen" value={row.senderName} />
        <DetailItem label="Gönderen IBAN" value={
          row.senderIban ? <span className="font-mono text-xs">{row.senderIban}</span> : "—"
        } />
        <DetailItem label="Alıcı" value={row.recipientName} />
        <DetailItem label="Alıcı IBAN" value={
          row.recipientIban ? <span className="font-mono text-xs">{row.recipientIban}</span> : "—"
        } />
        <DetailItem label="Referans No" value={
          row.referenceNumber ? <span className="font-mono text-sm">{row.referenceNumber}</span> : "—"
        } />
        <DetailItem label="Yön" value={
          row.direction === "credit" ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Giriş</Badge>
          ) : row.direction === "debit" ? (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Çıkış</Badge>
          ) : "—"
        } />
        <DetailItem label="Eşleştirme" value={
          row.matchStatus ? (
            <Badge variant="outline" className={cn("text-xs", matchStatusLabel[row.matchStatus]?.className)}>
              {matchStatusLabel[row.matchStatus]?.label}
            </Badge>
          ) : "—"
        } />
        <DetailItem label="Eşleşme Kaynağı" value={
          row.matchSource ? matchSourceLabel[row.matchSource] : "—"
        } />
        {row.matchedEntityLabel && (
          <DetailItem label="Eşleşen Kayıt" value={row.matchedEntityLabel} />
        )}
      </div>
    </div>
  )
}
