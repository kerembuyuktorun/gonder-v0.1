import { FinanceWalletHistoryDetailContent } from '../../../_components/finance-wallet-history-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FinanceWalletHistoryDetailPage({ params }: Props) {
  const { id } = await params
  return <FinanceWalletHistoryDetailContent entryId={id} />
}
