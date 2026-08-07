import { redirect } from 'next/navigation'
import { ARF_ROUTES } from '../../../_shared/routes'

export default function ReportsIndexPage() {
  redirect(ARF_ROUTES.gonder.reports.overview)
}
