"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Coins,
  Eye,
  FileText,
  Filter,
  History,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react"
import type { BranchCashItem, PaymentType } from "../../../../branch-transfer-center/branch-cash/_types"
import type { IncomingBankTransactionMatchCandidate } from "../../../../headquarters/bank-accounts/_api/bank-accounts-api"
import {
  approveQueueTransferManually,
  fetchManualApprovalCandidates,
} from "../../../approval-queue/_api/approval-queue-api"
import { ApprovalQueueDetailModal } from "../../../approval-queue/_components/approval-queue-detail-modal"
import { ManualApprovalModal } from "../../../approval-queue/_components/manual-approval-modal"
import type { ApprovalQueueRecord } from "../../../approval-queue/_types"
import type { GmBranchCashDetail, GmBranchCashNote, GmBranchCashTransferHistoryRow } from "../../_types"
import { getGmBranchCashInfoColumns } from "../_columns/gm-branch-cash-info-columns"
import { getGmBranchTransferHistoryColumns } from "../_columns/gm-branch-transfer-history-columns"
import { GmBranchNoteModal } from "./gm-branch-note-modal"

interface Props {
  branch: GmBranchCashDetail
  cashItems: BranchCashItem[]
  transfers: GmBranchCashTransferHistoryRow[]
  notes: GmBranchCashNote[]
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(date?: string): string {
  if (!date) return "-"
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

const transferCenterByBranchId: Record<string, string> = {
  "istanbul-avrupa-merkez": "Avrupa TM",
  "izmir-merkez": "Ege TM",
  "v-lojistik": "Anadolu TM",
  "konya-merkez": "İç Anadolu TM",
}

const phoneByBranchId: Record<string, string> = {
  "istanbul-avrupa-merkez": "0212 444 10 10",
  "izmir-merkez": "0232 444 20 20",
  "v-lojistik": "0312 444 30 30",
  "konya-merkez": "0332 444 40 40",
}

const noteCategoryConfig: Record<GmBranchCashNote["category"], { label: string; className: string }> = {
  genel: { label: "Genel", className: "border-slate-200 bg-slate-50 text-slate-600" },
  operasyon: { label: "Operasyon", className: "border-blue-200 bg-blue-50 text-blue-700" },
  finans: { label: "Finans", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  teknik: { label: "Teknik", className: "border-amber-200 bg-amber-50 text-amber-700" },
  diger: { label: "Diğer", className: "border-violet-200 bg-violet-50 text-violet-700" },
}

const cashStatusFilterOptions = [
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "Bekliyor", value: "bekliyor" },
  { label: "İptal", value: "iptal" },
]

export function GmBranchCashDetailPageContent({ branch, cashItems, transfers, notes }: Props) {
  const [cashTable, setCashTable] = useState<TanStackTable<BranchCashItem> | null>(null)
  const [transferTable, setTransferTable] = useState<TanStackTable<GmBranchCashTransferHistoryRow> | null>(null)
  const [branchNotes, setBranchNotes] = useState<GmBranchCashNote[]>(notes)
  const [transferRows, setTransferRows] = useState<GmBranchCashTransferHistoryRow[]>(transfers)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<ApprovalQueueRecord | null>(null)
  const [manualApprovalOpen, setManualApprovalOpen] = useState(false)
  const [selectedTransferRow, setSelectedTransferRow] = useState<ApprovalQueueRecord | null>(null)
  const [manualCandidates, setManualCandidates] = useState<IncomingBankTransactionMatchCandidate[]>([])
  const [manualLoading, setManualLoading] = useState(false)
  const [approvalMetaById, setApprovalMetaById] = useState<
    Record<
      string,
      Pick<
        ApprovalQueueRecord,
        "manuelOnaylayanKullanici" | "matchedBankTransactionId" | "matchedBankAccountId" | "matchedBankAccountLabel"
      >
    >
  >({})
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [cashPaymentFilter, setCashPaymentFilter] = useState<"all" | PaymentType>("all")
  const [showCashFilters, setShowCashFilters] = useState(false)

  const cashColumns = useMemo(() => getGmBranchCashInfoColumns(), [])
  const toApprovalRecord = (row: GmBranchCashTransferHistoryRow): ApprovalQueueRecord => ({
    id: row.id,
    branchId: row.branchId,
    transferNo: row.transferNo,
    branchName: row.branchName,
    iban: row.iban,
    sorguNo: row.sorguNo,
    transferTutari: row.transferTutari,
    durum: row.durum,
    l1: row.l1,
    l2: row.l2,
    l3: row.l3,
    talepTarihi: row.talepTarihi,
    onayTarihi: row.onayTarihi,
    aciklama: row.aciklama,
    olusturanKullanici: row.olusturanKullanici,
    ...approvalMetaById[row.id],
  })

  const transferColumns = useMemo(
    () =>
      getGmBranchTransferHistoryColumns(
        (row) => {
          setDetailRow(toApprovalRecord(row))
          setDetailOpen(true)
        },
        (row) => {
          void (async () => {
            if (row.durum !== "beklemede") {
              return
            }

            const approvalRow = toApprovalRecord(row)
            setSelectedTransferRow(approvalRow)
            setManualCandidates([])
            setManualApprovalOpen(true)
            setManualLoading(true)

            try {
              const candidates = await fetchManualApprovalCandidates(approvalRow.sorguNo)
              const normalizedRef = approvalRow.sorguNo.trim().toLocaleUpperCase("tr-TR").replace(/[^0-9A-Z]/g, "")
              setManualCandidates(
                candidates.filter(
                  (candidate) =>
                    (candidate.referenceNumber ?? "").trim().toLocaleUpperCase("tr-TR").replace(/[^0-9A-Z]/g, "") ===
                    normalizedRef,
                ),
              )
            } finally {
              setManualLoading(false)
            }
          })()
        },
      ),
    [approvalMetaById],
  )

  const transferStats = useMemo(() => {
    const stats = {
      total: transferRows.length,
      onaylandi: 0,
      reddedildi: 0,
      yarida_birakildi: 0,
      dogrulama_hatasi: 0,
      beklemede: 0,
    }

    transferRows.forEach((transfer) => {
      stats[transfer.durum] += 1
    })

    return stats
  }, [transferRows])

  const pendingTransfers = useMemo(
    () => transferRows.filter((transfer) => transfer.durum === "beklemede"),
    [transferRows],
  )

  const pendingTransferTotal = useMemo(
    () => pendingTransfers.reduce((sum, transfer) => sum + transfer.transferTutari, 0),
    [pendingTransfers],
  )

  const filteredCashItems = useMemo(() => {
    return cashItems.filter((item) => {
      const paymentTypeMatches = cashPaymentFilter === "all" || item.paymentType === cashPaymentFilter
      return paymentTypeMatches
    })
  }, [cashItems, cashPaymentFilter])

  const toplamAlacak = useMemo(
    () => cashItems.reduce((sum, item) => sum + item.amount, 0),
    [cashItems],
  )

  const transferCenterName = transferCenterByBranchId[branch.branchId] ?? "Merkez TM"
  const branchPhone = phoneByBranchId[branch.branchId] ?? "-"

  const visibleNotes = useMemo(
    () => [...branchNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [branchNotes],
  )

  const addNote = (data: Pick<GmBranchCashNote, "category" | "visibility" | "content">) => {
    const newNote: GmBranchCashNote = {
      id: `note-${Date.now()}`,
      branchId: branch.branchId,
      category: data.category,
      visibility: data.visibility,
      content: data.content,
      createdAt: new Date().toISOString(),
      createdBy: "gm.finance",
      createdByName: "Mevcut Kullanıcı",
      createdByRole: "Genel Merkez Finans",
      sourceName: "Genel Merkez",
    }

    setBranchNotes((prev) => [newNote, ...prev])
  }

  const deleteNote = (noteId: string) => {
    if (!window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      return
    }

    setBranchNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  return (
    <>
      <GmBranchNoteModal open={noteModalOpen} onOpenChange={setNoteModalOpen} onAdd={addNote} />
      <ApprovalQueueDetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) {
            setDetailRow(null)
          }
        }}
        row={detailRow}
      />
      <ManualApprovalModal
        open={manualApprovalOpen}
        onOpenChange={(open) => {
          setManualApprovalOpen(open)
          if (!open) {
            setSelectedTransferRow(null)
            setManualCandidates([])
          }
        }}
        row={selectedTransferRow}
        candidates={manualCandidates}
        loading={manualLoading}
        onConfirm={async (candidate) => {
          if (!selectedTransferRow) {
            return
          }

          const updated = await approveQueueTransferManually({
            approvalQueueId: selectedTransferRow.id,
            transaction: candidate,
          })

          if (!updated) {
            return
          }

          setTransferRows((prev) =>
            prev.map((item) =>
              item.id === updated.id
                ? {
                    ...item,
                    durum: updated.durum,
                    onayTarihi: updated.onayTarihi,
                    aciklama: updated.aciklama,
                  }
                : item,
            ),
          )

          setApprovalMetaById((prev) => ({
            ...prev,
            [updated.id]: {
              manuelOnaylayanKullanici: updated.manuelOnaylayanKullanici,
              matchedBankTransactionId: updated.matchedBankTransactionId,
              matchedBankAccountId: updated.matchedBankAccountId,
              matchedBankAccountLabel: updated.matchedBankAccountLabel,
            },
          }))

          setDetailRow(updated)
        }}
      />

      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Genel Merkez", href: "/arf/cargo/finance/head-office" },
          { label: "Satışlar" },
          { label: "Şube Kasaları", href: "/arf/cargo/finance/head-office/branch-cashes" },
          { label: branch.branchName },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-4">
        <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="space-y-5 bg-[linear-gradient(145deg,rgba(255,255,255,1),rgba(248,250,252,0.95))] p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{branch.branchName}</h1>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Aktif</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    <UserRound className="size-3.5 text-slate-500" />
                    Şube Sorumlusu: {branch.hesapSorumlusu}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    <Building2 className="size-3.5 text-slate-500" />
                    Bağlı Transfer Merkezi: {transferCenterName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                    <Phone className="size-3.5 text-slate-500" />
                    Şube Telefonu: {branchPhone}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 bg-white px-4">
                  <Link href="/arf/cargo/settings/branches">
                    <Eye className="mr-2 size-4" />
                    Şube Detayı Gör
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 bg-white px-4">
                  <Link href="/arf/cargo/finance/head-office/branch-cashes">
                    <ArrowLeft className="mr-2 size-4" />
                    Listeye Dön
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl border-slate-200/90 bg-white shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium tracking-wide text-slate-500">Toplam Alacak</p>
                    <span className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                      <Coins className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{formatMoney(toplamAlacak)}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/90 bg-white shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium tracking-wide text-slate-500">Onay Bekleyen Transfer</p>
                    <span className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                      <Wallet className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{pendingTransfers.length}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/90 bg-white shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium tracking-wide text-slate-500">Onay Bekleyen Transfer Toplamı</p>
                    <span className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                      <Coins className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{formatMoney(pendingTransferTotal)}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/90 bg-white shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium tracking-wide text-slate-500">Son Transfer Tarihi</p>
                    <span className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                      <CalendarClock className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(branch.sonTransferTarihi)}</p>
                </CardContent>
              </Card>

            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="cash-info" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="cash-info" className="gap-1.5 text-xs">
              <Wallet className="size-3.5" />
              Şube Kasası
            </TabsTrigger>
            <TabsTrigger value="transfer-history" className="gap-1.5 text-xs">
              <History className="size-3.5" />
              Transfer Geçmişi
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 text-xs">
              <FileText className="size-3.5" />
              Notlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash-info">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={cashPaymentFilter === "all" ? "default" : "outline"}
                      className="h-8 rounded-lg px-3"
                      onClick={() => setCashPaymentFilter("all")}
                    >
                      Tümü
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={cashPaymentFilter === "alici_odemeli" ? "default" : "outline"}
                      className="h-8 rounded-lg px-3"
                      onClick={() => setCashPaymentFilter("alici_odemeli")}
                    >
                      Alıcı Ödemeli
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={cashPaymentFilter === "pesin" ? "default" : "outline"}
                      className="h-8 rounded-lg px-3"
                      onClick={() => setCashPaymentFilter("pesin")}
                    >
                      Peşin Ödemeli
                    </Button>
                  </div>

                  {cashTable && (
                    <div className="flex items-center gap-2">
                      {!showCashFilters && (
                        <DataTableExcelActions
                          table={cashTable}
                          filename={`${branch.branchId}-sube-kasa-bilgisi`}
                          exportSelected={false}
                          exportLabel="Dışarı Aktar"
                        />
                      )}

                      <DataTableToolbar
                        table={cashTable}
                        showColumnSelector={!showCashFilters}
                        viewLabel="Görünüm"
                        columnsLabel="Sütunlar"
                        resetLabel="Sıfırla"
                      >
                        <Button
                          type="button"
                          variant={showCashFilters ? "default" : "outline"}
                          size="sm"
                          className="mr-2 h-8"
                          onClick={() => setShowCashFilters((prev) => !prev)}
                        >
                          <Filter className="mr-2 size-4" />
                          Filtreler
                        </Button>

                        {showCashFilters && (
                          <div className="flex flex-wrap items-center gap-2">
                            {cashTable.getColumn("paymentType") && (
                              <DataTableFacetedFilter
                                column={cashTable.getColumn("paymentType")}
                                title="Ödeme Türü"
                                options={[
                                  { label: "Alıcı Ödemeli", value: "alici_odemeli" },
                                  { label: "Peşin", value: "pesin" },
                                ]}
                              />
                            )}

                            {cashTable.getColumn("status") && (
                              <DataTableFacetedFilter
                                column={cashTable.getColumn("status")}
                                title="Kargo Durumu"
                                options={cashStatusFilterOptions}
                              />
                            )}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                setCashPaymentFilter("all")
                                cashTable.resetColumnFilters()
                              }}
                            >
                              Filtreleri Sıfırla
                            </Button>
                          </div>
                        )}
                      </DataTableToolbar>
                    </div>
                  )}
                </div>

                <DataTable
                  data={filteredCashItems}
                  columns={cashColumns}
                  onTableReady={setCashTable}
                  emptyMessage="Bu şube için kasa verisi bulunmuyor."
                  stickyFirstColumn
                  stickyLastColumn
                  enableHorizontalScroll
                />
                {cashTable && <DataTablePagination table={cashTable as TanStackTable<unknown>} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer-history">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">Toplam: {transferStats.total}</Badge>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Onaylandı: {transferStats.onaylandi}</Badge>
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Reddedildi: {transferStats.reddedildi}</Badge>
                  <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">Yarıda Bırakılan: {transferStats.yarida_birakildi}</Badge>
                  <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">L1-L2-L3 Hatası: {transferStats.dogrulama_hatasi}</Badge>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Bekleyen: {transferStats.beklemede}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataTable
                  data={transferRows}
                  columns={transferColumns}
                  onTableReady={setTransferTable}
                  emptyMessage="Transfer hareketi bulunmuyor."
                  stickyFirstColumn
                  stickyLastColumn
                  enableHorizontalScroll
                />
                {transferTable && <DataTablePagination table={transferTable as TanStackTable<unknown>} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MessageSquare className="size-4 text-slate-400" />
                  Notlar
                  {visibleNotes.length > 0 && (
                    <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
                      {visibleNotes.length}
                    </span>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-lime-400 px-4 text-xs text-slate-900 hover:bg-lime-300"
                  onClick={() => setNoteModalOpen(true)}
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Not Ekle
                </Button>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {visibleNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                    <MessageSquare className="size-8" />
                    <p className="text-sm">Henüz not eklenmemiş</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleNotes.map((note) => {
                      const category = noteCategoryConfig[note.category]
                      return (
                        <article key={note.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={cn("border", category.className)}>
                                {category.label}
                              </Badge>
                              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                                {note.visibility === "internal" ? "Sadece Genel Merkez Görür" : "Herkes Görür"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>{formatDateTime(note.createdAt)}</span>
                              <button
                                type="button"
                                className="text-slate-400 transition-colors hover:text-red-600"
                                onClick={() => deleteNote(note.id)}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-700">{note.content}</p>

                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{note.createdByName}</span>
                            <span>{note.createdByRole}</span>
                            <span>{note.sourceName}</span>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
