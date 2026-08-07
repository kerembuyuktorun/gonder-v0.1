/**
 * Errors-Kit Type Definitions
 * 
 * Type-safe error handling with level-based actions
 */

import { ComponentType } from 'react'

// ============================================================================
// Error Levels
// ============================================================================

/**
 * Error severity levels determining how errors are handled
 */
export type ErrorLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * Actions to take based on error level
 */
export type LevelAction = 'toast' | 'redirect' | 'reload' | 'modal'

/**
 * Mapping of error levels to actions
 */
export interface LevelActionsConfig {
  low: LevelAction
  medium: LevelAction
  high: LevelAction
  critical: LevelAction
}

/**
 * Default level actions configuration
 */
export const DEFAULT_LEVEL_ACTIONS: LevelActionsConfig = {
  low: 'toast',      // Show toast notification
  medium: 'toast',   // Show toast notification
  high: 'redirect',  // Redirect to error page
  critical: 'modal', // Show modal + potential reload
}

// ============================================================================
// Status/Code Mapping
// ============================================================================

/**
 * HTTP status code to error level mapping
 */
export type LevelForStatus = Record<number, ErrorLevel>

/**
 * Default HTTP status to level mapping
 */
export const DEFAULT_LEVEL_FOR_STATUS: LevelForStatus = {
  400: 'medium',    // Bad Request
  401: 'high',      // Unauthorized
  403: 'high',      // Forbidden
  404: 'high',      // Not Found
  408: 'medium',    // Request Timeout
  422: 'medium',    // Unprocessable Entity
  429: 'medium',    // Too Many Requests
  500: 'critical',  // Internal Server Error
  502: 'critical',  // Bad Gateway
  503: 'critical',  // Service Unavailable
  504: 'medium',    // Gateway Timeout
}

/**
 * API error code to error level mapping
 */
export type LevelForCode = Record<string, ErrorLevel>

/**
 * HTTP status code to error slug mapping (for routing)
 */
export type StatusToSlug = Record<number, string>

/**
 * Default status to slug mapping
 */
export const DEFAULT_STATUS_TO_SLUG: StatusToSlug = {
  400: 'bad-request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not-found',
  408: 'timeout',
  422: 'validation-error',
  429: 'too-many-requests',
  500: 'internal-server-error',
  502: 'bad-gateway',
  503: 'maintenance-error',
  504: 'gateway-timeout',
}

// ============================================================================
// Error Normalization
// ============================================================================

/**
 * Normalized error object with consistent structure
 */
export interface NormalizedError {
  status?: number
  code?: string
  message?: string
  level?: ErrorLevel
  data?: unknown
  originalError: unknown
}

/**
 * Axios-style error response
 */
export interface AxiosError {
  response?: {
    status?: number
    data?: unknown
  }
  message?: string
}

/**
 * Fetch-style error response
 */
export interface FetchError {
  status?: number
  statusText?: string
  message?: string
}

/**
 * Custom error with status/code
 */
export interface CustomError {
  status?: number
  code?: string
  message?: string
}

// ============================================================================
// Handler Configuration
// ============================================================================

/**
 * Error handler configuration
 */
export interface HandlerConfig {
  // Level Mapping
  levelForStatus?: LevelForStatus
  levelForCode?: LevelForCode
  levelActions?: LevelActionsConfig

  // Routing
  statusToSlug?: StatusToSlug
  errorsBasePath?: string // default: '/errors'

  // Callbacks
  onRedirect?: (path: string) => void
  onToast?: (message: string, level?: ErrorLevel) => void
  on401?: ((error: NormalizedError) => void) | string // callback or logout path
  onCritical?: (error: NormalizedError) => void

  // Message Extraction
  getMessageFromError?: (error: unknown) => string
  messagesByLevel?: Partial<Record<ErrorLevel, string>>
  reloadConfirmationMessage?: (message: string) => string
}

/**
 * Default error messages by level
 */
export const DEFAULT_ERROR_MESSAGES: Record<ErrorLevel, string> = {
  low: 'Something went wrong',
  medium: 'The request could not be completed',
  high: 'Access error',
  critical: 'A system error occurred',
}

// ============================================================================
// Error Handler Interface
// ============================================================================

/**
 * Error handler instance returned by createErrorHandler
 */
export interface ErrorHandler {
  /**
   * Handle an error with optional level override
   */
  handleError: (error: unknown, options?: { level?: ErrorLevel }) => void

  /**
   * Get error level for an error object
   */
  getLevel: (error: unknown) => ErrorLevel

  /**
   * Get error slug for routing
   */
  getSlug: (error: unknown) => string | undefined

  /**
   * Normalize error to consistent structure
   */
  normalizeError: (error: unknown) => NormalizedError

  /**
   * Get user-friendly message from error
   */
  getMessage: (error: unknown) => string
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Error page component map (slug → component)
 */
export type ErrorMap = Record<string, ComponentType<ErrorPageProps>>

/**
 * Props passed to error page components
 */
export interface ErrorPageProps {
  errorCode?: string
  status?: number
  message?: string
  onRetry?: () => void
  onBack?: () => void
}

/**
 * ErrorsKit context value
 */
export interface ErrorsKitContextValue {
  errorMap: ErrorMap
  handlerConfig?: HandlerConfig
  handler?: ErrorHandler
}

/**
 * ErrorsKitProvider props
 */
export interface ErrorsKitProviderProps {
  children: React.ReactNode
  errorMap: ErrorMap
  handlerConfig?: HandlerConfig
  fallbackComponent?: ComponentType<ErrorPageProps>
}
