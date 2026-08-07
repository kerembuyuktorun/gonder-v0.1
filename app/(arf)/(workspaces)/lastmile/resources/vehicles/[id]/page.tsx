import VehicleDetailPageContent from './page-content'

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <VehicleDetailPageContent params={params} />
}
