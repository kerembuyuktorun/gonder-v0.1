import { Suspense } from 'react'
import { OrderDetailContent } from '../_components/order-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <Suspense fallback={null}>
      <OrderDetailContent orderId={id} />
    </Suspense>
  )
}
