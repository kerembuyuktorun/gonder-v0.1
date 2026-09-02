import { FinanceInvoiceDetailContent } from '../../_components/finance-invoice-detail-content'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FinanceInvoiceDetailPage({ params }: Props) {
  const { id } = await params
  return <FinanceInvoiceDetailContent invoiceId={id} />
}
