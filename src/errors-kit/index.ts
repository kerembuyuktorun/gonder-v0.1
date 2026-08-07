/**
 * Errors Kit
 * 
 * Centralized error handling with level-based actions and error pages.
 * 
 * @version 1.1.0
 * @status Production Ready
 */

// ============================================================================
// Components
// ============================================================================

export { ErrorRenderer } from './components/ErrorRenderer'
export type { ErrorRendererProps } from './components/ErrorRenderer'
export { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
export type { GlobalErrorBoundaryProps } from './components/GlobalErrorBoundary'

// ============================================================================
// Context & Provider
// ============================================================================

export {
  ErrorsKitProvider,
  useErrorsKitContext,
} from './context/ErrorsKitProvider'

// ============================================================================
// Hooks
// ============================================================================

export { useErrorHandler } from './context/useErrorHandler'

// ============================================================================
// Handler
// ============================================================================

export { createErrorHandler } from './handler/createErrorHandler'

// ============================================================================
// Types
// ============================================================================

export type {
  ErrorLevel,
  LevelAction,
  LevelActionsConfig,
  LevelForStatus,
  LevelForCode,
  StatusToSlug,
  NormalizedError,
  AxiosError,
  FetchError,
  CustomError,
  HandlerConfig,
  ErrorHandler,
  ErrorMap,
  ErrorPageProps,
  ErrorsKitContextValue,
  ErrorsKitProviderProps,
} from './context/types'

export {
  DEFAULT_LEVEL_ACTIONS,
  DEFAULT_LEVEL_FOR_STATUS,
  DEFAULT_STATUS_TO_SLUG,
  DEFAULT_ERROR_MESSAGES,
} from './context/types'

