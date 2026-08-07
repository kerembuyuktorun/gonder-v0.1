import { notFound } from "next/navigation"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { fetchSupplierDetail } from "./_api/supplier-detail-api"
import { SupplierDetailContent } from "./_components/supplier-detail-content"
import { ARF_ROUTES } from "../../../../../_shared/routes"

interface Props {
  params: Promise<{ supplierId: string }>
}

export default async function SupplierDetailPage({ params }: Props) {
  const { supplierId } = await params

  const supplier = await fetchSupplierDetail(supplierId)

  if (!supplier) {
    notFound()
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Tanımlamalar", href: ARF_ROUTES.cargo.operations.suppliers },
          { label: "Tedarikçi Listesi", href: ARF_ROUTES.cargo.operations.suppliers },
          { label: supplier.name },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-4">
        <SupplierDetailContent initialSupplier={supplier} />
      </div>
    </>
  )
}
