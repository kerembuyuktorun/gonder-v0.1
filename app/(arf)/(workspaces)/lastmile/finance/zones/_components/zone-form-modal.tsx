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
import { Plus, Trash2 } from 'lucide-react'
import type { PriceZone, PriceZoneScope } from '../../_types'
import { SEED_GEO } from '../../_data/seed'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: PriceZone | null
  onSubmit: (payload: { name: string; code?: string; scopes: PriceZoneScope[] }) => Promise<void>
}

function emptyScope(): PriceZoneScope {
  return {
    cityId: SEED_GEO.istanbul.cityId,
    cityName: SEED_GEO.istanbul.cityName,
    districtIds: [],
    districtNames: [],
  }
}

export function ZoneFormModal({ open, onOpenChange, initial, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [scopes, setScopes] = useState<PriceZoneScope[]>([emptyScope()])
  const [saving, setSaving] = useState(false)
  const [districtDraft, setDistrictDraft] = useState<Record<number, { id: string; name: string }>>(
    {}
  )

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setCode(initial?.code ?? '')
    setScopes(initial?.scopes?.length ? initial.scopes : [emptyScope()])
    setDistrictDraft({})
  }, [open, initial])

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSubmit({ name, code: code || undefined, scopes })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{initial ? 'Bölgeyi Düzenle' : 'Yeni Fiyat Bölgesi'}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>Ad *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className='space-y-1.5'>
              <Label>Kod</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Kapsam satırları</Label>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => setScopes((prev) => [...prev, emptyScope()])}
              >
                <Plus className='mr-1 size-3.5' />
                Satır
              </Button>
            </div>

            {scopes.map((scope, index) => (
              <div key={index} className='space-y-2 rounded-xl border p-3'>
                <div className='flex justify-between'>
                  <p className='text-xs font-medium text-slate-500'>Satır {index + 1}</p>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    className='size-7'
                    onClick={() => setScopes((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>
                <div className='grid gap-2 sm:grid-cols-2'>
                  <div className='space-y-1'>
                    <Label className='text-xs'>İl ID</Label>
                    <Input
                      value={scope.cityId}
                      onChange={(e) =>
                        setScopes((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, cityId: e.target.value } : s
                          )
                        )
                      }
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>İl adı</Label>
                    <Input
                      value={scope.cityName}
                      onChange={(e) =>
                        setScopes((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, cityName: e.target.value } : s
                          )
                        )
                      }
                    />
                  </div>
                </div>

                <div className='flex flex-wrap gap-1.5'>
                  {scope.districtNames.map((dName, dIdx) => (
                    <button
                      key={`${scope.districtIds[dIdx]}-${dName}`}
                      type='button'
                      className='rounded-full border bg-slate-50 px-2.5 py-0.5 text-xs'
                      onClick={() =>
                        setScopes((prev) =>
                          prev.map((s, i) =>
                            i === index
                              ? {
                                  ...s,
                                  districtIds: s.districtIds.filter((_, j) => j !== dIdx),
                                  districtNames: s.districtNames.filter((_, j) => j !== dIdx),
                                }
                              : s
                          )
                        )
                      }
                      title='Kaldırmak için tıklayın'
                    >
                      {dName} ×
                    </button>
                  ))}
                </div>

                <div className='grid gap-2 sm:grid-cols-[1fr_1fr_auto]'>
                  <Input
                    placeholder='İlçe ID'
                    value={districtDraft[index]?.id ?? ''}
                    onChange={(e) =>
                      setDistrictDraft((prev) => ({
                        ...prev,
                        [index]: { id: e.target.value, name: prev[index]?.name ?? '' },
                      }))
                    }
                  />
                  <Input
                    placeholder='İlçe adı'
                    value={districtDraft[index]?.name ?? ''}
                    onChange={(e) =>
                      setDistrictDraft((prev) => ({
                        ...prev,
                        [index]: { id: prev[index]?.id ?? '', name: e.target.value },
                      }))
                    }
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      const draft = districtDraft[index]
                      if (!draft?.id || !draft.name) return
                      setScopes((prev) =>
                        prev.map((s, i) =>
                          i === index
                            ? {
                                ...s,
                                districtIds: [...s.districtIds, draft.id],
                                districtNames: [...s.districtNames, draft.name],
                              }
                            : s
                        )
                      )
                      setDistrictDraft((prev) => ({ ...prev, [index]: { id: '', name: '' } }))
                    }}
                  >
                    Ekle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type='button'
            className='bg-lime-400 text-black hover:bg-lime-300'
            disabled={saving || !name.trim()}
            onClick={() => void save()}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
