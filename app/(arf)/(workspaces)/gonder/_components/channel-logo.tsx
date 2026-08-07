'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  resolveChannelLogo,
  type ResolveChannelLogoInput,
} from '../_lib/channel-logo'
import type { OrderChannelConnection, OrderChannelType } from '../_types/orders'

type Size = 'xs' | 'sm' | 'md'

const SIZE_CLASS: Record<Size, string> = {
  xs: 'size-5 rounded-md text-[9px]',
  sm: 'size-7 rounded-md text-[10px]',
  md: 'size-8 rounded-md text-xs',
}

const ICON_SIZE: Record<Size, string> = {
  xs: 'size-2.5',
  sm: 'size-3',
  md: 'size-3.5',
}

type ChannelAvatarProps = {
  type: OrderChannelType
  connection?: OrderChannelConnection | null
  logoUrl?: string | null
  size?: Size
  className?: string
  /** Use Lucide icon instead of initials when image missing (api/excel/manual) */
  preferIconFallback?: boolean
}

export function ChannelAvatar({
  type,
  connection = null,
  logoUrl = null,
  size = 'sm',
  className,
  preferIconFallback = true,
}: ChannelAvatarProps) {
  const logo = resolveChannelLogo({ type, connection, logoUrl })
  const useIcon =
    preferIconFallback && (type === 'api' || type === 'excel' || type === 'manual')
  const FallbackIcon = logo.FallbackIcon

  return (
    <Avatar className={cn(SIZE_CLASS[size], className)} aria-hidden={!logo.label}>
      {logo.src ? (
        <AvatarImage src={logo.src} alt='' className='object-contain p-0.5' />
      ) : null}
      <AvatarFallback
        className={cn(
          'rounded-md font-semibold',
          logo.accentClass,
          useIcon && 'gap-0'
        )}
      >
        {useIcon ? <FallbackIcon className={ICON_SIZE[size]} /> : logo.initials}
      </AvatarFallback>
    </Avatar>
  )
}

type ChannelCellProps = {
  type: OrderChannelType
  connection?: OrderChannelConnection | null
  logoUrl?: string | null
  /** Override primary line (defaults to channel type label) */
  title?: string
  /** Override subtitle (defaults to connection.storeName) */
  subtitle?: string | null
  size?: Size
  className?: string
  dense?: boolean
}

/** Logo + channel name + store/subtitle — list / detail pattern */
export function ChannelCell({
  type,
  connection = null,
  logoUrl = null,
  title,
  subtitle,
  size = 'sm',
  className,
  dense = false,
}: ChannelCellProps) {
  const logo = resolveChannelLogo({ type, connection, logoUrl })
  const primary = title ?? logo.label
  const secondary = subtitle === undefined ? logo.subtitle : subtitle

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <ChannelAvatar
        type={type}
        connection={connection}
        logoUrl={logoUrl}
        size={size}
      />
      <div className='min-w-0'>
        <div className={cn('truncate font-medium', dense ? 'text-xs' : 'text-sm')}>
          {primary}
        </div>
        {secondary ? (
          <div className='truncate text-xs text-muted-foreground'>{secondary}</div>
        ) : null}
      </div>
    </div>
  )
}

type ChannelBadgeProps = {
  type: OrderChannelType
  connection?: OrderChannelConnection | null
  logoUrl?: string | null
  /** Include store name after channel label */
  showStore?: boolean
  className?: string
}

/** Compact badge with logo — kanban / chips */
export function ChannelBadge({
  type,
  connection = null,
  logoUrl = null,
  showStore = true,
  className,
}: ChannelBadgeProps) {
  const logo = resolveChannelLogo({ type, connection, logoUrl })
  const label =
    showStore && logo.subtitle ? `${logo.label} · ${logo.subtitle}` : logo.label

  return (
    <Badge
      variant='outline'
      className={cn('gap-1.5 pr-2 font-normal', className)}
    >
      <ChannelAvatar
        type={type}
        connection={connection}
        logoUrl={logoUrl}
        size='xs'
        className='rounded'
      />
      <span className='truncate'>{label}</span>
    </Badge>
  )
}

export function resolveChannelDisplay(input: ResolveChannelLogoInput) {
  return resolveChannelLogo(input)
}
