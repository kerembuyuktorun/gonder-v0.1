'use client'

import { useEffect, useState } from 'react'
import { getSession } from '../../../../../(auth)/_api/auth-client'
import type { AuthApiResult, SessionData } from '../../../../../(auth)/_api/auth-types'

export const COURIER_PERMISSION_CODES = {
  list: 'DriverList',
  create: 'DriverCreate',
  update: 'DriverUpdate',
  activate: 'DriverActivate',
  passive: 'DriverPassive',
} as const

export type CourierPermissions = {
  canList: boolean
  canCreate: boolean
  canUpdate: boolean
  canActivate: boolean
  canPassive: boolean
  canChangeVehicle: boolean
}

const ALL_GRANTED: CourierPermissions = {
  canList: true,
  canCreate: true,
  canUpdate: true,
  canActivate: true,
  canPassive: true,
  canChangeVehicle: true,
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function parsePermissionCodes(raw: unknown): Set<string> {
  if (!Array.isArray(raw)) return new Set()
  return new Set(raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))
}

function resolvePermissions(codes: Set<string>): CourierPermissions {
  if (codes.size === 0) return ALL_GRANTED

  const canUpdate = codes.has(COURIER_PERMISSION_CODES.update)

  return {
    canList: codes.has(COURIER_PERMISSION_CODES.list),
    canCreate: codes.has(COURIER_PERMISSION_CODES.create),
    canUpdate,
    canActivate: canUpdate || codes.has(COURIER_PERMISSION_CODES.activate),
    canPassive: canUpdate || codes.has(COURIER_PERMISSION_CODES.passive),
    canChangeVehicle: canUpdate,
  }
}

export function useCourierPermissions(): CourierPermissions {
  const [permissions, setPermissions] = useState<CourierPermissions>(ALL_GRANTED)

  useEffect(() => {
    let cancelled = false

    getSession().then((session: AuthApiResult<SessionData>) => {
      if (cancelled || !session.success) return

      const data = asRecord(session.data)
      const user = asRecord(data.user)
      const codes = parsePermissionCodes(data.permissions ?? user.permissions)

      setPermissions(resolvePermissions(codes))
    })

    return () => {
      cancelled = true
    }
  }, [])

  return permissions
}
