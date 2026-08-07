'use client'

import React, { type ErrorInfo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export interface GlobalErrorBoundaryProps {
  children: ReactNode
  homePath?: string
  title?: string
  genericMessage?: string
  retryLabel?: string
  goHomeLabel?: string
  showErrorDetails?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  onGoHome?: () => void
  fallback?: (props: {
    error: Error | null
    reset: () => void
    goHome: () => void
  }) => ReactNode
}

interface GlobalErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface GlobalErrorBoundaryInnerProps extends GlobalErrorBoundaryProps {
  navigateHome: (path: string) => void
}

class GlobalErrorBoundaryInner extends React.Component<GlobalErrorBoundaryInnerProps, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  goHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome()
      return
    }

    this.props.navigateHome(this.props.homePath || '/')
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.reset,
        goHome: this.goHome,
      })
    }

    const shouldShowDetails =
      this.props.showErrorDetails ?? process.env.NODE_ENV !== 'production'
    const errorDetails = this.state.error?.message
      ? this.state.error.message.replace(/\s+/g, ' ').slice(0, 260)
      : ''

    return (
      <div className="flex min-h-[320px] items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold">{this.props.title || 'Application error'}</h2>
          <p className="text-sm text-muted-foreground">
            {this.props.genericMessage ||
              'An unexpected error occurred. You can reset the view or go back to the home page.'}
          </p>

          {shouldShowDetails && !!errorDetails && (
            <p className="rounded-md bg-muted p-2 text-left text-xs text-muted-foreground">
              {errorDetails}
            </p>
          )}

          <div className="flex items-center justify-center gap-2">
            <Button onClick={this.reset}>{this.props.retryLabel || 'Retry'}</Button>
            <Button variant="outline" onClick={this.goHome}>
              {this.props.goHomeLabel || 'Go Home'}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export function GlobalErrorBoundary(props: GlobalErrorBoundaryProps) {
  const router = useRouter()

  return (
    <GlobalErrorBoundaryInner
      {...props}
      navigateHome={(path) => router.push(path)}
    />
  )
}
