'use client'

import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { tRowAction } from '../../_i18n/row-actions'

export type RowActionVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
/** Prefer `primary` | `overflow` in sticky/narrow columns; `secondary` fills leftover visible slots only. */
export type RowActionPriority = 'primary' | 'secondary' | 'overflow'

export type RowActionConfirmation = {
  titleKey: string
  descriptionKey: string
  confirmLabelKey: string
}

/**
 * Satır aksiyonu sözleşmesi.
 * `label` geriye dönük uyumluluk için desteklenir; tercihen `labelKey` kullanın.
 */
export type RowQuickAction = {
  id: string
  /** i18n anahtarı — örn. orders.approve */
  labelKey?: string
  shortLabelKey?: string
  /** Ham metin (labelKey yoksa) */
  label?: string
  icon?: LucideIcon | ComponentType<{ className?: string }>
  variant?: RowActionVariant
  priority?: RowActionPriority
  disabled?: boolean
  disabledReasonKey?: string
  requiresConfirmation?: boolean
  confirmation?: RowActionConfirmation
  onClick: () => unknown
  /** @deprecated variant kullanın — success→primary, danger→destructive */
  tone?: 'default' | 'success' | 'danger' | 'warning'
}

/** @deprecated RowQuickAction kullanın */
export type RowActionDefinition = RowQuickAction

type ResolvedAction = RowQuickAction & {
  resolvedLabel: string
  resolvedShortLabel: string
  resolvedVariant: RowActionVariant
  resolvedPriority: RowActionPriority
}

type Props = {
  actions: RowQuickAction[]
  trailing?: ReactNode
  /** Görünür metinli buton üst sınırı (varsayılan 1 — sticky/dar sütunlar için) */
  maxVisible?: number
  className?: string
}

function resolveVariant(action: RowQuickAction): RowActionVariant {
  if (action.variant) return action.variant
  if (action.tone === 'danger') return 'destructive'
  if (action.tone === 'success') return 'primary'
  if (action.priority === 'primary') return 'primary'
  if (action.priority === 'secondary') return 'secondary'
  return 'ghost'
}

function toButtonVariant(
  variant: RowActionVariant
): 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline' {
  if (variant === 'primary') return 'default'
  if (variant === 'secondary') return 'outline'
  if (variant === 'destructive') return 'destructive'
  return 'ghost'
}

function resolvePriority(action: RowQuickAction, index: number): RowActionPriority {
  if (action.priority) return action.priority
  if (action.tone === 'danger' || action.variant === 'destructive') return 'overflow'
  if (index === 0) return 'primary'
  return 'overflow'
}

function resolveLabel(action: RowQuickAction): string {
  if (action.labelKey) return tRowAction(action.labelKey, action.label)
  return action.label ?? action.id
}

function resolveShortLabel(action: RowQuickAction, full: string): string {
  if (action.shortLabelKey) return tRowAction(action.shortLabelKey, full)
  return full
}

/**
 * Visible slots prefer `primary`, then `secondary` if slots remain.
 * Everything else (including demoted secondary) goes to the overflow menu,
 * preserving original action order in the menu.
 */
function partitionActions(actions: ResolvedAction[], maxVisible: number) {
  const limit = Math.max(0, maxVisible)
  const primaries = actions.filter((a) => a.resolvedPriority === 'primary')
  const secondaries = actions.filter((a) => a.resolvedPriority === 'secondary')
  const visibleCandidates = [...primaries, ...secondaries]
  const visible = visibleCandidates.slice(0, limit)
  const visibleIds = new Set(visible.map((a) => a.id))
  const overflow = actions.filter((a) => !visibleIds.has(a.id))
  return { visible, overflow }
}

export function RowQuickActions({
  actions,
  trailing,
  maxVisible = 1,
  className,
}: Props) {
  const [pending, setPending] = useState<ResolvedAction | null>(null)

  const resolved = useMemo<ResolvedAction[]>(
    () =>
      actions
        .filter(Boolean)
        .map((action, index) => {
          const resolvedLabel = resolveLabel(action)
          return {
            ...action,
            resolvedLabel,
            resolvedShortLabel: resolveShortLabel(action, resolvedLabel),
            resolvedVariant: resolveVariant(action),
            resolvedPriority: resolvePriority(action, index),
          }
        }),
    [actions]
  )

  const { visible, overflow } = useMemo(
    () => partitionActions(resolved, maxVisible),
    [maxVisible, resolved]
  )

  async function runAction(action: ResolvedAction) {
    if (action.disabled) return
    if (action.requiresConfirmation || action.confirmation) {
      setPending(action)
      return
    }
    await action.onClick()
  }

  async function confirmPending() {
    if (!pending) return
    const action = pending
    setPending(null)
    await action.onClick()
  }

  if (resolved.length === 0 && !trailing) return null

  const moreLabel = tRowAction('actions.more')

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          // w-auto keeps kanban/card rows from stretching; table sticky cells size the column.
          'flex w-auto min-w-[7.5rem] max-w-full items-center justify-end gap-1.5 whitespace-nowrap',
          className
        )}
      >
        {visible.map((action) => {
          const Icon = action.icon
          const button = (
            <Button
              key={action.id}
              type='button'
              size='sm'
              variant={toButtonVariant(action.resolvedVariant)}
              disabled={action.disabled}
              className='h-7 shrink-0 gap-1 px-2.5 text-xs'
              onClick={() => void runAction(action)}
            >
              {Icon ? <Icon className='size-3.5 shrink-0' /> : null}
              <span className='max-w-[7rem] truncate'>{action.resolvedShortLabel}</span>
            </Button>
          )

          if (action.disabled && action.disabledReasonKey) {
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <span className='inline-flex'>{button}</span>
                </TooltipTrigger>
                <TooltipContent>{tRowAction(action.disabledReasonKey)}</TooltipContent>
              </Tooltip>
            )
          }

          return button
        })}

        {overflow.length > 0 ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    className='h-7 w-7 shrink-0 px-0'
                    aria-label={moreLabel}
                  >
                    <MoreHorizontal className='size-3.5' />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{moreLabel}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align='end' className='min-w-[11rem]'>
              {overflow.map((action) => {
                const Icon = action.icon
                return (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={action.disabled}
                    variant={
                      action.resolvedVariant === 'destructive' ? 'destructive' : 'default'
                    }
                    onSelect={() => {
                      void runAction(action)
                    }}
                  >
                    {Icon ? <Icon className='size-3.5' /> : null}
                    <span>{action.resolvedLabel}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {trailing}
      </div>

      <AlertDialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.confirmation
                ? tRowAction(pending.confirmation.titleKey)
                : pending?.resolvedLabel}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.confirmation
                ? tRowAction(pending.confirmation.descriptionKey)
                : tRowAction('actions.confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tRowAction('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                pending?.resolvedVariant === 'destructive' &&
                  'bg-destructive text-white hover:bg-destructive/90'
              )}
              onClick={() => void confirmPending()}
            >
              {pending?.confirmation
                ? tRowAction(pending.confirmation.confirmLabelKey)
                : tRowAction('actions.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
