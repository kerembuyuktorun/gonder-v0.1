import { fetchTmEntitlementRows, fetchTmEntitlementSummary } from "./_api/tm-entitlement-api"
import { TmEntitlementPageContent } from "./_components/tm-entitlement-page-content"

export default async function TransferCenterEntitlementListPage() {
  const [rows, summary] = await Promise.all([
    fetchTmEntitlementRows(),
    fetchTmEntitlementSummary(),
  ])

  return <TmEntitlementPageContent rows={rows} summary={summary} />
}
