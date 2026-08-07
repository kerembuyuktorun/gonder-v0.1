import { getKargoDashboardData } from "./_mock/kargo-dashboard-mock-data"
import DashboardKargoContent from "./page-content"

export default async function DashboardKargoPage() {
  const data = await getKargoDashboardData()
  return <DashboardKargoContent data={data} />
}
