import { Suspense } from 'react'
import { CostRevenueReportContent } from '../_components/cost-revenue-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CostRevenueReportContent />
    </Suspense>
  )
}
