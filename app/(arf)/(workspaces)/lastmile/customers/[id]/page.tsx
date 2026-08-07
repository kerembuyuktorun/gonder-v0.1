import CustomerDetailPageContent from './page-content'

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <CustomerDetailPageContent params={params} />
}
