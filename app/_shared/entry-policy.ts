export interface EntryVisibilityPolicy {
  allowCargo: boolean
  allowTestHub: boolean
}

export interface EntryPolicyContext {
  role?: string
}

/**
 * Entry policy point for future role-based visibility rules.
 *
 * Current default keeps both workspaces visible. Integrations can pass role
 * (from auth/session middleware) and override these rules centrally.
 */
export function resolveEntryVisibilityPolicy(
  context: EntryPolicyContext = {}
): EntryVisibilityPolicy {
  const role = context.role?.toLowerCase()

  if (role === 'cargo-operator') {
    return { allowCargo: true, allowTestHub: false }
  }

  if (role === 'qa' || role === 'developer') {
    return { allowCargo: true, allowTestHub: true }
  }

  return { allowCargo: true, allowTestHub: true }
}
