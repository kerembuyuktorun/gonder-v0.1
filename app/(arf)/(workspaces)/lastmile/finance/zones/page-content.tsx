'use client'

import { useCallback, useEffect, useState } from 'react'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  createPriceZone,
  deletePriceZone,
  listPriceZones,
  updatePriceZone,
} from '../_api/pricing-api'
import type { PriceZone } from '../_types'
import { ZoneFormModal } from './_components/zone-form-modal'

export default function ZonesPageContent() {
  const [zones, setZones] = useState<PriceZone[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PriceZone | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setZones(await listPriceZones())
    } catch {
      toast.error('Bölgeler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Finans', href: ARF_ROUTES.lastmile.finance.root },
          { label: 'Fiyat Bölgeleri' },
        ]}
      />
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Fiyat Bölgeleri</h1>
            <p className='mt-1 text-sm text-slate-500'>
              İlçe paketleri tanımlayın; fiyat kurallarında sabit ücret için kullanın.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button
              size='sm'
              className='bg-lime-400 text-black hover:bg-lime-300'
              onClick={() => {
                setEditing(null)
                setModalOpen(true)
              }}
            >
              <Plus className='mr-1.5 size-3.5' />
              Yeni Bölge
            </Button>
          </div>
        </div>

        {zones.length === 0 && !loading ? (
          <div className='rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-slate-500'>
            Henüz bölge yok.
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {zones.map((zone) => (
              <div
                key={zone.id}
                className='rounded-2xl border border-slate-200/80 bg-white p-4 shadow-none'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <h2 className='font-semibold text-slate-900'>{zone.name}</h2>
                    {zone.code ? (
                      <p className='font-mono text-xs text-slate-500'>{zone.code}</p>
                    ) : null}
                  </div>
                  <div className='flex gap-1'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='size-8'
                      onClick={() => {
                        setEditing(zone)
                        setModalOpen(true)
                      }}
                    >
                      <Pencil className='size-3.5' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='size-8 text-red-600'
                      onClick={async () => {
                        await deletePriceZone(zone.id)
                        toast.success('Bölge silindi')
                        void load()
                      }}
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  </div>
                </div>
                <div className='mt-3 space-y-2'>
                  {zone.scopes.map((scope, idx) => (
                    <div key={idx} className='rounded-xl bg-slate-50 px-3 py-2 text-sm'>
                      <p className='font-medium text-slate-700'>{scope.cityName}</p>
                      <p className='text-xs text-slate-500'>
                        {scope.districtNames.length
                          ? scope.districtNames.join(', ')
                          : 'Tüm ilçeler'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ZoneFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSubmit={async (payload) => {
          if (editing) {
            await updatePriceZone(editing.id, payload)
            toast.success('Bölge güncellendi')
          } else {
            await createPriceZone(payload)
            toast.success('Bölge oluşturuldu')
          }
          void load()
        }}
      />
    </>
  )
}
