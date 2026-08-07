'use client'

import { cn } from '@/lib/utils'
import {
  formatNationalPhone,
  toStoredPhoneValue,
  TR_PHONE_COUNTRY_PREFIX,
} from '../_lib/phone'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
}

export function PhoneInput({
  id,
  value,
  onChange,
  invalid,
  disabled,
  placeholder = '555 555 5555',
}: Props) {
  const display = formatNationalPhone(value)

  return (
    <div
      className={cn(
        'flex h-10 w-full items-center overflow-hidden rounded-lg border border-input bg-transparent shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        invalid && 'border-rose-300 focus-within:ring-rose-200',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span className='flex h-full items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 select-none'>
        {TR_PHONE_COUNTRY_PREFIX}
      </span>
      <input
        id={id}
        type='tel'
        inputMode='numeric'
        autoComplete='off'
        name={`${id}-national`}
        disabled={disabled}
        aria-invalid={invalid}
        value={display}
        placeholder={placeholder}
        onChange={(event) => onChange(toStoredPhoneValue(event.target.value))}
        onFocus={(event) => {
          // Tarayıcı +90 ile doldurursa ulusal alandan temizle
          const cleaned = toStoredPhoneValue(event.target.value)
          if (cleaned !== value) onChange(cleaned)
        }}
        className='h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed'
      />
    </div>
  )
}
