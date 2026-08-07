import { Suspense } from "react"
import { fetchGmBranchCashes, fetchGmBranchCashesSummary } from "./_api/gm-branch-cashes-api"
import { GmBranchCashesPageContent } from "./_components/gm-branch-cashes-page-content"

export default async function GmBranchCashesPage() {
  const [rows, summary] = await Promise.all([
    fetchGmBranchCashes(),
    fetchGmBranchCashesSummary(),
  ])

  return (
    <Suspense>
      <GmBranchCashesPageContent rows={rows} summary={summary} />
    </Suspense>
  )
}
