'use client'

import { useSyncExternalStore } from 'react'
import { USERS_MOCK } from '../_mock/users-mock-data'
import { createEmptyPersonnel } from './query-users'
import type { LastmileUser } from '../_types/user'

type Listener = () => void

function normalizeUser(user: LastmileUser): LastmileUser {
  return {
    ...user,
    personel: { ...createEmptyPersonnel(), ...user.personel },
    evraklar: user.evraklar ?? [],
  }
}

let users: LastmileUser[] = USERS_MOCK.map((user) => normalizeUser({ ...user }))
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

export function getUsersSnapshot(): LastmileUser[] {
  return users
}

export function subscribeUsers(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getUserById(id: string): LastmileUser | null {
  return users.find((user) => user.id === id) ?? null
}

export function setUsers(next: LastmileUser[] | ((previous: LastmileUser[]) => LastmileUser[])) {
  users = typeof next === 'function' ? next(users) : next
  emit()
}

export function upsertUser(user: LastmileUser) {
  const next = normalizeUser(user)
  setUsers((previous) => {
    const index = previous.findIndex((item) => item.id === next.id)
    if (index === -1) return [next, ...previous]
    const copy = previous.slice()
    copy[index] = next
    return copy
  })
}

export function patchUser(id: string, patch: Partial<LastmileUser>) {
  setUsers((previous) =>
    previous.map((item) =>
      item.id === id ? normalizeUser({ ...item, ...patch }) : item
    )
  )
}

export function useUsersStore(): LastmileUser[] {
  return useSyncExternalStore(subscribeUsers, getUsersSnapshot, getUsersSnapshot)
}

export function useUserById(id: string): LastmileUser | null {
  const all = useUsersStore()
  return all.find((user) => user.id === id) ?? null
}
