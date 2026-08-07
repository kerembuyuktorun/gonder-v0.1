import { Suspense } from "react"
import { fetchBankAccounts } from "./_api/bank-accounts-api"
import { BankAccountsPageContent } from "./_components/bank-accounts-page-content"

export default async function BankAccountsPage() {
  const bankAccounts = await fetchBankAccounts()

  return (
    <Suspense>
      <BankAccountsPageContent rows={bankAccounts} />
    </Suspense>
  )
}
