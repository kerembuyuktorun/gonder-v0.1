import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'
import { INVITE_USER_MUTATION, unwrapGraphqlData } from '../_lib/graphql-users'

export async function POST(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  try {
    const upstream = await lastmileGraphql<unknown>(
      INVITE_USER_MUTATION,
      { input: body },
      auth.accessToken
    )

    if (!upstream.ok) return upstreamErrorResponse(upstream)

    const data = unwrapGraphqlData<Record<string, unknown>>(upstream.data)
    return NextResponse.json({
      success: true,
      data: data?.inviteUser ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Davet gönderilemedi.',
      },
      { status: 502 }
    )
  }
}
