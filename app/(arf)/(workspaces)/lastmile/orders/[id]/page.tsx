import { Suspense } from 'react'
import OrderDetailPageContent from './page-content'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <OrderDetailPageContent params={params} />
    </Suspense>
  )
}
