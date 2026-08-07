import { Suspense } from 'react'
import { CarrierPerformanceReportContent } from '../_components/carrier-performance-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CarrierPerformanceReportContent />
    </Suspense>
  )
}
