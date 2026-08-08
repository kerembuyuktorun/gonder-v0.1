import { backendRequest, parseAuthMeUser } from '../../../_lib/auth-backend'
import { getDevDemoAuthConfig, isDemoAccessToken, isDevAuthBypassEnabled } from '../../../_lib/dev-auth'
import { requireAccessToken } from '../lastmile-bff'

/** Seed TENANT_A — local / demo fallback */
export const DEMO_TENANT_ID =
  process.env.DEV_DEMO_TENANT_ID?.trim() || '11111111-1111-4111-8111-111111111111'

export async function requireFinanceAuth(request: Request): Promise<
  | { ok: true; accessToken: string; tenantId: string }
  | { ok: false; response: Response }
> {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth

  const tenantId = await resolveFinanceTenantId(auth.accessToken, request)
  if (!tenantId) {
    return {
      ok: false,
      response: Response.json(
        { success: false, error: 'Tenant bulunamadı.', code: 'TENANT_REQUIRED' },
        { status: 403 }
      ),
    }
  }

  return { ok: true, accessToken: auth.accessToken, tenantId }
}

export async function resolveFinanceTenantId(
  accessToken: string,
  request: Request
): Promise<string | null> {
  const fromQuery = new URL(request.url).searchParams.get('tenantId')?.trim()
  if (fromQuery) return fromQuery

  if (isDevAuthBypassEnabled() && isDemoAccessToken(accessToken)) {
    return DEMO_TENANT_ID
  }

  // Prefer JWT claim without round-trip when present
  try {
    const payloadPart = accessToken.split('.')[1]
    if (payloadPart) {
      const json = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Record<
        string,
        unknown
      >
      const claim = json.tenant_id ?? json.tenantId
      if (typeof claim === 'string' && claim.trim()) return claim.trim()
    }
  } catch {
    // ignore decode errors
  }

  if (!process.env.IAM_BASE_URL?.trim()) {
    if (isDevAuthBypassEnabled()) return DEMO_TENANT_ID
    return null
  }

  try {
    const meResponse = await backendRequest<unknown>(
      'api/v1/auth/me',
      { method: 'GET' },
      { accessToken }
    )
    if (meResponse.ok) {
      const me = parseAuthMeUser(meResponse.data)
      if (me?.tenantId) return me.tenantId
    }
  } catch {
    // fall through
  }

  if (isDevAuthBypassEnabled()) {
    void getDevDemoAuthConfig()
    return DEMO_TENANT_ID
  }

  return null
}
