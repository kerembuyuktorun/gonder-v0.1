"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PriceRuleRow } from "../../_types"
import { getRulesColumns } from "../_columns/rules-columns"

interface Props {
  rules: PriceRuleRow[]
}

export function DetailRulesSection({ rules }: Props) {
  const [table, setTable] = useState<TanStackTable<PriceRuleRow> | null>(null)
  const columns = useMemo(() => getRulesColumns(), [])

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Fiyatlandırma</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable data={rules} columns={columns} onTableReady={setTable} emptyMessage="Kural satırı bulunamadı." />
        {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
      </CardContent>
    </Card>
  )
}
