import { Suspense } from 'react'
import { DesiAdjustmentsReportContent } from '../_components/desi-adjustments-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DesiAdjustmentsReportContent />
    </Suspense>
  )
}
