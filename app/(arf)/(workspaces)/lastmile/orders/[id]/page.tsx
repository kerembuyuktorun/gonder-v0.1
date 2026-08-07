import OrderDetailPageContent from './page-content'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <OrderDetailPageContent params={params} />
}
