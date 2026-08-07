import { Suspense } from "react"
import { fetchApprovalQueueRows, fetchApprovalQueueSummary } from "./_api/approval-queue-api"
import { ApprovalQueuePageContent } from "./_components/approval-queue-page-content"

export default async function ApprovalQueuePage() {
  const [rows, summary] = await Promise.all([
    fetchApprovalQueueRows(),
    fetchApprovalQueueSummary(),
  ])

  return (
    <Suspense>
      <ApprovalQueuePageContent rows={rows} summary={summary} />
    </Suspense>
  )
}
