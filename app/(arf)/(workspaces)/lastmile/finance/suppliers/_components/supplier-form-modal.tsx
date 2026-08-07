'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { OtherSupplierRecord, UpsertOtherSupplierInput } from '../../_types/supplier'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: OtherSupplierRecord | null
  onSubmit: (payload: UpsertOtherSupplierInput) => Promise<void>
}

export function SupplierFormModal({ open, onOpenChange, initial, onSubmit }: Props) {
  const [unvan, setUnvan] = useState('')
  const [vkn, setVkn] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [tags, setTags] = useState('DİĞER')
  const [openPayable, setOpenPayable] = useState('0')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setUnvan(initial?.unvan ?? '')
    setVkn(initial?.vkn ?? '')
    setEmail(initial?.email ?? '')
    setTelefon(initial?.telefon ?? '')
    setTags(initial?.tags?.join(', ') ?? 'DİĞER')
    setOpenPayable(String(initial?.openPayable ?? 0))
    setNotes(initial?.notes ?? '')
  }, [open, initial])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{initial ? 'Tedarikçiyi Düzenle' : 'Yeni Tedarikçi'}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-3 py-2 sm:grid-cols-2'>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>Ünvan *</Label>
            <Input value={unvan} onChange={(e) => setUnvan(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>VKN / TCKN</Label>
            <Input value={vkn} onChange={(e) => setVkn(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>Telefon</Label>
            <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} />
          </div>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>E-posta</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>Etiketler (virgülle)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder='YAKIT, LOJİSTİK' />
          </div>
          <div className='space-y-1.5'>
            <Label>Açık ödenecek (₺)</Label>
            <Input
              type='number'
              value={openPayable}
              onChange={(e) => setOpenPayable(e.target.value)}
            />
          </div>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>Not</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            className='bg-slate-800 text-white hover:bg-slate-700'
            disabled={saving || !unvan.trim()}
            onClick={async () => {
              setSaving(true)
              try {
                await onSubmit({
                  unvan,
                  vkn: vkn || undefined,
                  email: email || undefined,
                  telefon: telefon || undefined,
                  tags: tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                  openPayable: Number(openPayable) || 0,
                  notes: notes || undefined,
                })
                onOpenChange(false)
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
