/**
 * ErrorsKit Context & Provider
 * 
 * Provides error handling configuration and error page components
 */

'use client'

import React, { createContext, useContext, useMemo } from 'react'
import {
  ErrorsKitContextValue,
  ErrorsKitProviderProps,
} from './types'
import { createErrorHandler } from '../handler/createErrorHandler'

/**
 * ErrorsKit context
 */
const ErrorsKitContext = createContext<ErrorsKitContextValue | undefined>(
  undefined
)

/**
 * ErrorsKit Provider
 * 
 * Provides error handling configuration and error page components.
 * 
 * @example
 * ```typescript
 * const errorMap = {
 *   'not-found': NotFoundPage,
 *   'unauthorized': UnauthorizedPage,
 *   'forbidden': ForbiddenPage,
 *   'internal-server-error': ServerErrorPage,
 * }
 * 
 * <ErrorsKitProvider 
 *   errorMap={errorMap}
 *   handlerConfig={{
 *     onToast: (msg) => toast.error(msg),
 *     onRedirect: (path) => router.push(path),
 *     on401: '/login',
 *   }}
 * >
 *   <App />
 * </ErrorsKitProvider>
 * ```
 */
export function ErrorsKitProvider({
  children,
  errorMap,
  handlerConfig,
  fallbackComponent: _fallbackComponent,
}: ErrorsKitProviderProps) {
  // Create error handler instance
  const handler = useMemo(
    () => (handlerConfig ? createErrorHandler(handlerConfig) : undefined),
    [handlerConfig]
  )

  const contextValue = useMemo<ErrorsKitContextValue>(
    () => ({
      errorMap,
      handlerConfig,
      handler,
    }),
    [errorMap, handlerConfig, handler]
  )

  return (
    <ErrorsKitContext.Provider value={contextValue}>
      {children}
    </ErrorsKitContext.Provider>
  )
}

/**
 * Hook to access ErrorsKit context
 * 
 * @throws {Error} If used outside ErrorsKitProvider
 */
export function useErrorsKitContext(): ErrorsKitContextValue {
  const context = useContext(ErrorsKitContext)

  if (!context) {
    throw new Error(
      'useErrorsKitContext must be used within ErrorsKitProvider'
    )
  }

  return context
}
