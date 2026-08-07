import { Suspense } from 'react'
import { ReturnsReportContent } from '../_components/returns-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReturnsReportContent />
    </Suspense>
  )
}
