import { Suspense } from 'react'
import { DesiAdjustmentDetailContent } from './_components/desi-adjustment-detail-content'

export default function DesiAdjustmentDetailPage() {
  return (
    <Suspense fallback={null}>
      <DesiAdjustmentDetailContent />
    </Suspense>
  )
}
