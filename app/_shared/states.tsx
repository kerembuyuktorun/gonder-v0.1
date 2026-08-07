import React from 'react'
import { AlertCircle, PackageOpen, Loader2, RefreshCw, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ─── Empty State ────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Sonuç Bulunamadı',
  description = 'Aradığınız kriterlere uygun öge bulunamadı.',
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 text-center ${className}`}>
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-xs">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-2 justify-center">
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button variant="outline" asChild>
              <a href={secondaryAction.href}>
                <ArrowLeft className="mr-1 size-4" />
                {secondaryAction.label}
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Error State ─────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string
  description?: string
  errorCode?: string | number
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Bir hata oluştu',
  description = 'İşlem tamamlanamadı. Lütfen tekrar deneyin.',
  errorCode,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <Card className={`border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
          {title}
          {errorCode && (
            <span className="ml-auto font-mono text-sm font-normal opacity-60">
              [{errorCode}]
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-red-600 dark:text-red-300">
          {description}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400"
          >
            <RefreshCw className="mr-1 size-4" />
            Tekrar Dene
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

// ─── Loading State ────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  message = 'Yükleniyor...',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  const iconSize = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-10' : 'size-6'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
  const padding = size === 'sm' ? 'py-6' : size === 'lg' ? 'py-24' : 'py-16'

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${padding} text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 className={`${iconSize} animate-spin`} aria-hidden="true" />
      <p className={textSize}>{message}</p>
    </div>
  )
}

// ─── Card-based Skeleton ─────────────────────────────────────────────────────

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-6 space-y-3 animate-pulse"
          aria-hidden="true"
        >
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-12 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Table Skeleton ────────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border overflow-hidden animate-pulse" aria-hidden="true">
      {/* Header */}
      <div className="flex border-b bg-muted/30 px-4 py-3 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-muted flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center border-b last:border-b-0 px-4 py-4 gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`h-3 rounded bg-muted ${colIdx === 0 ? 'w-24' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
