'use client'

import { Minus, Plus } from 'lucide-react'
import { useId, type ReactNode } from 'react'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix,
  inputMode,
  maxLength,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  suffix?: string
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email'
  maxLength?: number
  autoComplete?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className='gl-eyebrow'>
        {label}
      </label>
      <div className='relative mt-2'>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className='w-full rounded-xl border-2 border-[var(--gl-border)] bg-white px-3.5 py-3 text-sm text-[var(--gl-ink)] outline-none transition-colors placeholder:text-[var(--gl-muted)] focus:border-[var(--gl-petrol)]'
          style={suffix ? { paddingRight: '3rem' } : undefined}
        />
        {suffix ? (
          <span className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--gl-muted)]'>
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  step = 1,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  suffix?: string
  min?: number
  step?: number
}) {
  return (
    <TextField
      label={label}
      value={value === 0 ? '' : String(value)}
      placeholder='0'
      inputMode='decimal'
      suffix={suffix}
      onChange={(raw) => {
        const parsed = Number(raw.replace(',', '.'))
        if (raw === '') onChange(0)
        else if (!Number.isNaN(parsed) && parsed >= min) onChange(Math.round(parsed / step) * step)
      }}
    />
  )
}

export function QuantityStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  return (
    <div>
      <p className='gl-eyebrow'>{label}</p>
      <div className='mt-2 inline-flex items-center gap-1 rounded-xl border-2 border-[var(--gl-border)] bg-white p-1'>
        <button
          type='button'
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label='Azalt'
          className='flex size-9 items-center justify-center rounded-lg text-[var(--gl-ink)] transition-colors hover:bg-[var(--gl-subtle)] disabled:opacity-30'
        >
          <Minus className='size-4' aria-hidden />
        </button>
        <span className='min-w-10 text-center text-sm font-semibold tabular-nums'>{value}</span>
        <button
          type='button'
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label='Artır'
          className='flex size-9 items-center justify-center rounded-lg text-[var(--gl-ink)] transition-colors hover:bg-[var(--gl-subtle)] disabled:opacity-30'
        >
          <Plus className='size-4' aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  icon,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: ReactNode
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
        checked ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)]' : 'border-[var(--gl-border)] bg-white'
      }`}
    >
      {icon ? <span className='shrink-0 text-[var(--gl-petrol)]'>{icon}</span> : null}
      <span className='min-w-0 flex-1'>
        <span className='block text-sm font-medium text-[var(--gl-ink)]'>{label}</span>
        {hint ? <span className='block text-xs text-[var(--gl-muted)]'>{hint}</span> : null}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[var(--gl-petrol)]' : 'bg-[var(--gl-border-strong)]'
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className='gl-eyebrow'>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='mt-2 w-full appearance-none rounded-xl border-2 border-[var(--gl-border)] bg-white bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23566%27 stroke-width=%272%27%3e%3cpath d=%27M6 9l6 6 6-6%27/%3e%3c/svg%3e")] bg-[length:18px] bg-[right_0.85rem_center] bg-no-repeat py-3 pl-3.5 pr-10 text-sm text-[var(--gl-ink)] outline-none transition-colors focus:border-[var(--gl-petrol)]'
      >
        {placeholder ? <option value=''>{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
