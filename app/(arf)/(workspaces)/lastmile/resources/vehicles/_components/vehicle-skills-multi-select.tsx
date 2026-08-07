'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { VehicleSkill, VehicleSkillOption } from '../_types/vehicle'
import { resolveSkillLabel } from '../_lib/query-vehicles'

type Props = {
  value: VehicleSkill[]
  onChange: (next: VehicleSkill[]) => void
  options: VehicleSkillOption[]
  isLoading?: boolean
  placeholder?: string
  invalid?: boolean
}

export function VehicleSkillsMultiSelect({
  value,
  onChange,
  options,
  isLoading = false,
  placeholder = 'Yetenek seçin',
  invalid,
}: Props) {
  const [open, setOpen] = useState(false)

  const labelMap = Object.fromEntries(options.map((item) => [item.code, item.name]))

  const toggle = (skill: VehicleSkill) => {
    if (value.includes(skill)) {
      onChange(value.filter((item) => item !== skill))
      return
    }
    onChange([...value, skill])
  }

  const selectedLabels = value.map((skill) => resolveSkillLabel(skill, labelMap))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          disabled={isLoading}
          className={cn(
            'h-10 w-full justify-between rounded-lg px-3 font-normal',
            value.length === 0 && 'text-muted-foreground',
            invalid && 'border-rose-300 focus-visible:ring-rose-200'
          )}
        >
          <span className='truncate'>
            {isLoading ? (
              <span className='inline-flex items-center gap-2'>
                <Loader2 className='size-4 animate-spin' />
                Yetenekler yükleniyor…
              </span>
            ) : value.length === 0 ? (
              placeholder
            ) : value.length === 1 ? (
              selectedLabels[0]
            ) : (
              `${value.length} yetenek`
            )}
          </span>
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-(--radix-popover-trigger-width) overflow-hidden rounded-xl p-1.5'
        align='start'
      >
        <div className='max-h-56 space-y-0.5 overflow-y-auto'>
          {options.length === 0 ? (
            <p className='px-2 py-3 text-sm text-muted-foreground'>
              {isLoading ? 'Yükleniyor…' : 'Tanımlı yetenek bulunamadı.'}
            </p>
          ) : (
            options.map((option) => {
              const selected = value.includes(option.code)
              return (
                <button
                  key={option.code}
                  type='button'
                  onClick={() => toggle(option.code)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors',
                    selected
                      ? 'bg-lime-50 text-lime-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                      selected
                        ? 'border-lime-400 bg-lime-400 text-slate-900'
                        : 'border-lime-300 bg-white'
                    )}
                  >
                    {selected ? <Check className='size-2.5 stroke-3' /> : null}
                  </span>
                  <span className='min-w-0 flex-1 truncate text-sm'>{option.name}</span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
