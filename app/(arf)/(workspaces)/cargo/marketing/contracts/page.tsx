"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ChevronDown, ChevronUp, FileSignature, Users, UserX } from "lucide-react"
import { customerDetails } from "../customers/_data/customers"
import { ContractsTableSection } from "./_components/contracts-table-section"
import { buildContractListRows, loadContractsSourceMapFromStorage, type ContractListRow } from "./_data/contracts"

export default function SozlesmelerPage() {
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)
  const [rows, setRows] = useState<ContractListRow[]>(() => buildContractListRows())

  useEffect(() => {
    const refreshRows = () => {
      const contractsByCustomer = loadContractsSourceMapFromStorage()
      setRows(buildContractListRows(contractsByCustomer))
    }

    refreshRows()

    window.addEventListener("storage", refreshRows)
    window.addEventListener("focus", refreshRows)

    return () => {
      window.removeEventListener("storage", refreshRows)
      window.removeEventListener("focus", refreshRows)
    }
  }, [])

  const summaryCards = useMemo(() => {
    const totalContractCount = rows.length
    const activeContractCount = rows.filter((row) => row.sozlesme_durum === "active").length
    const contractedCustomerCount = new Set(rows.map((row) => row.customerId)).size
    const noContractCustomerCount = Math.max(0, customerDetails.length - contractedCustomerCount)

    return [
      { label: "Toplam Sözleşme", value: String(totalContractCount), icon: FileSignature },
      { label: "Aktif Sözleşme", value: String(activeContractCount), icon: CheckCircle2 },
      { label: "Sözleşmeli Müşteri", value: String(contractedCustomerCount), icon: Users },
      { label: "Sözleşmesiz Müşteri", value: String(noContractCustomerCount), icon: UserX },
    ]
  }, [rows])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Satış & Pazarlama" },
          { label: "Sözleşmeler" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sözleşmeler</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSummaryVisible((prev) => !prev)}
            >
              {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
              {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
            </Button>
            <Button asChild>
              <Link href="/arf/cargo/marketing/customers">Müşteriler</Link>
            </Button>
          </div>
        </div>

        {isSummaryVisible && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.label} className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium tracking-wide text-slate-500">{card.label}</p>
                    <span className="inline-flex size-7 items-center justify-center rounded-lg border border-secondary/30 bg-primary/12 text-secondary">
                      <card.icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent>
            <ContractsTableSection data={rows} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
