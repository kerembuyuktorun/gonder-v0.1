'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { placesRepository } from '../_data/places-repository'
import type { AddressDraft, AddressSuggestion } from '../_types/price-calculation'

function formatSuggestionLabel(suggestion: AddressSuggestion) {
  return suggestion.secondary
    ? `${suggestion.primary}, ${suggestion.secondary}`
    : suggestion.primary
}

type Props = {
  label: string
  value: AddressDraft | null
  onSelect: (value: AddressDraft) => void
  onClear: () => void
  placeholder?: string
  invalid?: boolean
  compact?: boolean
}

export function AddressSearchField({
  label,
  value,
  onSelect,
  onClear,
  placeholder = 'Şehir, ilçe veya adres ara…',
  invalid,
  compact = false,
}: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)
  const [query, setQuery] = useState(value?.label ?? '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  const selected = Boolean(value?.label?.trim())
  const showList = open && !selected && query.trim().length >= 2

  useEffect(() => {
    setQuery(value?.label ?? '')
  }, [value?.label])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
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
      const result = await placesRepository.search(input)
      if (requestId !== requestIdRef.current) return
      setLoading(false)
      setSuggestions(result)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query, selected])

  function selectSuggestion(suggestion: AddressSuggestion) {
    const labelText = formatSuggestionLabel(suggestion)
    onSelect({
      label: labelText,
      line1: suggestion.line1 ?? suggestion.primary,
      district: suggestion.district,
      city: suggestion.city,
      lat: suggestion.lat,
      lng: suggestion.lng,
      placeId: suggestion.placeId ?? suggestion.id,
    })
    setQuery(labelText)
    setOpen(false)
    setSuggestions([])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((current) => (current - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectSuggestion(suggestions[highlight]!)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', compact ? 'space-y-1' : 'space-y-1.5')}>
      <label className={cn('font-medium', compact ? 'text-xs text-muted-foreground' : 'text-sm')}>
        {label}
      </label>
      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={query}
          placeholder={placeholder}
          aria-autocomplete='list'
          aria-controls={listId}
          aria-expanded={showList}
          aria-invalid={invalid || undefined}
          className={cn('pr-10 pl-9', compact && 'h-9', invalid && 'border-destructive')}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            if (selected) onClear()
            setQuery(event.target.value)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
        {selected || query ? (
          <button
            type='button'
            className='absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted'
            onClick={() => {
              onClear()
              setQuery('')
              setSuggestions([])
              setOpen(false)
            }}
            aria-label='Adresi temizle'
          >
            <X className='size-4' />
          </button>
        ) : null}
      </div>

      {value?.city || value?.district ? (
        <p className='flex items-center gap-1 text-[11px] text-muted-foreground'>
          <MapPin className='size-3' />
          {[value.district, value.city].filter(Boolean).join(', ')}
        </p>
      ) : null}

      {showList ? (
        <div
          id={listId}
          role='listbox'
          className='absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border bg-popover shadow-md'
        >
          {loading ? (
            <p className='px-3 py-3 text-sm text-muted-foreground'>Adresler aranıyor…</p>
          ) : suggestions.length === 0 ? (
            <p className='px-3 py-3 text-sm text-muted-foreground'>Sonuç bulunamadı</p>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type='button'
                role='option'
                aria-selected={index === highlight}
                className={cn(
                  'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-muted/60',
                  index === highlight && 'bg-muted/60'
                )}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                <span className='text-sm font-medium'>{suggestion.primary}</span>
                {suggestion.secondary ? (
                  <span className='text-xs text-muted-foreground'>{suggestion.secondary}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
