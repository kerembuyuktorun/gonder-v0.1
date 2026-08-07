'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, ShieldCheck } from 'lucide-react'
import { updateRole } from '../../_api/roles-api'
import { MODULE_CATEGORIES, PERMISSION_DEFINITIONS } from '../../_mock/permissions-catalog'
import type { RoleDetail, RolePermissions } from '../../_types/role'
import { PermissionMatrixEditor } from '../../_components/permission-matrix-editor'

type Props = {
  role: RoleDetail
  onSaved: (updated: RoleDetail) => void
}

export function TabPermissions({ role, onSaved }: Props) {
  const [permissions, setPermissions] = useState<RolePermissions>({ ...role.permissions })
  const [isSaving, setIsSaving] = useState(false)

  const isReadOnly = role.roleType === 'system'

  const isDirty = useMemo(() => {
    const keys = new Set([...Object.keys(permissions), ...Object.keys(role.permissions)])
    for (const key of keys) {
      if (Boolean(permissions[key]) !== Boolean(role.permissions[key])) return true
    }
    return false
  }, [permissions, role.permissions])

  const grantedCount = useMemo(
    () => Object.values(permissions).filter(Boolean).length,
    [permissions]
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updated = await updateRole(role.id, { permissions })
      if (updated) onSaved(updated)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => setPermissions({ ...role.permissions })

  return (
    <div className='space-y-4'>
      {isReadOnly ? (
        <div className='flex items-center gap-2.5 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800'>
          <Lock className='size-4 shrink-0' />
          Sistem rollerinin yetki matrisi görüntülenebilir ancak değiştirilemez.
        </div>
      ) : null}

      <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white'>
        <div className='flex items-center gap-2'>
          <ShieldCheck className='size-4 text-lime-300' />
          <span className='text-sm font-medium'>Seçilen Yetki Sayısı</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-sm font-semibold tabular-nums'>
            {grantedCount} / {PERMISSION_DEFINITIONS.length}
          </span>
          {!isReadOnly ? (
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='h-8 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white'
                disabled={!isDirty || isSaving}
                onClick={handleReset}
              >
                Sıfırla
              </Button>
              <Button
                type='button'
                size='sm'
                className='h-8'
                disabled={!isDirty || isSaving}
                onClick={handleSave}
              >
                {isSaving ? 'Kaydediliyor...' : 'Yetkileri Kaydet'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <PermissionMatrixEditor
        categories={MODULE_CATEGORIES}
        definitions={PERMISSION_DEFINITIONS}
        value={permissions}
        onChange={setPermissions}
        readOnly={isReadOnly}
      />
    </div>
  )
}
