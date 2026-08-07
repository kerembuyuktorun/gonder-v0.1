import CourierDetailPageContent from './page-content'

export default function CourierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <CourierDetailPageContent params={params} />
}
