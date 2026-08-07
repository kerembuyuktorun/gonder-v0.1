import { fetchBranchCashItems, fetchBranchCashSummary } from "./_api/branch-cash-api"
import { BranchCashPageContent } from "./_components/branch-cash-page-content"

export default async function BranchCashPage() {
  const activeBranchId = "branch-konya"

  const [rows, summary] = await Promise.all([
    fetchBranchCashItems(activeBranchId),
    fetchBranchCashSummary(activeBranchId),
  ])

  return <BranchCashPageContent rows={rows} summary={summary} />
}
