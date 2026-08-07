export type SidebarUserView = {
  name: string
  email: string
  avatar: string
  role: string
}

const FALLBACK_USER: SidebarUserView = {
  name: 'Kullanıcı',
  email: '',
  avatar: '',
  role: '',
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return null
}

export function getDisplayNameFromUser(user?: Record<string, unknown> | null): string {
  if (!user) return FALLBACK_USER.name

  const firstName = pickString(user.firstName, user.first_name)
  const lastName = pickString(user.lastName, user.last_name)
  const composedName = [firstName, lastName].filter(Boolean).join(' ')

  return (
    pickString(
      user.name,
      user.fullName,
      user.displayName,
      composedName || null,
      user.username,
      typeof user.email === 'string' ? user.email.split('@')[0] : undefined
    ) ?? FALLBACK_USER.name
  )
}

export function toSidebarUserView(
  user?: Record<string, unknown> | null,
  fallback: SidebarUserView = FALLBACK_USER
): SidebarUserView {
  if (!user) return fallback

  return {
    name: getDisplayNameFromUser(user),
    email: pickString(user.email, user.mail) ?? fallback.email,
    avatar:
      pickString(user.profileImage, user.profile_image, user.avatar, user.picture) ??
      fallback.avatar,
    role: pickString(user.userType, user.user_type, user.role) ?? fallback.role,
  }
}
