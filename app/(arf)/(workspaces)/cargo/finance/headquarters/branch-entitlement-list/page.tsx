import { fetchBranchEntitlementRows, fetchBranchEntitlementSummary } from "./_api/branch-entitlement-api"
import { BranchEntitlementPageContent } from "./_components/branch-entitlement-page-content"

export default async function BranchEntitlementListPage() {
  const [rows, summary] = await Promise.all([
    fetchBranchEntitlementRows(),
    fetchBranchEntitlementSummary(),
  ])

  return <BranchEntitlementPageContent rows={rows} summary={summary} />
}
