'use client'

import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Camera, Fingerprint, KeyRound, PenLine } from 'lucide-react'
import { POD_MODE_LABELS } from '../_types/definitions'
import type { OrderTypeDefinition, PodProofKind, PodRule, PodRuleMode } from '../_types/definitions'

type Props = {
  podRules: PodRule[]
  orderTypes: OrderTypeDefinition[]
  onChange: (rule: PodRule) => void
}

const USE_DEFAULT = '__default__'

const KIND_ICONS: Record<PodProofKind, ComponentType<{ className?: string }>> = {
  photo: Camera,
  tc_last4: Fingerprint,
  signature: PenLine,
  otp: KeyRound,
}

const MODE_BADGE_CLASS: Record<PodRuleMode, string> = {
  required: 'border-rose-200 bg-rose-50 text-rose-700',
  optional: 'border-amber-200 bg-amber-50 text-amber-800',
  off: 'border-slate-200 bg-slate-100 text-slate-500',
}

function PodRuleCard({
  rule,
  orderTypes,
  onChange,
}: {
  rule: PodRule
  orderTypes: OrderTypeDefinition[]
  onChange: (rule: PodRule) => void
}) {
  const Icon = KIND_ICONS[rule.kind]

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
      <div className='flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-4 py-3.5'>
        <div className='flex items-start gap-3'>
          <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600'>
            <Icon className='size-4' />
          </span>
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-slate-900'>{rule.label}</p>
            <p className='mt-0.5 text-xs text-slate-500'>{rule.description}</p>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <span className='text-xs font-medium text-slate-500'>Varsayılan</span>
          <Select
            value={rule.defaultMode}
            onValueChange={(value: PodRuleMode) => onChange({ ...rule, defaultMode: value })}
          >
            <SelectTrigger size='sm' className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(POD_MODE_LABELS) as [PodRuleMode, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {orderTypes.length === 0 ? (
        <p className='px-4 py-4 text-xs text-slate-400'>
          Sipariş tipi override&apos;ı için önce etkin bir sipariş tipi tanımlayın.
        </p>
      ) : (
        <ul className='divide-y divide-slate-100'>
          {orderTypes.map((orderType) => {
            const override = rule.byOrderType[orderType.code]
            const effectiveMode = override ?? rule.defaultMode

            return (
              <li
                key={orderType.id}
                className='flex flex-wrap items-center justify-between gap-3 px-4 py-2.5'
              >
                <div className='flex min-w-0 items-center gap-2'>
                  <span className='truncate text-sm font-medium text-slate-700'>
                    {orderType.label}
                  </span>
                  <Badge
                    variant='outline'
                    className={`rounded-md px-1.5 py-0 text-[11px] font-medium shadow-none ${MODE_BADGE_CLASS[effectiveMode]}`}
                  >
                    {POD_MODE_LABELS[effectiveMode]}
                  </Badge>
                </div>

                <Select
                  value={override ?? USE_DEFAULT}
                  onValueChange={(value) => {
                    const nextByOrderType = { ...rule.byOrderType }
                    if (value === USE_DEFAULT) {
                      delete nextByOrderType[orderType.code]
                    } else {
                      nextByOrderType[orderType.code] = value as PodRuleMode
                    }
                    onChange({ ...rule, byOrderType: nextByOrderType })
                  }}
                >
                  <SelectTrigger size='sm' className='w-44'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USE_DEFAULT}>Varsayılanı kullan</SelectItem>
                    {(Object.entries(POD_MODE_LABELS) as [PodRuleMode, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function SectionPod({ podRules, orderTypes, onChange }: Props) {
  const enabledOrderTypes = orderTypes.filter((orderType) => orderType.enabled)

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-base font-semibold text-slate-900'>Teslimat Kanıtı (POD)</h2>
        <p className='mt-1 text-sm text-slate-500'>
          Her POD türü için tenant genelindeki varsayılan kuralı ve sipariş tipi bazlı
          istisnaları yönetin.
        </p>
      </div>

      <div className='space-y-4'>
        {podRules.map((rule) => (
          <PodRuleCard
            key={rule.kind}
            rule={rule}
            orderTypes={enabledOrderTypes}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}
