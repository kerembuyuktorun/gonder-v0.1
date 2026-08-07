import { Suspense } from 'react'
import { DeliveryPerformanceReportContent } from '../_components/delivery-performance-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DeliveryPerformanceReportContent />
    </Suspense>
  )
}
