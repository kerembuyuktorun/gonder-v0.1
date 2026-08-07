'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export type QuoteSortMode = 'recommended' | 'price' | 'duration'
export type ResultsFiltersState = {
  sort: QuoteSortMode
  onlyInstant: boolean
  onlyPickup: boolean
  serviceTypes: string[]
  maxPrice: number | null
}

type Props = {
  value: ResultsFiltersState
  onChange: (next: ResultsFiltersState) => void
  availableServiceTypes: string[]
  className?: string
}

const SORT_OPTIONS: Array<{ id: QuoteSortMode; label: string }> = [
  { id: 'recommended', label: 'Önerilen' },
  { id: 'price', label: 'Fiyat' },
  { id: 'duration', label: 'Süre' },
]

export function ResultsFiltersPanel({
  value,
  onChange,
  availableServiceTypes,
  className,
}: Props) {
  function toggleServiceType(serviceType: string) {
    const exists = value.serviceTypes.includes(serviceType)
    onChange({
      ...value,
      serviceTypes: exists
        ? value.serviceTypes.filter((item) => item !== serviceType)
        : [...value.serviceTypes, serviceType],
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='space-y-1.5'>
        <Label>Sırala</Label>
        <div className='flex flex-wrap gap-2'>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type='button'
              onClick={() => onChange({ ...value, sort: option.id })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium',
                value.sort === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border text-muted-foreground hover:bg-muted/40'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <Label htmlFor='only-instant'>Sadece anında fiyat</Label>
          <Switch
            id='only-instant'
            checked={value.onlyInstant}
            onCheckedChange={(checked) => onChange({ ...value, onlyInstant: checked })}
          />
        </div>
        <div className='flex items-center justify-between gap-3'>
          <Label htmlFor='only-pickup'>Sadece alma hizmeti</Label>
          <Switch
            id='only-pickup'
            checked={value.onlyPickup}
            onCheckedChange={(checked) => onChange({ ...value, onlyPickup: checked })}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Maks. fiyat (₺)</Label>
        <input
          type='number'
          min={0}
          className='flex h-10 w-full rounded-md border bg-background px-3 text-sm'
          placeholder='Opsiyonel'
          value={value.maxPrice ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              maxPrice: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>

      {availableServiceTypes.length > 0 ? (
        <div className='space-y-2'>
          <Label>Servis tipi</Label>
          <div className='flex flex-wrap gap-2'>
            {availableServiceTypes.map((serviceType) => (
              <button
                key={serviceType}
                type='button'
                onClick={() => toggleServiceType(serviceType)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize',
                  value.serviceTypes.includes(serviceType)
                    ? 'border-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                )}
              >
                {serviceType}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
