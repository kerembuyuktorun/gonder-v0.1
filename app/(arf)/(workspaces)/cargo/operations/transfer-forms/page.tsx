import { Suspense } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchTransferFormListKpi, fetchTransferForms } from "./_api/transfer-forms-list-api"
import { TransferFormsPageContent } from "./_components/transfer-forms-page-content"

export default async function TransferFormsPage() {
  const [transferForms, kpi] = await Promise.all([fetchTransferForms(), fetchTransferFormListKpi()])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Operasyon İşlemleri", href: "/arf/cargo/operations" },
          { label: "KTF Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <Suspense>
          <TransferFormsPageContent initialData={transferForms} initialKpi={kpi} />
        </Suspense>
      </div>
    </>
  )
}
