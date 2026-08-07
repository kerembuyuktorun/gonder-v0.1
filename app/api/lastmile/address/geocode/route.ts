import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

const ADDRESS_GEOCODE_QUERY = `
  query AddressGeocode($addressText: String!) {
    addressGeocode(addressText: $addressText) {
      latitude
      longitude
      formattedAddress
      placeId
    }
  }
`

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export async function POST(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  let body: { addressText?: string }
  try {
    body = (await request.json()) as { addressText?: string }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek gövdesi.' },
      { status: 400 }
    )
  }

  const addressText = typeof body.addressText === 'string' ? body.addressText.trim() : ''
  if (!addressText) {
    return NextResponse.json(
      { success: false, error: 'Adres metni zorunludur.' },
      { status: 400 }
    )
  }

  const upstream = await lastmileGraphql<unknown>(
    ADDRESS_GEOCODE_QUERY,
    { addressText },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const root = asRecord(upstream.data)
  const gqlErrors = root.errors
  if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
    const first = asRecord(gqlErrors[0])
    return NextResponse.json(
      {
        success: false,
        error:
          typeof first.message === 'string' ? first.message : 'Adres geocode başarısız.',
      },
      { status: 502 }
    )
  }

  const data = asRecord(root.data)
  const geocode = asRecord(data.addressGeocode)

  return NextResponse.json({
    success: true,
    data: geocode,
  })
}
