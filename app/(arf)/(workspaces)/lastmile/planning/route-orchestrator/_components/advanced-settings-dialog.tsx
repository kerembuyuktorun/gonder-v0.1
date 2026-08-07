'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SlidersHorizontal } from 'lucide-react'
import type { OptimizeObjective, OptimizeSettings } from '../_types/orchestrator'
import { clampOptimizeSettings } from '../_types/orchestrator'

const OBJECTIVE_OPTIONS: Array<{
  value: OptimizeObjective
  label: string
  hint: string
}> = [
  {
    value: 'balanced',
    label: 'Dengeli yük',
    hint: 'Mesafe, süre ve araç doluluğunu dengeler',
  },
  {
    value: 'min_distance',
    label: 'Minimum mesafe',
    hint: 'Toplam km’yi önceliklendirir',
  },
  {
    value: 'min_time',
    label: 'Minimum süre',
    hint: 'Toplam rota süresini kısaltır',
  },
  {
    value: 'min_vehicles',
    label: 'Minimum araç',
    hint: 'Daha az araçla plan üretmeye çalışır',
  },
]

const CONSTRAINT_ITEMS = [
  {
    key: 'respectCapacity' as const,
    label: 'Kapasite kısıtı',
    description: 'Hacim ve ağırlık limitlerini aşma',
  },
  {
    key: 'respectTimeWindows' as const,
    label: 'Zaman penceresi',
    description: 'Alım / teslim pencerelerine uy',
  },
  {
    key: 'respectSkills' as const,
    label: 'Yetenek eşleştirme',
    description: 'Sipariş gereksinimleri ↔ araç yetenekleri',
  },
  {
    key: 'respectShifts' as const,
    label: 'Vardiya uygunluğu',
    description: 'Araç vardiya saatleri içinde planla',
  },
  {
    key: 'returnToDepot' as const,
    label: 'Park konumuna dönüş',
    description: 'Rota sonunda araç park / dönüş ankoru',
  },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: OptimizeSettings
  onSave: (next: OptimizeSettings) => void
  saving?: boolean
}

export function AdvancedSettingsDialog({
  open,
  onOpenChange,
  value,
  onSave,
  saving = false,
}: Props) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[88vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 border-b border-slate-200/80 px-5 py-4 text-left sm:px-6'>
          <div className='flex items-center gap-3'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm'>
              <SlidersHorizontal className='size-5' aria-hidden />
            </span>
            <div className='min-w-0'>
              <DialogTitle className='text-base font-semibold tracking-tight text-slate-900'>
                Optimizasyon Ayarları
              </DialogTitle>
              <DialogDescription className='mt-0.5 text-[12px] text-slate-500'>
                Optimize Et ve Rotaya ekle akışlarında kullanılan hedef ve kısıtlar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6'>
          <div>
            <p className='mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400'>
              Plan parametreleri
            </p>
            <div className='grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]'>
              <div className='space-y-1.5'>
                <Label htmlFor='optimize-objective' className='text-[12px] text-slate-600'>
                  Hedef
                </Label>
                <Select
                  value={draft.objective}
                  onValueChange={(v) =>
                    setDraft((prev) => ({ ...prev, objective: v as OptimizeObjective }))
                  }
                >
                  <SelectTrigger id='optimize-objective' className='h-9 bg-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OBJECTIVE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} title={opt.hint}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='max-duration' className='text-[12px] text-slate-600'>
                  Max rota süresi
                </Label>
                <div className='relative'>
                  <Input
                    id='max-duration'
                    type='number'
                    min={30}
                    max={1440}
                    className='h-9 bg-white pr-10'
                    value={draft.maxRouteDurationMin}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        maxRouteDurationMin: Number(e.target.value) || 30,
                      }))
                    }
                  />
                  <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-400'>
                    dk
                  </span>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='max-stops' className='text-[12px] text-slate-600'>
                  Max durak
                </Label>
                <Input
                  id='max-stops'
                  type='number'
                  min={1}
                  max={200}
                  className='h-9 bg-white'
                  value={draft.maxStopsPerRoute}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxStopsPerRoute: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <p className='mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400'>
              Kısıtlar
            </p>
            <div className='overflow-hidden rounded-xl border border-slate-200/80 bg-white'>
              {CONSTRAINT_ITEMS.map((item, index) => (
                <div
                  key={item.key}
                  className={
                    index > 0
                      ? 'flex items-center justify-between gap-3 border-t border-slate-100 px-3.5 py-3'
                      : 'flex items-center justify-between gap-3 px-3.5 py-3'
                  }
                >
                  <div className='min-w-0'>
                    <Label
                      htmlFor={item.key}
                      className='text-[13px] font-medium text-slate-900'
                    >
                      {item.label}
                    </Label>
                    <p className='mt-0.5 text-[11px] leading-relaxed text-slate-500'>
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    id={item.key}
                    checked={draft[item.key]}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className='shrink-0 border-t border-slate-200/80 px-5 py-3 sm:px-6'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={saving}>
            Vazgeç
          </Button>
          <Button
            type='button'
            disabled={saving}
            onClick={() => {
              onSave(clampOptimizeSettings(draft))
            }}
          >
            {saving ? 'Kaydediliyor…' : 'Uygula'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
