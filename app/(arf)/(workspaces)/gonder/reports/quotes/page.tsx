import { Suspense } from 'react'
import { QuotesReportContent } from '../_components/quotes-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QuotesReportContent />
    </Suspense>
  )
}
