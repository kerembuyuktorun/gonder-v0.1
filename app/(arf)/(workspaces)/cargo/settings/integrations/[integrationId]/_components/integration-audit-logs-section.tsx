"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { retryIntegrationLog } from "../../_api/integrations-api"
import { integrationLogsColumns } from "../../_columns/integration-logs-columns"
import type { IntegrationLogEntry } from "../../_types"

interface Props {
  initialLogs: IntegrationLogEntry[]
}

export function IntegrationAuditLogsSection({ initialLogs }: Props) {
  const [logs, setLogs] = useState(initialLogs)
  const [table, setTable] = useState<TanStackTable<IntegrationLogEntry> | null>(null)
  const [selectedLog, setSelectedLog] = useState<IntegrationLogEntry | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const status = searchParams.get("status") ?? "all"
  const action = searchParams.get("action") ?? "all"
  const dateFrom = searchParams.get("from") ?? ""
  const dateTo = searchParams.get("to") ?? ""
  const query = searchParams.get("q") ?? ""

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  function handleActionChange(value: string) {
    setParam("action", value)
  }

  function handleStatusChange(value: string) {
    setParam("status", value)
  }

  const actionOptions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.action)))
  }, [logs])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR")
    return logs.filter((log) => {
      if (status !== "all" && log.status !== status) return false
      if (action !== "all" && log.action !== action) return false

      const logDate = new Date(log.timestamp)
      if (dateFrom) {
        const fromDate = new Date(`${dateFrom}T00:00:00`)
        if (logDate < fromDate) return false
      }
      if (dateTo) {
        const toDate = new Date(`${dateTo}T23:59:59`)
        if (logDate > toDate) return false
      }

      if (!q) return true
      return `${log.action} ${log.resourceId ?? ""} ${log.statusMessage ?? ""}`.toLocaleLowerCase("tr-TR").includes(q)
    })
  }, [action, dateFrom, dateTo, logs, query, status])

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">İşlem Geçmişi ve Hata Logları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setParam("q", event.target.value)} placeholder="Kaynak ID veya işlem ara..." className="max-w-sm" />
          <Select value={action} onValueChange={handleActionChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="İşlem tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm İşlemler</SelectItem>
              {actionOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="success">Başarılı</SelectItem>
              <SelectItem value="failed">Başarısız</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setParam("from", event.target.value)} className="w-[180px]" />
          <Input type="date" value={dateTo} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setParam("to", event.target.value)} className="w-[180px]" />
        </div>

        <DataTable
          data={filtered}
          columns={integrationLogsColumns}
          onTableReady={setTable}
          onRowClick={(row) => setSelectedLog(row)}
        />
        {table && <DataTablePagination table={table as TanStackTable<unknown>} />}

        {selectedLog && (
          <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Log Detayı</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">HTTP Status Code</p>
                  <p className="mt-1 font-medium text-slate-900">{String((selectedLog.responseData?.status as number | undefined) ?? "-")}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500">Tam Hata Açıklaması</p>
                  <p className="mt-1 font-medium text-slate-900">{selectedLog.errorDetails ?? selectedLog.statusMessage ?? "-"}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="mb-2 font-medium">Request</p>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog.requestData ?? {}, null, 2)}</pre>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="mb-2 font-medium">Response</p>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog.responseData ?? {}, null, 2)}</pre>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={async () => {
                    const retried = await retryIntegrationLog(selectedLog.id)
                    if (!retried) return
                    setLogs((prev) => prev.map((log) => (log.id === retried.id ? retried : log)))
                    setSelectedLog(retried)
                  }}
                >
                  Yeniden Dene
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
