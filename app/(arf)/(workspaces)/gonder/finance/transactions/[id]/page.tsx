import { FinanceTransactionDetailContent } from '../../_components/finance-transaction-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FinanceTransactionDetailPage({ params }: Props) {
  const { id } = await params
  return <FinanceTransactionDetailContent transactionId={id} />
}
