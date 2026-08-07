"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"
import { getApprovalQueueColumns } from "../_columns/approval-queue-columns"
import type { ApprovalQueueRecord } from "../_types"
import {
  approveQueueTransferManually,
  fetchManualApprovalCandidates,
} from "../_api/approval-queue-api"
import type { IncomingBankTransactionMatchCandidate } from "../../../headquarters/bank-accounts/_api/bank-accounts-api"
import { ManualApprovalModal } from "./manual-approval-modal"
import { ApprovalQueueDetailModal } from "./approval-queue-detail-modal"

interface Props {
  data: ApprovalQueueRecord[]
}

function matchesSearch(row: ApprovalQueueRecord, query: string): boolean {
  const normalizedQuery = query.toLocaleLowerCase("tr-TR")
  return [row.transferNo, row.sorguNo, row.branchName, row.olusturanKullanici]
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .includes(normalizedQuery)
}

function normalizeReference(value?: string): string {
  return (value ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/[^0-9A-Z]/g, "")
}

const statusOptions = [
  { label: "Beklemede", value: "beklemede" },
  { label: "Onaylandı", value: "onaylandi" },
  { label: "Reddedildi", value: "reddedildi" },
  { label: "Yarıda Bırakılan", value: "yarida_birakildi" },
  { label: "L1-L2-L3 Hatası", value: "dogrulama_hatasi" },
]

export function ApprovalQueueTableSection({ data }: Props) {
  const [rows, setRows] = useState<ApprovalQueueRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<ApprovalQueueRecord> | null>(null)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [showFilters, setShowFilters] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<ApprovalQueueRecord | null>(null)
  const [manualApprovalOpen, setManualApprovalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<ApprovalQueueRecord | null>(null)
  const [manualCandidates, setManualCandidates] = useState<IncomingBankTransactionMatchCandidate[]>([])
  const [manualLoading, setManualLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""

  const branchOptions = useMemo(() => {
    const uniqueBranchNames = Array.from(new Set(rows.map((row) => row.branchName)))
    return uniqueBranchNames.map((branchName) => ({ label: branchName, value: branchName }))
  }, [rows])

  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const filteredRows = useMemo(() => {
    if (!query) return rows
    return rows.filter((row) => matchesSearch(row, query))
  }, [query, rows])

  useEffect(() => {
    const maxPageIndex = Math.max(Math.ceil(filteredRows.length / pagination.pageSize) - 1, 0)
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
    }
  }, [filteredRows.length, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    if (!table) {
      return
    }

    const maxPageIndex = Math.max(table.getPageCount() - 1, 0)
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }))
    }
  }, [pagination.pageIndex, table])

  const queueStats = useMemo(() => {
    const stats = {
      total: filteredRows.length,
      onaylandi: 0,
      reddedildi: 0,
      yarida_birakildi: 0,
      dogrulama_hatasi: 0,
      beklemede: 0,
    }

    filteredRows.forEach((row) => {
      stats[row.durum] += 1
    })

    return stats
  }, [filteredRows])

  const columns = useMemo(
    () =>
      getApprovalQueueColumns(
        (row) => {
          setDetailRow(row)
          setDetailOpen(true)
        },
        (row) => {
          void (async () => {
            if (row.durum !== "beklemede") {
              return
            }

            setSelectedRow(row)
            setManualCandidates([])
            setManualApprovalOpen(true)
            setManualLoading(true)

            try {
              const candidates = await fetchManualApprovalCandidates(row.sorguNo)
              const normalizedRef = normalizeReference(row.sorguNo)
              const strictCandidates = candidates.filter(
                (candidate) => normalizeReference(candidate.referenceNumber) === normalizedRef,
              )
              setManualCandidates(strictCandidates)
            } finally {
              setManualLoading(false)
            }
          })()
        },
      ),
    [],
  )

  return (
    <div className="space-y-4">
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
            setSelectedRow(null)
            setManualCandidates([])
          }
        }}
        row={selectedRow}
        candidates={manualCandidates}
        loading={manualLoading}
        onConfirm={async (candidate) => {
          if (!selectedRow) {
            return
          }

          const updated = await approveQueueTransferManually({
            approvalQueueId: selectedRow.id,
            transaction: candidate,
          })

          if (!updated) {
            return
          }

          setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
          setDetailRow((prev) => (prev?.id === updated.id ? updated : prev))
        }}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">Toplam: {queueStats.total}</Badge>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Onaylandı: {queueStats.onaylandi}</Badge>
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Reddedildi: {queueStats.reddedildi}</Badge>
          <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">Yarıda Bırakılan: {queueStats.yarida_birakildi}</Badge>
          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">L1-L2-L3 Hatası: {queueStats.dogrulama_hatasi}</Badge>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Bekleyen: {queueStats.beklemede}</Badge>
        </div>
      </div>

      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="genel-merkez-onay-kuyrugu"
              exportSelected={false}
              exportLabel="Dışarı Aktar"
            />
          )}
          <DataTableToolbar
            table={table}
            showColumnSelector={!showFilters}
            viewLabel="Görünüm"
            columnsLabel="Sütunlar"
            resetLabel="Sıfırla"
          >
            <Button
              type="button"
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="mr-3 h-8"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="mr-2 size-4" />
              Filtreler
            </Button>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={query}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateQueryParam("q", event.target.value)}
                  placeholder="Transfer ID / Referans / Şube / Oluşturan ara..."
                  className="h-8 w-xs"
                />

                {table.getColumn("branchName") && (
                  <DataTableFacetedFilter
                    column={table.getColumn("branchName")}
                    title="Şube"
                    options={branchOptions}
                  />
                )}

                {table.getColumn("durum") && (
                  <DataTableFacetedFilter
                    column={table.getColumn("durum")}
                    title="Durum"
                    options={statusOptions}
                  />
                )}

                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => router.replace(pathname)}>
                  Filtreleri Sıfırla
                </Button>
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable
        data={filteredRows}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        onTableReady={setTable}
        enableHorizontalScroll
        stickyFirstColumn
        stickyLastColumn
      />
      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}
