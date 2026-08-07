import { Suspense } from 'react'
import { ReportsOverviewContent } from '../_components/reports-overview-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReportsOverviewContent />
    </Suspense>
  )
}
