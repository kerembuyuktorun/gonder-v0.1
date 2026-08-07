import { Suspense } from 'react'
import { ShipmentsListContent } from './_components/shipments-list-content'

export default function ShipmentsListPage() {
  return (
    <Suspense fallback={null}>
      <ShipmentsListContent />
    </Suspense>
  )
}
