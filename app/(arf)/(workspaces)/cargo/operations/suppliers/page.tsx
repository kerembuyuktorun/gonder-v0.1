import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchSuppliers, fetchSupplierListKpi } from "./_api/suppliers-list-api"
import { SuppliersListPageContent } from "./_components/suppliers-list-page-content"

export default async function SuppliersPage() {
  const [suppliers, kpi] = await Promise.all([fetchSuppliers(), fetchSupplierListKpi()])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Tanımlamalar", href: "/arf/cargo/operations/suppliers" },
          { label: "Tedarikçi Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 bg-slate-50 p-6">
        <SuppliersListPageContent suppliers={suppliers} kpi={kpi} />
      </div>
    </>
  )
}
