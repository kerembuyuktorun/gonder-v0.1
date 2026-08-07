export type LastmileApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; data?: unknown }

async function doRequest(path: string, init: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  })
}

export async function lastmileClientRequest<T>(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<LastmileApiResult<T>> {
  const response = await doRequest(path, init)

  if (response.status === 401 && !retried) {
    const refresh = await doRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    if (refresh.ok) {
      return lastmileClientRequest(path, init, true)
    }
  }

  const payload = (await response.json().catch(() => ({}))) as LastmileApiResult<T> & {
    error?: string
    code?: string
  }

  if (!response.ok || payload.success === false) {
    return {
      success: false,
      error: payload.error || 'İşlem başarısız oldu.',
      code: payload.code,
      data: 'data' in payload ? payload.data : undefined,
    }
  }

  return payload
}
