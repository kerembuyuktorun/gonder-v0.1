import { Suspense } from 'react'
import { FinanceReportContent } from '../_components/finance-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FinanceReportContent />
    </Suspense>
  )
}
