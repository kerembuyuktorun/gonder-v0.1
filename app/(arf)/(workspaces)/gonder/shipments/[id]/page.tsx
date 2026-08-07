import { Suspense } from 'react'
import { ShipmentDetailContent } from '../_components/shipment-detail-content'

export default function GonderShipmentDetailPage() {
  return (
    <Suspense fallback={null}>
      <ShipmentDetailContent />
    </Suspense>
  )
}
