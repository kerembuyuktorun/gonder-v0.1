"use client"

import { useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp } from "lucide-react"
import type { TmEntitlementRow, TmEntitlementSummary } from "../_types"
import { TmEntitlementSummaryCards } from "./tm-entitlement-summary-cards"
import { TmEntitlementTableSection } from "./tm-entitlement-table-section"

interface Props {
  rows: TmEntitlementRow[]
  summary: TmEntitlementSummary
}

export function TmEntitlementPageContent({ rows, summary }: Props) {
  const [showSummary, setShowSummary] = useState(true)

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Genel Merkez", href: "/arf/cargo/finance/headquarters" },
          { label: "Hakedişler" },
          { label: "Transfer Merkezi Hakediş Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Transfer Merkezi Hakediş Listesi</h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSummary((prev) => !prev)}
            className="shrink-0"
          >
            {showSummary ? (
              <>
                <ChevronUp className="mr-2 size-4" />
                <span>Özeti Gizle</span>
              </>
            ) : (
              <>
                <ChevronUp className="mr-2 size-4 rotate-180" />
                <span>Özeti Göster</span>
              </>
            )}
          </Button>
        </div>

        {showSummary && <TmEntitlementSummaryCards summary={summary} />}

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <TmEntitlementTableSection data={rows} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
