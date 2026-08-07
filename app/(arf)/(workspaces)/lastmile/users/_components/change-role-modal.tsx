'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchRoles } from '../_api/users-client'
import type { RoleOption } from '../_lib/map-user'
import type { LastmileUser } from '../_types/user'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: LastmileUser | null
  onSubmit: (roleId: string) => Promise<void>
}

function filterRolesForUser(roles: RoleOption[], user: LastmileUser | null): RoleOption[] {
  if (!user) return roles
  if (user.kullanici_tipi === 'musteri') {
    return roles.filter((role) => role.keys.some((key) => key.toLowerCase().includes('customer')))
  }
  return roles.filter((role) => !role.keys.some((key) => key.toLowerCase().includes('customer')))
}

export function ChangeRoleModal({ open, onOpenChange, user, onSubmit }: Props) {
  const [roleId, setRoleId] = useState('')
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    void fetchRoles().then((result) => {
      if (result.success) setRoles(result.data)
    })
  }, [open])

  useEffect(() => {
    if (!open || !user) return
    setRoleId(user.roleId ?? '')
    setIsSubmitting(false)
  }, [open, user])

  const roleOptions = filterRolesForUser(roles, user)

  const handleSubmit = async () => {
    if (!roleId || !user) return
    setIsSubmitting(true)
    try {
      await onSubmit(roleId)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Rol Değiştir</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>
          {user ? `${user.ad_soyad} için yeni rol seçin.` : 'Kullanıcı seçilmedi.'}
        </p>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger>
            <SelectValue placeholder='Rol seçin' />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Vazgeç
            </Button>
          </DialogClose>
          <Button type='button' disabled={!roleId || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
