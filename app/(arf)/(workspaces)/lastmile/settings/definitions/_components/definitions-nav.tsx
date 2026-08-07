'use client'

import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'
import {
  ListChecks,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Tags,
  TriangleAlert,
} from 'lucide-react'
import type { DefinitionsSectionId } from '../_types/definitions'

type NavItem = {
  id: DefinitionsSectionId
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'order_types',
    label: 'Sipariş Tipleri',
    description: 'Kullanılabilir sipariş akışları',
    icon: ListChecks,
  },
  {
    id: 'tags',
    label: 'Etiketler',
    description: 'Sipariş, müşteri ve kurye etiketleri',
    icon: Tags,
  },
  {
    id: 'skills',
    label: 'Yetkinlikler',
    description: 'Rotalama motoru eşleşme kuralları',
    icon: Sparkles,
  },
  {
    id: 'pod',
    label: 'Teslimat Kanıtı',
    description: 'POD zorunluluk kuralları',
    icon: ShieldCheck,
  },
  {
    id: 'reasons',
    label: 'Ret / İptal Kodları',
    description: 'Teslim edilemedi ve iptal nedenleri',
    icon: TriangleAlert,
  },
  {
    id: 'templates',
    label: 'Bildirim Şablonları',
    description: 'SMS ve e-posta içerikleri',
    icon: MessageSquareText,
  },
]

type Props = {
  active: DefinitionsSectionId
  onChange: (id: DefinitionsSectionId) => void
}

export function DefinitionsNav({ active, onChange }: Props) {
  return (
    <nav
      aria-label='Tanımlama bölümleri'
      className='flex gap-1.5 overflow-x-auto pb-1 lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-visible lg:border-r lg:border-slate-100 lg:pr-4 lg:pb-0'
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id

        return (
          <button
            key={item.id}
            type='button'
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors lg:shrink',
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                isActive ? 'bg-white/10 text-lime-300' : 'bg-slate-100 text-slate-500'
              )}
            >
              <Icon className='size-4' />
            </span>
            <span className='min-w-0'>
              <span className='block truncate text-sm font-semibold'>{item.label}</span>
              <span
                className={cn(
                  'hidden truncate text-xs lg:block',
                  isActive ? 'text-white/60' : 'text-slate-400'
                )}
              >
                {item.description}
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
