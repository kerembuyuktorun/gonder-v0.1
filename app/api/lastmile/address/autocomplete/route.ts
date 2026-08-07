import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

const ADDRESS_AUTOCOMPLETE_QUERY = `
  query AddressAutocomplete($input: String!, $sessionToken: String) {
    addressAutocomplete(input: $input, sessionToken: $sessionToken) {
      suggestions {
        placeId
        description
        mainText
        secondaryText
      }
    }
  }
`

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export async function POST(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  let body: { input?: string; sessionToken?: string }
  try {
    body = (await request.json()) as { input?: string; sessionToken?: string }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek gövdesi.' },
      { status: 400 }
    )
  }

  const input = typeof body.input === 'string' ? body.input.trim() : ''
  if (!input) {
    return NextResponse.json(
      { success: false, error: 'Arama metni zorunludur.' },
      { status: 400 }
    )
  }

  const upstream = await lastmileGraphql<unknown>(
    ADDRESS_AUTOCOMPLETE_QUERY,
    {
      input,
      sessionToken: body.sessionToken ?? null,
    },
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
          typeof first.message === 'string'
            ? first.message
            : 'Adres önerileri alınamadı.',
      },
      { status: 502 }
    )
  }

  const data = asRecord(root.data)
  const autocomplete = asRecord(data.addressAutocomplete)
  const suggestions = Array.isArray(autocomplete.suggestions)
    ? autocomplete.suggestions
    : []

  return NextResponse.json({
    success: true,
    data: { suggestions },
  })
}
