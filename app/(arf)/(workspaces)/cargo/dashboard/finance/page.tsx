import { getFinansDashboardData } from "./_mock/finans-dashboard-mock-data"
import DashboardFinansContent from "./page-content"

export default async function DashboardFinansPage() {
  const data = await getFinansDashboardData()
  return <DashboardFinansContent data={data} />
}
