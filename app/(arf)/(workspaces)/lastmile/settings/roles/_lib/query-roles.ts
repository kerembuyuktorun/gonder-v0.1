import type {
  LastmileRole,
  RoleStatusScope,
  RoleType,
} from '../_types/role'
import { ROLE_STATUS_LABELS, ROLE_TYPE_LABELS } from '../_types/role'

type QueryInput = {
  items: LastmileRole[]
  search: string
  statusScope: RoleStatusScope
  types: RoleType[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export function queryRoles({
  items,
  search,
  statusScope,
  types,
  sortBy,
  sortDir = 'asc',
  page,
  pageSize,
}: QueryInput) {
  const q = search.trim().toLocaleLowerCase('tr-TR')

  let filtered = items.filter((role) => {
    if (statusScope !== 'all' && role.status !== statusScope) return false
    if (types.length > 0 && !types.includes(role.roleType)) return false

    if (!q) return true

    const haystack = `${role.name} ${role.description ?? ''}`.toLocaleLowerCase('tr-TR')
    return haystack.includes(q)
  })

  if (sortBy) {
    const dir = sortDir === 'desc' ? -1 : 1
    filtered = [...filtered].sort((a, b) => {
      const left = sortValue(a, sortBy)
      const right = sortValue(b, sortBy)
      if (left < right) return -1 * dir
      if (left > right) return 1 * dir
      return 0
    })
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  return { items: filtered.slice(start, start + pageSize), total }
}

function sortValue(role: LastmileRole, sortBy: string): string | number {
  switch (sortBy) {
    case 'name':
      return role.name
    case 'status':
      return ROLE_STATUS_LABELS[role.status]
    case 'roleType':
      return ROLE_TYPE_LABELS[role.roleType]
    case 'userCount':
      return role.userCount
    case 'createdAt':
      return role.createdAt
    case 'createdBy':
      return role.createdBy ?? ''
    default:
      return role.name
  }
}
