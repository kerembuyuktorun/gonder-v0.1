import { Suspense } from 'react'
import { ReturnDetailContent } from './_components/return-detail-content'

export default function ReturnDetailPage() {
  return (
    <Suspense fallback={null}>
      <ReturnDetailContent />
    </Suspense>
  )
}
