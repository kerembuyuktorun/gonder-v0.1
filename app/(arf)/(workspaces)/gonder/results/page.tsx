import { redirect } from 'next/navigation'
import { ARF_ROUTES } from '../../../_shared/routes'

export default function ResultsRedirectPage() {
  redirect(ARF_ROUTES.gonder.quotes.open)
}
