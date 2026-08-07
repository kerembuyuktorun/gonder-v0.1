"use client"

import { useMemo, useState, useCallback, type ChangeEvent } from "react"
import type { RowSelectionState, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableViewOptions,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ArrowRightLeft, Filter } from "lucide-react"
import { getBranchCashColumns } from "../_columns/branch-cash-columns"
import type { BranchCashItem } from "../_types"
import { CreateTransferModal } from "./create-transfer-modal"

const PAYMENT_TYPE_SEGMENTS = [
  { label: "Tümü", value: "all" as const },
  { label: "Alıcı Ödemeli", value: "alici_odemeli" as const },
  { label: "Peşin Ödemeli", value: "pesin" as const },
]

const STATUS_OPTIONS = [
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "Bekliyor", value: "bekliyor" },
  { label: "İptal", value: "iptal" },
]

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function matchesSearch(row: BranchCashItem, query: string): boolean {
  const q = query.toLocaleLowerCase("tr-TR")
  return row.trackingNo.toLocaleLowerCase("tr-TR").includes(q)
}

interface Props {
  data: BranchCashItem[]
}

export function BranchCashTableSection({ data }: Props) {
  const [table, setTable] = useState<TanStackTable<BranchCashItem> | null>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<"all" | "alici_odemeli" | "pesin">("all")
  const [modalOpen, setModalOpen] = useState(false)

  const filteredRows = useMemo(() => {
    return data.filter((row) => {
      const paymentTypeMatches = paymentTypeFilter === "all" || row.paymentType === paymentTypeFilter
      const searchMatches = !searchQuery || matchesSearch(row, searchQuery)
      return paymentTypeMatches && searchMatches
    })
  }, [data, paymentTypeFilter, searchQuery])

  const columns = useMemo(() => getBranchCashColumns(), [])

  const selectedItems = useMemo(() => {
    return filteredRows.filter((_, idx) => rowSelection[idx] === true)
  }, [filteredRows, rowSelection])

  const totalSelectedAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.amount, 0),
    [selectedItems],
  )

  const teslimEdilen = selectedItems.filter((i) => i.status === "teslim_edildi").length
  const bekleyen = selectedItems.filter((i) => i.status === "bekliyor").length

  const handleRowSelectionChange = useCallback((updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
    setRowSelection(typeof updater === "function" ? updater : updater)
  }, [])

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center justify-between gap-3 pb-2">
          <div className="flex flex-wrap items-center gap-3">
            {PAYMENT_TYPE_SEGMENTS.map((segment) => {
              const isActive = paymentTypeFilter === segment.value
              return (
                <Button
                  key={segment.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 rounded-3xl border-slate-200 bg-white px-4 text-sm",
                    isActive && "border-primary/35 bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                  onClick={() => setPaymentTypeFilter(segment.value)}
                >
                  {segment.label}
                </Button>
              )
            })}

            <DataTableExcelActions
              table={table}
              filename="sube-kasasi"
              exportSelected={false}
              exportLabel="Dışarı Aktar"
              exportButtonClassName="h-9 rounded-3xl border-slate-200 bg-white px-4 text-sm"
            />

            <Button
              type="button"
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="h-9 rounded-3xl border-slate-200 bg-white px-4 text-sm"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="mr-2 size-4" />
              Filtreler
            </Button>

            <DataTableViewOptions
              table={table}
              label="Görünüm"
              columnsLabel="Sütunlar"
              className="ml-0 h-9 rounded-3xl border-slate-200 bg-white px-4 text-sm"
            />
          </div>

          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 rounded-3xl px-4 text-sm"
            disabled={selectedItems.length === 0}
            onClick={() => setModalOpen(true)}
          >
            <ArrowRightLeft className="mr-2 size-4" />
            Transfer Oluştur
            {selectedItems.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 text-xs">
                {selectedItems.length}
              </span>
            )}
          </Button>
        </div>
      )}

      {table && showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Takip no ara..."
            className="h-9 w-[200px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Kargo Durumu"
              options={STATUS_OPTIONS}
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-3xl border-slate-200 bg-white px-4 text-sm"
            onClick={() => {
              setSearchQuery("")
              setPaymentTypeFilter("all")
              table.resetColumnFilters()
            }}
          >
            Sıfırla
          </Button>
        </div>
      )}

      {/* Seçim özet satırı */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
          <span className="font-medium">
            Seçili{" "}
            <span className="font-bold">{selectedItems.length}</span> kayıt &bull; Toplam{" "}
            <span className="font-bold tabular-nums">{formatMoney(totalSelectedAmount)}</span>
          </span>
          <span className="text-slate-500">
            ✓ Teslim: {teslimEdilen} &nbsp; ⊙ Bekleyen: {bekleyen}
          </span>
        </div>
      )}

      <DataTable
        data={filteredRows}
        columns={columns}
        onTableReady={setTable}
        enableRowSelection
        enableMultiRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        enableHorizontalScroll
        stickyFirstColumn
        stickyLastColumn
        stickyRightColumnCount={1}
      />

      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}

      <CreateTransferModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedItems={selectedItems}
      />
    </div>
  )
}
