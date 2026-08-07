import { Suspense } from 'react'
import { IntegrationChannelsReportContent } from '../_components/integration-channels-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IntegrationChannelsReportContent />
    </Suspense>
  )
}
