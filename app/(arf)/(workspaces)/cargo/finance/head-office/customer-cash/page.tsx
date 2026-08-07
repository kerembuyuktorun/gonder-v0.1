import { Suspense } from "react"
import { fetchCustomerCashregisters, fetchCustomerCashregisterSummary } from "./_api/customer-cashregisters-api"
import { CustomerCashregistersPageContent } from "./_components/customer-cashregisters-page-content"

export default async function CustomerCashregistersPage() {
  const [rows, summary] = await Promise.all([
    fetchCustomerCashregisters(),
    fetchCustomerCashregisterSummary(),
  ])

  return (
    <Suspense>
      <CustomerCashregistersPageContent rows={rows} summary={summary} />
    </Suspense>
  )
}
