'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { searchPlacesAsync } from '../_lib/address-search'
import type { PlaceResult } from '../_lib/order-types'

export function AddressField({
  label,
  placeholder,
  tone,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  tone: 'origin' | 'destination'
  value: PlaceResult | null
  onChange: (place: PlaceResult | null) => void
}) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      searchPlacesAsync(query, controller.signal)
        .then((places) => {
          setResults(places)
          setActiveIndex(0)
          setOpen(true)
        })
        .catch(() => undefined)
        .finally(() => setLoading(false))
    }, 180)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const select = (place: PlaceResult) => {
    onChange(place)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const accent = tone === 'origin' ? 'var(--gl-petrol)' : 'var(--gl-accent)'

  if (value) {
    return (
      <div>
        <label className='gl-eyebrow' htmlFor={inputId}>
          {label}
        </label>
        <div className='mt-2 flex items-start gap-3 rounded-xl border-2 border-[var(--gl-border)] bg-white p-3'>
          <span
            className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg'
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, white)` }}
          >
            <MapPin className='size-4' style={{ color: accent }} aria-hidden />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-[var(--gl-ink)]'>{value.title}</p>
            <p className='truncate text-xs text-[var(--gl-muted)]'>{value.subtitle}</p>
          </div>
          <button
            type='button'
            id={inputId}
            onClick={() => onChange(null)}
            className='shrink-0 rounded-lg p-1.5 text-[var(--gl-muted)] transition-colors hover:bg-[var(--gl-subtle)] hover:text-[var(--gl-ink)]'
            aria-label={`${label} seçimini temizle`}
          >
            <X className='size-4' aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapperRef}>
      <label className='gl-eyebrow' htmlFor={inputId}>
        {label}
      </label>
      <div className='relative mt-2'>
        <Search className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--gl-muted)]' aria-hidden />
        <input
          id={inputId}
          type='text'
          role='combobox'
          aria-expanded={open}
          aria-autocomplete='list'
          autoComplete='off'
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || results.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => (i + 1) % results.length)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => (i - 1 + results.length) % results.length)
            } else if (e.key === 'Enter') {
              e.preventDefault()
              select(results[activeIndex])
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className='w-full rounded-xl border-2 border-[var(--gl-border)] bg-white py-3 pl-10 pr-10 text-sm text-[var(--gl-ink)] outline-none transition-colors placeholder:text-[var(--gl-muted)] focus:border-[var(--gl-petrol)]'
        />
        {loading ? (
          <Loader2 className='absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-[var(--gl-muted)]' aria-hidden />
        ) : null}

        {open && results.length > 0 ? (
          <ul
            role='listbox'
            className='absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--gl-border)] bg-white p-1.5 shadow-[0_24px_56px_-24px_rgb(25_45_50_/_0.3)]'
          >
            {results.map((place, index) => (
              <li key={place.id}>
                <button
                  type='button'
                  role='option'
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(place)}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    index === activeIndex ? 'bg-[var(--gl-subtle)]' : ''
                  }`}
                >
                  <MapPin className='mt-0.5 size-4 shrink-0 text-[var(--gl-muted)]' aria-hidden />
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium text-[var(--gl-ink)]'>{place.title}</span>
                    <span className='block truncate text-xs text-[var(--gl-muted)]'>{place.subtitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {open && !loading && results.length === 0 && query.trim().length >= 2 ? (
          <div className='absolute z-20 mt-1.5 w-full rounded-xl border border-[var(--gl-border)] bg-white p-4 text-sm text-[var(--gl-muted)] shadow-[0_24px_56px_-24px_rgb(25_45_50_/_0.3)]'>
            Sonuç bulunamadı. Şehir veya ilçe adıyla dene.
          </div>
        ) : null}
      </div>
    </div>
  )
}
