import { getLastmileDashboardData } from './_mock/dashboard-mock-data'
import LastmileDashboardContent from './page-content'

export default function LastmileWorkspacePage() {
  const data = getLastmileDashboardData()
  return <LastmileDashboardContent data={data} />
}
