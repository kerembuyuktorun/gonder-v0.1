import { getOperasyonDashboardData } from "./_mock/operasyon-dashboard-mock-data"
import DashboardOperasyonContent from "./page-content"

export default async function DashboardOperasyonPage() {
  const data = await getOperasyonDashboardData()
  return <DashboardOperasyonContent data={data} />
}
