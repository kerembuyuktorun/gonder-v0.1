import { getDashboardData } from "./_mock/dashboard-mock-data"
import DashboardGenelContent from "./page-content"

export default async function DashboardGenelPage() {
  const data = getDashboardData()
  return <DashboardGenelContent data={data} />
}
