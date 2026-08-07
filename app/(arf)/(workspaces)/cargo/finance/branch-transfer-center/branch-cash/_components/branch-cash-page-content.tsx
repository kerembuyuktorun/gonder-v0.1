"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Card, CardContent } from "@/components/ui/card"
import type { BranchCashItem, BranchCashSummary } from "../_types"
import { BranchCashSummaryCards } from "./branch-cash-summary-cards"
import { BranchCashTableSection } from "./branch-cash-table-section"

interface Props {
  rows: BranchCashItem[]
  summary: BranchCashSummary
}

export function BranchCashPageContent({ rows, summary }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Şube", href: "/arf/cargo/finance/branch-transfer-center" },
          { label: "Şube Kasası" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <div className="pt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Şube Kasası</h1>
        </div>

        <BranchCashSummaryCards summary={summary} />

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <BranchCashTableSection data={rows} />
          </CardContent>
        </Card>
      </div>

    </>
  )
}
