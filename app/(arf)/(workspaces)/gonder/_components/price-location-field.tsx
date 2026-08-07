'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Clock3, MapPin, Search, Tag, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  placesRepository,
  suggestionToLocation,
} from '../_data/places-repository'
import type {
  LocationSuggestion,
  LocationSuggestResult,
  PriceCalculationLocation,
} from '../_types/price-calculation'

const PLACEHOLDER = 'İl, ilçe veya adres ara'

type Props = {
  label: string
  value: PriceCalculationLocation | null
  onSelect: (value: PriceCalculationLocation) => void
  onClear: () => void
  invalid?: boolean
}

type RenderSection = {
  title: string
  icon: typeof MapPin
  items: Array<LocationSuggestion & { flatIndex: number }>
}

export function PriceLocationField({
  label,
  value,
  onSelect,
  onClear,
  invalid,
}: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)
  const [query, setQuery] = useState(value?.label ?? '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [groups, setGroups] = useState<LocationSuggestResult>({
    recent: [],
    saved: [],
    search: [],
  })
  const [loading, setLoading] = useState(false)

  const selected = Boolean(value?.label?.trim())
  const showList = open && !selected

  const sections = useMemo(() => {
    let index = 0
    const withIndex = (items: LocationSuggestion[]) =>
      items.map((item) => ({ ...item, flatIndex: index++ }))

    const result: RenderSection[] = []
    if (groups.recent.length) {
      result.push({ title: 'Son kullanılanlar', icon: Clock3, items: withIndex(groups.recent) })
    }
    if (groups.saved.length) {
      result.push({ title: 'Kayıtlı adresler', icon: Tag, items: withIndex(groups.saved) })
    }
    if (groups.search.length) {
      result.push({ title: 'Arama sonuçları', icon: MapPin, items: withIndex(groups.search) })
    }
    return result
  }, [groups])

  const flat = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections]
  )

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
  }, [groups])

  useEffect(() => {
    if (selected || !open) return

    const requestId = ++requestIdRef.current
    setLoading(true)
    const timer = window.setTimeout(async () => {
      const result = await placesRepository.suggestForPrice(query)
      if (requestId !== requestIdRef.current) return
      setLoading(false)
      setGroups(result)
    }, 180)

    return () => window.clearTimeout(timer)
  }, [query, selected, open])

  function selectSuggestion(suggestion: LocationSuggestion) {
    const location = suggestionToLocation(suggestion)
    placesRepository.recordRecent(location)
    onSelect(location)
    setQuery(location.label)
    setOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || flat.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((current) => (current + 1) % flat.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((current) => (current - 1 + flat.length) % flat.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = flat[highlight]
      if (item) selectSuggestion(item)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className='relative min-w-0 space-y-1'>
      <label className='text-xs font-medium text-muted-foreground'>{label}</label>
      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={query}
          placeholder={PLACEHOLDER}
          aria-autocomplete='list'
          aria-controls={listId}
          aria-expanded={showList}
          aria-invalid={invalid || undefined}
          className={cn('h-10 pr-10 pl-9', invalid && 'border-destructive')}
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
              setGroups({ recent: [], saved: [], search: [] })
              setOpen(false)
            }}
            aria-label='Konumu temizle'
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
          className='absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border bg-popover shadow-md'
        >
          {loading ? (
            <p className='px-3 py-3 text-sm text-muted-foreground'>Konumlar aranıyor…</p>
          ) : flat.length === 0 ? (
            <p className='px-3 py-3 text-sm text-muted-foreground'>
              {query.trim().length >= 2
                ? 'Sonuç bulunamadı'
                : 'Son kullanılan veya kayıtlı adreslerden seçin'}
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.title} className='py-1'>
                <p className='flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
                  <section.icon className='size-3' />
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type='button'
                    role='option'
                    aria-selected={item.flatIndex === highlight}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-muted/60',
                      item.flatIndex === highlight && 'bg-muted/60'
                    )}
                    onMouseEnter={() => setHighlight(item.flatIndex)}
                    onClick={() => selectSuggestion(item)}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <span className='text-sm font-medium'>{item.label}</span>
                      {item.savedTag ? (
                        <Badge variant='secondary' className='shrink-0 text-[10px]'>
                          {item.savedTag}
                        </Badge>
                      ) : null}
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {[item.district, item.city].filter(Boolean).join(', ')}
                      {item.customerName ? ` · ${item.customerName}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
