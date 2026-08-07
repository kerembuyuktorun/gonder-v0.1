import { Suspense } from 'react'
import OrdersListPage from './page-content'

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersListPage />
    </Suspense>
  )
}
