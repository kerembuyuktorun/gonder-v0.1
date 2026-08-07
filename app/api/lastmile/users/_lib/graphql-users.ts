function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export function unwrapGraphqlData<T = Record<string, unknown>>(body: unknown): T | null {
  const result = tryUnwrapGraphqlData<T>(body)
  if (result.error) throw new Error(result.error)
  return result.data
}

export function tryUnwrapGraphqlData<T = Record<string, unknown>>(
  body: unknown
): { data: T | null; error: string | null } {
  const root = asRecord(body)
  const errors = root.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = asRecord(errors[0])
    const message =
      typeof first.message === 'string' ? first.message : 'GraphQL isteği başarısız.'
    return { data: null, error: message }
  }

  const data = asRecord(root.data)
  return {
    data: Object.keys(data).length > 0 ? (data as T) : null,
    error: null,
  }
}

/** BE handoff canonical list fields — extra join fields omitted to avoid resolver crashes */
export const USER_LIST_FIELDS = `
  id
  firstName
  lastName
  email
  phone
  userType
  userStatus
  roleName
  role { id name }
  affiliationLabel
  lastLoginAt
  createdAt
  emailVerified
`

export const USER_DETAIL_FIELDS = `
  id
  firstName
  lastName
  email
  phone
  tckn
  birthDate
  userType
  userStatus
  roleId
  roleName
  role { id name keys }
  tenantId
  facilityId
  transferCenterId
  customerId
  supplierId
  affiliationLabel
  profileImage
  lastLoginAt
  createdByName
  createdAt
  updatedAt
  emailVerified
  personnelProfile {
    gender
    maritalStatus
    bloodType
    educationLevel
    employmentStartDate
    residenceAddress
    emergencyContactName
    emergencyContactPhone
  }
  documents {
    id
    type
    uploadedAt
    uploadedByName
    originalFileName
    sizeBytes
  }
`

export const USERS_LIST_QUERY = `
  query Users($filter: ListUsersInput) {
    users(filter: $filter) {
      items { ${USER_LIST_FIELDS} }
      total
      page
      pageSize
    }
  }
`

export const USER_LIST_SUMMARY_QUERY = `
  query UserListSummary($filter: ListUsersInput) {
    userListSummary(filter: $filter) {
      total
      active
      passive
      invited
    }
  }
`

export const USER_DETAIL_QUERY = `
  query UserDetail($id: ID!) {
    user(id: $id) { ${USER_DETAIL_FIELDS} }
  }
`

export const USER_ACTIVITY_QUERY = `
  query UserActivityLogs($filter: ListActivityLogsInput!) {
    userActivityLogs(filter: $filter) {
      items {
        id
        activity
        description
        ip
        createdAt
      }
      total
      page
      pageSize
    }
  }
`

export const USER_SESSIONS_QUERY = `
  query UserSessions($userId: ID!) {
    userSessions(userId: $userId) {
      id
      ipAddress
      startedAt
      lastAccessAt
      client
    }
  }
`

export const ROLES_QUERY = `
  query Roles($filter: ListRolesInput) {
    roles(filter: $filter) {
      items { id name keys isDefault }
      total
    }
  }
`

export const INVITE_USER_MUTATION = `
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      id
      email
      userStatus
      firstName
      lastName
    }
  }
`

export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
      phone
      tckn
      birthDate
      facilityId
      customerId
    }
  }
`

export const ASSIGN_ROLE_MUTATION = `
  mutation AssignRole($userId: ID!, $roleId: ID!) {
    assignRoleToUser(userId: $userId, roleId: $roleId) {
      id
      roleId
      roleName
    }
  }
`

export const UPDATE_PERSONNEL_MUTATION = `
  mutation UpdatePersonnelProfile($userId: ID!, $input: UpdatePersonnelProfileInput!) {
    updatePersonnelProfile(userId: $userId, input: $input) {
      id
      personnelProfile {
        gender
        maritalStatus
        bloodType
        educationLevel
        employmentStartDate
        residenceAddress
        emergencyContactName
        emergencyContactPhone
      }
    }
  }
`

export const PASSIVE_USER_MUTATION = `
  mutation PassiveUser($id: ID!) {
    passiveUser(id: $id) { id userStatus }
  }
`

export const ACTIVATE_USER_MUTATION = `
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) { id userStatus }
  }
`

export const SUSPEND_USER_MUTATION = `
  mutation SuspendUser($id: ID!) {
    suspendUser(id: $id) { id userStatus }
  }
`

export const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) { id }
  }
`

export const SEND_PASSWORD_RESET_MUTATION = `
  mutation SendPasswordResetLink($userId: ID!) {
    sendPasswordResetLink(userId: $userId) { message }
  }
`

export function buildListUsersFilter(searchParams: URLSearchParams): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    pageSize: Math.min(Number.parseInt(searchParams.get('pageSize') ?? '20', 10) || 20, 100),
  }

  const search = searchParams.get('search')?.trim()
  if (search) filter.search = search

  const userStatus = searchParams.get('userStatus')?.trim()
  if (userStatus) filter.userStatus = userStatus

  const userType = searchParams.get('userType')?.trim()
  if (userType) filter.userType = userType

  return filter
}

export function statusScopeToBackend(scope: string | null): string | undefined {
  switch (scope) {
    case 'aktif':
      return 'Active'
    case 'pasif':
      return 'Passive'
    case 'davet':
      return 'PendingVerify'
    case 'askida':
      return 'Suspend'
    default:
      return undefined
  }
}

/** Tab counts should not inherit pagination/status from the active list filter */
export function buildSummaryFilter(
  filter: Record<string, unknown>
): Record<string, unknown> | null {
  const search = filter.search
  if (typeof search === 'string' && search.trim()) {
    return { search: search.trim() }
  }
  return null
}
