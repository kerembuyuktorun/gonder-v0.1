"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import type { InvoiceCreateInitData } from "../_types"
import { FaturaOlusturFormSection } from "./invoice-create-form-section"

interface Props {
  initialData: InvoiceCreateInitData
}

export function FaturaOlusturPageContent({ initialData }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Genel Merkez", href: "/arf/cargo/finance/headquarters" },
          { label: "Satışlar" },
          { label: "Faturalar", href: "/arf/cargo/finance/headquarters/invoices" },
          { label: "Fatura Oluştur" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <div className="pt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Fatura Oluştur</h1>
        </div>
        <FaturaOlusturFormSection initialData={initialData} />
      </div>
    </>
  )
}
