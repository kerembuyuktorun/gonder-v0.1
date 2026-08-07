import { redirect } from 'next/navigation'
import { ARF_ROUTES } from '../../../_shared/routes'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CreateShipmentAliasPage({ searchParams }: Props) {
  const params = await searchParams
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') query.set(key, value)
    else if (Array.isArray(value) && value[0]) query.set(key, value[0])
  }
  const qs = query.toString()
  redirect(qs ? `${ARF_ROUTES.gonder.shipments.create}?${qs}` : ARF_ROUTES.gonder.shipments.create)
}
