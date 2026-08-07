import { notFound } from "next/navigation"
import { fetchBankAccountDetail } from "./_api/bank-account-detail-api"
import { DetailContent } from "./_components/detail-content"

interface Props {
  params: Promise<{ id: string }>
}

export default async function BankAccountDetailPage({ params }: Props) {
  const { id } = await params
  const bankAccount = await fetchBankAccountDetail(id)

  if (!bankAccount) {
    notFound()
  }

  return <DetailContent initialBankAccount={bankAccount} />
}