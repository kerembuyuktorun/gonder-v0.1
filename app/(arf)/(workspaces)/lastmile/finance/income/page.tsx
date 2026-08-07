import { redirect } from 'next/navigation'
import { ARF_ROUTES } from '../../../../_shared/routes'

/** Gelirler menü/URL → Faturalar listesine yönlendirilir. */
export default function IncomeRedirectPage() {
  redirect(ARF_ROUTES.lastmile.finance.invoices.list)
}
