'use client'

import { createContext, useContext, useMemo } from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import type { FeedbackContextValue, FeedbackPayload, FeedbackProviderProps } from './types'

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined)

function pushToast({ title, description, type = 'info' }: FeedbackPayload) {
  const options = { description }
  switch (type) {
    case 'success':
      toast.success(title, options)
      return
    case 'error':
      toast.error(title, options)
      return
    case 'warning':
      toast.warning(title, options)
      return
    default:
      toast.info(title, options)
  }
}

export function FeedbackProvider({
  children,
  position = 'top-right',
  richColors = true,
  renderToaster = true,
}: FeedbackProviderProps) {
  const value = useMemo<FeedbackContextValue>(
    () => ({
      notify: (payload) => pushToast(payload),
      success: (title, description) => pushToast({ title, description, type: 'success' }),
      error: (title, description) => pushToast({ title, description, type: 'error' }),
      warning: (title, description) => pushToast({ title, description, type: 'warning' }),
      info: (title, description) => pushToast({ title, description, type: 'info' }),
    }),
    []
  )

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {renderToaster ? <Toaster position={position} richColors={richColors} /> : null}
    </FeedbackContext.Provider>
  )
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider')
  }

  return context
}
