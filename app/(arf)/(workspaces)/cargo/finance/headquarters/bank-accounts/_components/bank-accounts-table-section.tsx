"use client"

import { useMemo, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import { createBankAccount, setBankAccountStatus } from "../_api/bank-accounts-api"
import { getBankAccountsListColumns } from "../_columns/bank-accounts-list-columns"
import type { BankAccountRecord } from "../_types"
import { CreateBankAccountModal } from "./create-bank-account-modal"
import { mockBranches } from "../../../../settings/branches/_mock/branches-mock-data"

interface Props {
  data: BankAccountRecord[]
  onRowsChange: Dispatch<SetStateAction<BankAccountRecord[]>>
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
}

function matchesSearch(row: BankAccountRecord, query: string): boolean {
  const normalizedQuery = query.toLocaleLowerCase("tr-TR")
  return [row.bankName, row.branchName, row.label, row.accountHolder, row.iban]
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .includes(normalizedQuery)
}

export function BankAccountsTableSection({ data, onRowsChange, createOpen, onCreateOpenChange }: Props) {
  const [table, setTable] = useState<TanStackTable<BankAccountRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? "all"
  const currency = searchParams.get("currency") ?? "all"
  const accountType = searchParams.get("accountType") ?? "all"

  const activeBranches = useMemo(
    () => mockBranches.filter((branch) => branch.aktif).map((branch) => ({ id: branch.id, name: branch.ad })),
    [],
  )

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
    return data.filter((row) => {
      if (query && !matchesSearch(row, query)) return false
      if (status !== "all" && row.status !== status) return false
      if (currency !== "all" && row.currency !== currency) return false
      if (accountType !== "all" && row.accountType !== accountType) return false
      return true
    })
  }, [accountType, currency, data, query, status])

  const columns = useMemo(
    () =>
      getBankAccountsListColumns((row) => {
        void (async () => {
          const nextStatus = row.status === "active" ? "closed" : "active"
          const confirmed = window.confirm(
            `Banka hesabı ${nextStatus === "active" ? "kullanıma açılacak" : "kapatılacak"}. Onaylıyor musunuz?`,
          )
          if (!confirmed) return
          const updated = await setBankAccountStatus(row.id, nextStatus)
          if (!updated) return
          onRowsChange((prev) => prev.map((item) => (item.id === row.id ? updated : item)))
        })()
      }),
    [onRowsChange],
  )

  return (
    <div className="space-y-4">
      <CreateBankAccountModal
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        branches={activeBranches}
        onCreate={async (payload) => {
          const created = await createBankAccount(payload)
          onRowsChange((prev) => [created, ...prev])
        }}
      />

      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="banka-hesaplari"
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
                  placeholder="IBAN, etiket veya hesap sahibi ara..."
                  className="h-8 w-[250px]"
                />

                <Select value={status} onValueChange={(value: string) => updateQueryParam("status", value)}>
                  <SelectTrigger className="h-8 w-[160px]">
                    <SelectValue placeholder="Statü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Statüler</SelectItem>
                    <SelectItem value="active">Kullanımda</SelectItem>
                    <SelectItem value="closed">Kapalı</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={currency} onValueChange={(value: string) => updateQueryParam("currency", value)}>
                  <SelectTrigger className="h-8 w-[160px]">
                    <SelectValue placeholder="Para Birimi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Para Birimleri</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={accountType} onValueChange={(value: string) => updateQueryParam("accountType", value)}>
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue placeholder="Hesap Türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Hesap Türleri</SelectItem>
                    <SelectItem value="collection">Tahsilat</SelectItem>
                    <SelectItem value="expense">Gider / Ödeme</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => router.replace(pathname)}>
                  Filtreleri Sıfırla
                </Button>
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable data={filteredRows} columns={columns} onTableReady={setTable} enableHorizontalScroll stickyFirstColumn stickyLastColumn />
      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}