import { Suspense } from 'react'
import CourierDetailPageContent from './page-content'

export default function CourierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={null}>
      <CourierDetailPageContent params={params} />
    </Suspense>
  )
}
