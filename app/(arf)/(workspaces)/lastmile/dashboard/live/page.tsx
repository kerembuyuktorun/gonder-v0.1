import { Suspense } from 'react'
import { getLastmileLiveDashboardData } from '../../_mock/dashboard-mock-data'
import LiveDashboardContent from './page-content'

export default function LastmileLiveDashboardPage() {
  const data = getLastmileLiveDashboardData()
  return (
    <Suspense fallback={null}>
      <LiveDashboardContent data={data} />
    </Suspense>
  )
}
