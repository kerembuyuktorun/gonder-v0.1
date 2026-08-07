import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'
import {
  ACTIVATE_USER_MUTATION,
  ASSIGN_ROLE_MUTATION,
  DELETE_USER_MUTATION,
  PASSIVE_USER_MUTATION,
  SEND_PASSWORD_RESET_MUTATION,
  SUSPEND_USER_MUTATION,
  UPDATE_PERSONNEL_MUTATION,
  unwrapGraphqlData,
} from '../../_lib/graphql-users'

type RouteContext = { params: Promise<{ id: string }> }

async function runMutation(
  accessToken: string,
  query: string,
  variables: Record<string, unknown>,
  resultKey: string
) {
  const upstream = await lastmileGraphql<unknown>(query, variables, accessToken)
  if (!upstream.ok) return { ok: false as const, response: upstreamErrorResponse(upstream) }

  try {
    const data = unwrapGraphqlData<Record<string, unknown>>(upstream.data)
    return { ok: true as const, data: data?.[resultKey] ?? null }
  } catch (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'İşlem başarısız.',
        },
        { status: 502 }
      ),
    }
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Kullanıcı id gerekli.' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const action = typeof body.action === 'string' ? body.action : ''

  switch (action) {
    case 'activate': {
      const result = await runMutation(auth.accessToken, ACTIVATE_USER_MUTATION, { id }, 'activateUser')
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    case 'passive': {
      const result = await runMutation(auth.accessToken, PASSIVE_USER_MUTATION, { id }, 'passiveUser')
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    case 'suspend': {
      const result = await runMutation(auth.accessToken, SUSPEND_USER_MUTATION, { id }, 'suspendUser')
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    case 'delete': {
      const result = await runMutation(auth.accessToken, DELETE_USER_MUTATION, { id }, 'deleteUser')
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    case 'password-reset': {
      const result = await runMutation(
        auth.accessToken,
        SEND_PASSWORD_RESET_MUTATION,
        { userId: id },
        'sendPasswordResetLink'
      )
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    case 'assign-role': {
      const roleId = typeof body.roleId === 'string' ? body.roleId.trim() : ''
      if (!roleId) {
        return NextResponse.json({ success: false, error: 'Rol id gerekli.' }, { status: 400 })
      }
      const result = await runMutation(
        auth.accessToken,
        ASSIGN_ROLE_MUTATION,
        { userId: id, roleId },
        'assignRoleToUser'
      )
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    case 'personnel-profile': {
      const input = body.input
      if (!input || typeof input !== 'object') {
        return NextResponse.json({ success: false, error: 'Personel profili gerekli.' }, { status: 400 })
      }
      const result = await runMutation(
        auth.accessToken,
        UPDATE_PERSONNEL_MUTATION,
        { userId: id, input },
        'updatePersonnelProfile'
      )
      if (!result.ok) return result.response
      return NextResponse.json({ success: true, data: result.data })
    }
    default:
      return NextResponse.json({ success: false, error: 'Geçersiz aksiyon.' }, { status: 400 })
  }
}
