import type { ReactNode } from 'react'

export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

export interface FeedbackPayload {
  title: string
  description?: string
  type?: FeedbackType
}

export interface FeedbackContextValue {
  notify: (payload: FeedbackPayload) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

export interface FeedbackProviderProps {
  children: ReactNode
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  richColors?: boolean
  renderToaster?: boolean
}
