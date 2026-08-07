export type UserDetailTab = 'personnel' | 'activity'

export type UserActivityKind =
  | 'login'
  | 'invite'
  | 'role_change'
  | 'status_change'
  | 'password_reset'
  | 'profile_update'

export type UserActivityEvent = {
  id: string
  kind: UserActivityKind
  title: string
  detail?: string
  at: string
  actor?: string
  ip?: string
}

export type UserSession = {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  lastActiveAt: string
  current: boolean
}

export type UserPermissionGroup = {
  id: string
  label: string
  items: Array<{ id: string; label: string; allowed: boolean }>
}
