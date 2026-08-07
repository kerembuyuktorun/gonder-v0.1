'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronRight, MapPin, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AddressSuggestion } from '../_types/order-create'
import {
  fetchAddressAutocomplete,
  fetchAddressGeocode,
  type AddressGeocodeResult,
} from '../_api/address'

function formatSuggestionLabel(suggestion: AddressSuggestion) {
  return suggestion.secondary
    ? `${suggestion.primary}, ${suggestion.secondary}`
    : suggestion.primary
}

function createSessionToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export type AddressSelectResult = {
  label: string
  fullAddress: string
  latitude: number
  longitude: number
  placeId?: string
}

type Props = {
  id?: string
  value: string
  onSelect: (result: AddressSelectResult) => void
  onClear: () => void
  placeholder?: string
  invalid?: boolean
}

export function AddressSearchField({
  id,
  value,
  onSelect,
  onClear,
  placeholder = 'Mahalle, sokak veya cadde ara…',
  invalid,
}: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const sessionTokenRef = useRef(createSessionToken())
  const requestIdRef = useRef(0)
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const selected = Boolean(value.trim())
  const showList = open && !selected && query.trim().length >= 2

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    setHighlight(0)
  }, [suggestions])

  useEffect(() => {
    if (selected) return
    const input = query.trim()
    if (input.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    const timer = window.setTimeout(async () => {
      const result = await fetchAddressAutocomplete(input, sessionTokenRef.current)
      if (requestId !== requestIdRef.current) return
      setLoading(false)
      if (result.success) {
        setSuggestions(result.data.suggestions)
      } else {
        setSuggestions([])
      }
    }, 280)

    return () => window.clearTimeout(timer)
  }, [query, selected])

  async function selectSuggestion(suggestion: AddressSuggestion) {
    const label = formatSuggestionLabel(suggestion)
    setGeocoding(true)
    const geocode = await fetchAddressGeocode(label)
    setGeocoding(false)

    if (!geocode.success) {
      return
    }

    const data = geocode.data as AddressGeocodeResult
    onSelect({
      label: data.formattedAddress || label,
      fullAddress: data.formattedAddress || label,
      latitude: data.latitude,
      longitude: data.longitude,
      placeId: data.placeId || suggestion.id,
    })
    setQuery(data.formattedAddress || label)
    setOpen(false)
    sessionTokenRef.current = createSessionToken()
  }

  function clearSelection() {
    onClear()
    setQuery('')
    setOpen(false)
    setSuggestions([])
    sessionTokenRef.current = createSessionToken()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || suggestions.length === 0) {
      if (event.key === 'Escape') setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((current) => (current - 1 + suggestions.length) % suggestions.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const item = suggestions[highlight]
      if (item) void selectSuggestion(item)
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className='relative'>
      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' />
        <Input
          id={id}
          role='combobox'
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete='list'
          aria-invalid={invalid}
          value={query}
          readOnly={selected || geocoding}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setOpen(true)
            if (value) onClear()
          }}
          onFocus={() => {
            if (!selected) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pr-10 pl-9',
            selected && 'bg-slate-50 font-medium text-slate-900',
            invalid && 'border-rose-300'
          )}
        />
        {query ? (
          <button
            type='button'
            onClick={clearSelection}
            className='absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
            aria-label='Adres aramasını temizle'
          >
            <X className='size-3.5' />
          </button>
        ) : null}
      </div>

      {showList ? (
        <div
          id={listId}
          role='listbox'
          className='absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg'
        >
          {loading ? (
            <p className='px-4 py-3 text-sm text-muted-foreground'>Aranıyor…</p>
          ) : suggestions.length === 0 ? (
            <p className='px-4 py-3 text-sm text-muted-foreground'>
              Sonuç bulunamadı. Mahalle veya sokak adını deneyin.
            </p>
          ) : (
            <ul className='max-h-72 overflow-y-auto py-1'>
              {suggestions.map((suggestion, index) => {
                const active = index === highlight
                return (
                  <li key={suggestion.id} role='option' aria-selected={active}>
                    <button
                      type='button'
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        active ? 'bg-slate-100' : 'hover:bg-slate-50'
                      )}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => void selectSuggestion(suggestion)}
                    >
                      <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
                        <MapPin className='size-3.5' />
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-semibold text-slate-900'>
                          {suggestion.primary}
                        </span>
                        <span className='block truncate text-xs text-muted-foreground'>
                          {suggestion.secondary}
                        </span>
                      </span>
                      <ChevronRight className='size-4 shrink-0 text-slate-300' />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
