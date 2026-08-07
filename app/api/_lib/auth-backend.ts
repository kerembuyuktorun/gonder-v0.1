import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

const otpVerifySchema = z.object({
  code: z.string().min(4).max(12),
  loginSessionId: z.string().min(1),
})

const otpResendSchema = z.object({
  loginSessionId: z.string().min(1),
})

const forgotPasswordSchema = z.object({
  email: emailSchema,
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export type LoginPayload = z.infer<typeof loginSchema>
export type OtpVerifyPayload = z.infer<typeof otpVerifySchema>
export type OtpResendPayload = z.infer<typeof otpResendSchema>
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>

export type BackendResult<T> =
  | { ok: true; status: number; data: T; setCookies?: string[] }
  | { ok: false; status: number; error: string; data?: unknown; retryAfterSec?: number }

export type SessionInfo = {
  user: Record<string, unknown> | null
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number | null
  requiresOtp: boolean
  loginSessionId: string | null
}

export type ModuleCode =
  | 'CARGO'
  | 'LAST_MILE'
  | 'GONDER'
  | 'FLEET'
  | 'DELIVERY'
  | 'LOGISTIC'
  | 'TESTHUB'

const DEFAULT_TIMEOUT_MS = 12_000

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

/** GraphQL base must end with /graphql (Kong route). Accepts host-only or full endpoint. */
function resolveBackendBaseUrl(useGraphqlBase?: boolean): string {
  if (!useGraphqlBase) {
    return requireEnv('IAM_BASE_URL').replace(/\/$/, '')
  }

  const raw = requireEnv('BFF_GRAPHQL_URL').replace(/\/$/, '')
  if (/\/graphql$/i.test(raw)) {
    return raw
  }

  return `${raw}/graphql`
}

function buildBackendUrl(baseUrl: string, path: string): URL {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\/+/, '')
  // Empty path (GraphQL): keep exact /graphql — Kong often rejects /graphql/
  if (!normalizedPath) {
    return new URL(normalizedBase)
  }
  return new URL(normalizedPath, `${normalizedBase}/`)
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return null
}

function getPayloadData(body: unknown): Record<string, unknown> {
  const root = asRecord(body)
  const data = asRecord(root.data)
  // IAM verify-otp/login success puts tokens at root. If a nested `data` object
  // also exists, merge so root-level accessToken/refreshToken are never dropped.
  if (Object.keys(data).length > 0) {
    return { ...root, ...data }
  }

  return root
}

function pickExpiresIn(...sources: Record<string, unknown>[]): number | null {
  for (const source of sources) {
    const value = source.expiresIn ?? source.expires_in
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return Math.floor(value)
    }
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed
      }
    }
  }

  return null
}

function extractErrorMessage(body: unknown, fallback: string): string {
  const record = asRecord(body)
  const messageField = record.message

  if (messageField && typeof messageField === 'object' && !Array.isArray(messageField)) {
    const nested = asRecord(messageField)
    return pickString(nested.message, nested.code) ?? fallback
  }

  return (
    pickString(record.message, record.error, asRecord(record.errors).message) ??
    fallback
  )
}

function extractRetryAfterSec(body: unknown, response: Response): number | undefined {
  const fromHeader = Number.parseInt(response.headers.get('retry-after') ?? '', 10)
  if (Number.isFinite(fromHeader) && fromHeader > 0) {
    return fromHeader
  }

  const record = asRecord(body)
  const value = record.retryAfterSec
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value)
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return undefined
}

export function normalizeAuthError(raw: unknown): string {
  if (typeof raw !== 'string') {
    return 'İşlem şu anda tamamlanamadı. Lütfen tekrar deneyin.'
  }

  const normalized = raw.toLowerCase()
  if (normalized.includes('invalid credentials')) {
    return 'E-posta veya şifre hatalı.'
  }

  if (
    normalized.includes('invalid verification code') ||
    normalized.includes('verification code') ||
    normalized.includes('dogrulama kodu') ||
    normalized.includes('doğrulama kodu')
  ) {
    return 'Doğrulama kodu geçersiz.'
  }

  if (normalized.includes('too many') || normalized.includes('http_429')) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.'
  }

  return 'İşlem şu anda tamamlanamadı. Lütfen tekrar deneyin.'
}

export async function backendRequest<T>(
  path: string,
  init: RequestInit,
  options?: {
    accessToken?: string
    timeoutMs?: number
    useGraphqlBase?: boolean
  }
): Promise<BackendResult<T>> {
  const baseUrl = resolveBackendBaseUrl(options?.useGraphqlBase)
  const url = buildBackendUrl(baseUrl, path)
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options?.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`)
  }

  // ngrok free tier intermittently returns an interstitial without this header
  headers.set('ngrok-skip-browser-warning', '1')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '')

    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : []

    if (!response.ok) {
      const retryAfterSec = extractRetryAfterSec(responseBody, response)
      return {
        ok: false,
        status: response.status,
        error: normalizeAuthError(extractErrorMessage(responseBody, `HTTP_${response.status}`)),
        data: responseBody,
        retryAfterSec,
      }
    }

    return {
      ok: true,
      status: response.status,
      data: responseBody as T,
      setCookies,
    }
  } catch {
    return {
      ok: false,
      status: 503,
      error: 'Servis geçici olarak ulaşılamıyor. Lütfen tekrar deneyin.',
    }
  } finally {
    clearTimeout(timeout)
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return {}

    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=')

    return asRecord(JSON.parse(Buffer.from(payload, 'base64').toString('utf8')))
  } catch {
    return {}
  }
}

function normalizeUser(source: Record<string, unknown>): Record<string, unknown> | null {
  const firstName = pickString(source.firstName, source.first_name, source.givenName, source.given_name)
  const lastName = pickString(source.lastName, source.last_name, source.familyName, source.family_name)
  const composedName = [firstName, lastName].filter(Boolean).join(' ')
  const name = pickString(
    source.name,
    source.fullName,
    source.displayName,
    source.full_name,
    composedName || null
  )
  const username = pickString(source.username, source.userName, source.preferred_username)
  const email = pickString(source.email, source.mail, source.userEmail)

  if (!name && !username && !email && !firstName && !lastName) {
    return null
  }

  return {
    ...source,
    ...(name ? { name } : {}),
    ...(username ? { username } : {}),
    ...(email ? { email } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  }
}

function deepPickString(input: unknown, keys: string[]): string | null {
  const wanted = new Set(keys.map((key) => key.toLowerCase()))

  const visit = (node: unknown): string | null => {
    if (!node || typeof node !== 'object') return null

    if (Array.isArray(node)) {
      for (const item of node) {
        const hit = visit(item)
        if (hit) return hit
      }
      return null
    }

    const record = node as Record<string, unknown>
    for (const [key, value] of Object.entries(record)) {
      if (wanted.has(key.toLowerCase()) && typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }

    for (const value of Object.values(record)) {
      const hit = visit(value)
      if (hit) return hit
    }

    return null
  }

  return visit(input)
}

function pickTokenValue(
  kind: 'access' | 'refresh',
  ...values: unknown[]
): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>
      const nested =
        kind === 'access'
          ? pickString(
              record.accessToken,
              record.access_token,
              record.token,
              record.value
            )
          : pickString(
              record.refreshToken,
              record.refresh_token,
              record.refresh,
              record.token,
              record.value
            )
      if (nested) return nested
    }
  }

  return null
}

function extractRefreshFromSetCookies(setCookies: string[] | undefined): string | null {
  if (!setCookies?.length) return null

  const names = ['refreshToken', 'refresh_token', 'arf_refresh', 'refresh']
  for (const cookie of setCookies) {
    for (const name of names) {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`, 'i'))
      if (match?.[1]) {
        return decodeURIComponent(match[1])
      }
    }
  }

  return null
}

function pickTokenFields(
  body: unknown,
  ...sources: Record<string, unknown>[]
): { accessToken: string | null; refreshToken: string | null } {
  // Official IAM login/verify-otp success (tokens at root):
  // { requiresOtp, accessToken, refreshToken, expiresIn, tokenType, userId }
  const accessToken =
    pickTokenValue(
      'access',
      ...sources.flatMap((source) => [
        source.accessToken,
        source.access_token,
        source.token,
        asRecord(source.tokens).accessToken,
        asRecord(source.tokens).access_token,
        asRecord(source.tokens).access,
        asRecord(source.session).accessToken,
        asRecord(source.session).access_token,
        asRecord(source.tokens),
        asRecord(source.session),
      ])
    ) ?? deepPickString(body, ['accessToken', 'access_token'])

  const refreshToken =
    pickTokenValue(
      'refresh',
      ...sources.flatMap((source) => [
        source.refreshToken,
        source.refresh_token,
        source.refresh,
        asRecord(source.tokens).refreshToken,
        asRecord(source.tokens).refresh_token,
        asRecord(source.tokens).refresh,
        asRecord(source.session).refreshToken,
        asRecord(source.session).refresh_token,
        asRecord(source.session).refresh,
        asRecord(source.tokens),
        asRecord(source.session),
      ])
    ) ?? deepPickString(body, ['refreshToken', 'refresh_token'])

  return { accessToken, refreshToken }
}

export function parseSessionInfo(
  body: unknown,
  options?: { accessTokenHint?: string | null; setCookies?: string[] }
): SessionInfo {
  const root = asRecord(body)
  const data = getPayloadData(body)
  const nestedData = asRecord(data.data)
  const nestedUser = asRecord(data.user)
  const userId = pickString(root.userId, data.userId, data.id, root.id)
  const rootUserCandidate = {
    name: data.name,
    fullName: data.fullName,
    displayName: data.displayName,
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    email: data.email,
    ...(userId ? { id: userId, userId } : {}),
  }

  let user =
    normalizeUser(nestedUser) ??
    normalizeUser(rootUserCandidate)

  // Prefer root-level token fields first (backend contract).
  const { accessToken, refreshToken } = pickTokenFields(body, root, data, nestedData)
  const resolvedAccessToken = accessToken ?? options?.accessTokenHint ?? null
  const resolvedRefreshToken = refreshToken ?? extractRefreshFromSetCookies(options?.setCookies)
  const expiresIn = pickExpiresIn(root, data, nestedData)

  if (!user && resolvedAccessToken) {
    user = normalizeUser(decodeJwtPayload(resolvedAccessToken))
  }

  if (user && userId && !pickString(user.id, user.userId)) {
    user = { ...user, id: userId, userId }
  }

  return {
    user,
    accessToken: resolvedAccessToken,
    refreshToken: resolvedRefreshToken,
    expiresIn,
    requiresOtp: resolveRequiresOtpFlag(root, data),
    loginSessionId: pickString(
      data.loginSessionId,
      data.sessionId,
      data.login_session_id,
      root.loginSessionId,
      root.sessionId
    ),
  }
}

function resolveRequiresOtpFlag(
  root: Record<string, unknown>,
  data: Record<string, unknown>
): boolean {
  const candidates = [
    data.requiresOtp,
    root.requiresOtp,
    data.requiresOTP,
    root.requiresOTP,
    data.otpRequired,
    root.otpRequired,
    data.mfaRequired,
    root.mfaRequired,
    data.requireOtp,
    root.requireOtp,
  ]

  for (const value of candidates) {
    if (value === true || value === 1 || value === '1' || value === 'true') {
      return true
    }
  }

  const status = pickString(data.status, root.status, data.step, root.step)?.toLowerCase()
  if (
    status === 'otp_required' ||
    status === 'requires_otp' ||
    status === 'otp' ||
    status === 'mfa_required'
  ) {
    return true
  }

  return false
}

export function parseModuleCodes(body: unknown): ModuleCode[] {
  const root = asRecord(body)
  const data = root.data
  const rows = Array.isArray(root.items)
    ? root.items
    : Array.isArray(data)
      ? data
      : Array.isArray(asRecord(data).items)
        ? (asRecord(data).items as unknown[])
        : []

  const modules = new Set<ModuleCode>()
  for (const row of rows) {
    const item = asRecord(row)
    const moduleValue = pickString(item.module)
    const status = pickString(item.status)
    if (!moduleValue) continue
    if (item.deletedAt) continue
    // API may omit status; only reject when status is present and not active.
    if (status && status.toLowerCase() !== 'active') continue

    const normalized = moduleValue.trim().toUpperCase().replace(/-/g, '_')
    switch (normalized) {
      case 'CARGO':
      case 'LAST_MILE':
      case 'GONDER':
      case 'FLEET':
      case 'DELIVERY':
      case 'LOGISTIC':
        modules.add(normalized)
        break
      case 'TESTHUB':
      case 'TEST_HUB':
        modules.add('TESTHUB')
        break
      default:
        break
    }
  }

  return Array.from(modules)
}

export function modulesToAllowedRoutePrefixes(modules: ModuleCode[]): string[] {
  const routes = new Set<string>(['/'])

  for (const moduleCode of modules) {
    if (moduleCode === 'CARGO') routes.add('/cargo')
    if (moduleCode === 'LAST_MILE') {
      routes.add('/last-mile')
      routes.add('/lastmile')
    }
    if (moduleCode === 'GONDER') routes.add('/gonder')
    if (moduleCode === 'FLEET') routes.add('/fleet')
    if (moduleCode === 'DELIVERY') routes.add('/delivery')
    if (moduleCode === 'LOGISTIC') routes.add('/logistic')
    if (moduleCode === 'TESTHUB') routes.add('/test')
  }

  return Array.from(routes)
}

export type AuthMeUser = {
  id: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  tenantId: string | null
  profileImage: string | null
  userType: string | null
  userStatus: string | null
  name: string | null
}

function looksLikeMeUser(source: Record<string, unknown>): boolean {
  return Boolean(
    pickString(
      source.email,
      source.firstName,
      source.first_name,
      source.lastName,
      source.last_name,
      source.id,
      source.userType,
      source.user_type
    )
  )
}

/**
 * Parses IAM GET /api/v1/auth/me payloads (flat, `{ me }`, or `{ data }` / `{ data: { me } }`).
 */
export function parseAuthMeUser(body: unknown): AuthMeUser | null {
  const root = asRecord(body)
  const data = asRecord(root.data)
  const candidates = [asRecord(root.me), asRecord(data.me), data, root]

  const source = candidates.find((candidate) => looksLikeMeUser(candidate))
  if (!source) return null

  const firstName = pickString(source.firstName, source.first_name, source.givenName)
  const lastName = pickString(source.lastName, source.last_name, source.familyName)
  const composedName = [firstName, lastName].filter(Boolean).join(' ') || null
  const name = pickString(source.name, source.fullName, source.displayName, composedName)

  return {
    id: pickString(source.id, source.userId),
    firstName,
    lastName,
    email: pickString(source.email, source.mail),
    phone: pickString(source.phone, source.phoneNumber, source.mobile),
    tenantId: pickString(source.tenantId, source.tenant_id),
    profileImage: pickString(source.profileImage, source.profile_image, source.avatar, source.picture),
    userType: pickString(source.userType, source.user_type, source.role),
    userStatus: pickString(source.userStatus, source.user_status, source.status),
    name,
  }
}

export function authMeToSessionUser(me: AuthMeUser): Record<string, unknown> {
  return {
    id: me.id,
    firstName: me.firstName,
    lastName: me.lastName,
    name: me.name,
    email: me.email,
    phone: me.phone,
    tenantId: me.tenantId,
    profileImage: me.profileImage,
    avatar: me.profileImage,
    userType: me.userType,
    role: me.userType,
    userStatus: me.userStatus,
  }
}


export function validateLoginPayload(payload: unknown): LoginPayload {
  return loginSchema.parse(payload)
}

export function validateOtpVerifyPayload(payload: unknown): OtpVerifyPayload {
  return otpVerifySchema.parse(payload)
}

export function validateOtpResendPayload(payload: unknown): OtpResendPayload {
  return otpResendSchema.parse(payload)
}

export function validateForgotPasswordPayload(payload: unknown): ForgotPasswordPayload {
  return forgotPasswordSchema.parse(payload)
}

export function validateResetPasswordPayload(payload: unknown): ResetPasswordPayload {
  return resetPasswordSchema.parse(payload)
}

export function validateChangePasswordPayload(payload: unknown): ChangePasswordPayload {
  return changePasswordSchema.parse(payload)
}
