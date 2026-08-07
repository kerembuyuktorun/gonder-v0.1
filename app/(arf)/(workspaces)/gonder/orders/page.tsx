import { Suspense } from 'react'
import { OrdersContent } from './_components/orders-content'

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  )
}
