"use client"

import { useState } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp } from "lucide-react"
import type { BankAccountRecord } from "../_types"
import { BankAccountsSummaryCards } from "./bank-accounts-summary-cards"
import { BankAccountsTableSection } from "./bank-accounts-table-section"

interface Props {
  rows: BankAccountRecord[]
}

export function BankAccountsPageContent({ rows }: Props) {
  const [showSummary, setShowSummary] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [items, setItems] = useState(rows)

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Genel Merkez", href: "/arf/cargo/finance/headquarters" },
          { label: "Satışlar" },
          { label: "Banka Hesapları" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Banka Hesapları</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSummary((prev) => !prev)} className="shrink-0">
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
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              Banka Hesabı Oluştur
            </Button>
          </div>
        </div>

        {showSummary && <BankAccountsSummaryCards rows={items} />}

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <BankAccountsTableSection
              data={items}
              onRowsChange={setItems}
              createOpen={createOpen}
              onCreateOpenChange={setCreateOpen}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}