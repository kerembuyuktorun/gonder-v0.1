import { redirect } from 'next/navigation'
import { ARF_ROUTES } from '../../../../_shared/routes'

/** Legacy collections URL — Faz 2’de gelir/gidere taşınacak. */
export default function CollectionsRedirectPage() {
  redirect(ARF_ROUTES.lastmile.finance.income.list)
}
