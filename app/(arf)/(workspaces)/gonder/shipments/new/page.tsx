import { Suspense } from 'react'
import { CreateShipmentContent } from './_components/create-shipment-content'

export default function CreateShipmentPage() {
  return (
    <Suspense fallback={null}>
      <CreateShipmentContent />
    </Suspense>
  )
}
