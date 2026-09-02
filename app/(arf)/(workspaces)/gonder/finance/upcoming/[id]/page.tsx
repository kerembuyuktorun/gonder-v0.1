import { FinanceUpcomingDetailContent } from '../../_components/finance-upcoming-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FinanceUpcomingDetailPage({ params }: Props) {
  const { id } = await params
  return <FinanceUpcomingDetailContent paymentId={id} />
}
