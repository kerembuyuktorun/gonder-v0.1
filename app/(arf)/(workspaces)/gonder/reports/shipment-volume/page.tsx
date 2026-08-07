import { Suspense } from 'react'
import { ShipmentVolumeReportContent } from '../_components/shipment-volume-report-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShipmentVolumeReportContent />
    </Suspense>
  )
}
