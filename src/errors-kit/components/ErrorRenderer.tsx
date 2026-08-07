/**
 * ErrorRenderer Component
 * 
 * Renders error pages dynamically based on error code
 */

'use client'

import React from 'react'
import { useErrorsKitContext } from '../context/ErrorsKitProvider'
import { ErrorPageProps } from '../context/types'

export interface ErrorRendererProps extends ErrorPageProps {
  errorCode: string
}

/**
 * ErrorRenderer Component
 * 
 * Dynamically renders error pages based on error code.
 * Fetches component from ErrorsKit provider's errorMap.
 * 
 * @example
 * ```typescript
 * <ErrorRenderer 
 *   errorCode="not-found"
 *   status={404}
 *   message="Sayfa bulunamadı"
 * />
 * ```
 */
export function ErrorRenderer({
  errorCode,
  status,
  message,
  onRetry,
  onBack,
}: ErrorRendererProps) {
  const { errorMap } = useErrorsKitContext()

  // Get error component from map
  const ErrorComponent = errorMap[errorCode]

  // Render error component if found
  if (ErrorComponent) {
    return (
      <ErrorComponent
        errorCode={errorCode}
        status={status}
        message={message}
        onRetry={onRetry}
        onBack={onBack}
      />
    )
  }

  // Fallback UI if no component found
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">
          {status || '???'}
        </h1>
        <h2 className="text-2xl font-semibold">
          {message || 'An error occurred'}
        </h2>
        <p className="text-muted-foreground">
          Error code: {errorCode}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  )
}
