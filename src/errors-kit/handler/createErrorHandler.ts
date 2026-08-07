/**
 * Error Handler Factory
 * 
 * Creates a centralized error handler with level-based actions
 */

import {
  ErrorHandler,
  HandlerConfig,
  NormalizedError,
  ErrorLevel,
  AxiosError,
  FetchError,
  CustomError,
  DEFAULT_LEVEL_FOR_STATUS,
  DEFAULT_LEVEL_ACTIONS,
  DEFAULT_STATUS_TO_SLUG,
  DEFAULT_ERROR_MESSAGES,
} from '../context/types'
import { kitLogger } from '../../_shared/logger'

/**
 * Create a centralized error handler with configuration
 * 
 * @example
 * ```typescript
 * const errorHandler = createErrorHandler({
 *   onToast: (msg) => toast.error(msg),
 *   onRedirect: (path) => router.push(path),
 *   on401: '/login',
 * })
 * 
 * try {
 *   await apiCall()
 * } catch (error) {
 *   errorHandler.handleError(error)
 * }
 * ```
 */
export function createErrorHandler(config: HandlerConfig = {}): ErrorHandler {
  const {
    levelForStatus = DEFAULT_LEVEL_FOR_STATUS,
    levelForCode = {},
    levelActions = DEFAULT_LEVEL_ACTIONS,
    statusToSlug = DEFAULT_STATUS_TO_SLUG,
    errorsBasePath = '/errors',
    onRedirect,
    onToast,
    on401,
    onCritical,
    getMessageFromError,
    messagesByLevel,
    reloadConfirmationMessage,
  } = config

  const resolvedMessagesByLevel = {
    ...DEFAULT_ERROR_MESSAGES,
    ...messagesByLevel,
  }

  /**
   * Normalize error to consistent structure
   */
  function normalizeError(error: unknown): NormalizedError {
    // Already normalized
    if (isNormalizedError(error)) {
      return error
    }

    const normalized: NormalizedError = {
      originalError: error,
    }

    // Axios-style error
    if (isAxiosError(error)) {
      normalized.status = error.response?.status
      normalized.data = error.response?.data
      normalized.message = error.message
      const responseData = error.response?.data as Record<string, unknown> | undefined
      
      // Extract code from response data
      if (typeof responseData?.code === 'string') {
        normalized.code = responseData.code
      }
      if (typeof responseData?.message === 'string') {
        normalized.message = responseData.message
      }
    }
    // Fetch-style error
    else if (isFetchError(error)) {
      normalized.status = error.status
      normalized.message = error.message || error.statusText
    }
    // Custom error with status/code
    else if (isCustomError(error)) {
      normalized.status = error.status
      normalized.code = error.code
      normalized.message = error.message
    }
    // Error instance
    else if (error instanceof Error) {
      normalized.message = error.message
    }
    // String error
    else if (typeof error === 'string') {
      normalized.message = error
    }
    // Unknown error
    else {
      normalized.message = 'An unknown error occurred'
    }

    return normalized
  }

  /**
   * Get error level for an error
   */
  function getLevel(error: unknown): ErrorLevel {
    const normalized = normalizeError(error)

    // Already has level
    if (normalized.level) {
      return normalized.level
    }

    // Check code-based mapping
    if (normalized.code && levelForCode[normalized.code]) {
      return levelForCode[normalized.code]
    }

    // Check status-based mapping
    if (normalized.status && levelForStatus[normalized.status]) {
      return levelForStatus[normalized.status]
    }

    // Default to medium
    return 'medium'
  }

  /**
   * Get error slug for routing
   */
  function getSlug(error: unknown): string | undefined {
    const normalized = normalizeError(error)

    if (normalized.status && statusToSlug[normalized.status]) {
      return statusToSlug[normalized.status]
    }

    return undefined
  }

  /**
   * Get user-friendly message from error
   */
  function getMessage(error: unknown): string {
    // Use custom message extractor if provided
    if (getMessageFromError) {
      return getMessageFromError(error)
    }

    const normalized = normalizeError(error)

    // Use error message if available
    if (normalized.message) {
      return normalized.message
    }

    // Use default message based on level
    const level = getLevel(error)
    return resolvedMessagesByLevel[level]
  }

  /**
   * Handle error based on level and configuration
   */
  function handleError(error: unknown, options: { level?: ErrorLevel } = {}) {
    const normalized = normalizeError(error)
    const level = options.level || getLevel(error)
    const action = levelActions[level]

    // Special handling for 401 (Unauthorized)
    if (normalized.status === 401 && on401) {
      if (typeof on401 === 'string') {
        // Redirect to login path
        if (onRedirect) {
          onRedirect(on401)
        } else if (onToast) {
          onToast(getMessage(error), level)
        } else {
          kitLogger.warn('[ErrorHandler] Received a string on401 redirect target without an onRedirect handler.')
        }
      } else {
        // Call custom handler
        on401(normalized)
      }
      return
    }

    // Execute action based on level
    switch (action) {
      case 'toast':
        if (onToast) {
          const message = getMessage(error)
          onToast(message, level)
        } else {
          kitLogger.error(`[${level.toUpperCase()}]`, error)
        }
        break

      case 'redirect': {
        const slug = getSlug(error)
        if (slug && onRedirect) {
          const path = `${errorsBasePath}/${slug}`
          onRedirect(path)
        } else {
          // Fallback to toast if no redirect configured
          if (onToast) {
            const message = getMessage(error)
            onToast(message, level)
          } else {
            kitLogger.error(`[${level.toUpperCase()}]`, error)
          }
        }
        break
      }

      case 'reload':
        if (typeof window !== 'undefined') {
          const message = getMessage(error)
          const shouldReload = window.confirm(
            reloadConfirmationMessage
              ? reloadConfirmationMessage(message)
              : `${message}\n\nWould you like to reload the page?`
          )
          if (shouldReload) {
            window.location.reload()
          }
        }
        break

      case 'modal':
        // Call critical error handler if provided
        if (onCritical) {
          onCritical(normalized)
        } else {
          // Fallback to alert
          if (typeof window !== 'undefined') {
            const message = getMessage(error)
            window.alert(message)
          }
        }
        break

      default:
        kitLogger.error('[UNHANDLED ERROR]', error)
    }
  }

  return {
    handleError,
    getLevel,
    getSlug,
    normalizeError,
    getMessage,
  }
}

// ============================================================================
// Type Guards
// ============================================================================

function isNormalizedError(error: unknown): error is NormalizedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'originalError' in error
  )
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  )
}

function isFetchError(error: unknown): error is FetchError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as FetchError).status === 'number'
  )
}

function isCustomError(error: unknown): error is CustomError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'code' in error)
  )
}
