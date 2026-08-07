import { redirect } from 'next/navigation'
import { ARF_ROUTES } from '../../../../_shared/routes'

/** @deprecated Prefer /lastmile/finance/payouts */
export default function CourierPayoutsRedirectPage() {
  redirect(ARF_ROUTES.lastmile.finance.payouts.list)
}
