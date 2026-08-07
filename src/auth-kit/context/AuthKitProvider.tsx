'use client'

/**
 * Auth Kit - Context Provider
 * 
 * AuthKit konfigürasyonunu ve state'i yöneten Context Provider
 * Tüm auth bileşenlerini bu provider ile sarmak gerekir
 * 
 * @example
 * <AuthKitProvider config={authConfig}>
 *   <App />
 * </AuthKitProvider>
 */

import React, { createContext, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthKitConfig, AuthKitContextValue } from './types'
import { kitLogger } from '../../_shared/logger'
import { useTranslation } from '../i18n/use-translation'
import { clearAuth } from '../utils'

export const AuthKitContext = createContext<AuthKitContextValue | null>(null)

interface AuthKitProviderProps {
  /** Kütüphane konfigürasyonu */
  config: AuthKitConfig
  
  /** Child components */
  children: React.ReactNode
}

export function AuthKitProvider({ config, children }: AuthKitProviderProps) {
  const router = useRouter()
  // ========== State Management ==========
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUsername, setLastUsername] = useState<string | null>(null)
  
  // ========== Translation System ==========
  const { t: translateFn } = useTranslation(
    config.locale,
    config.translations
  )
  
  // ========== Custom Translation Function with Params ==========
  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      return translateFn(key, params)
    },
    [translateFn]
  )

  const sessionTimerRef = useRef<number | null>(null)

  const runSessionTimeout = useCallback(() => {
    clearAuth()
    setLastUsername(null)
    setError((prev) => prev ?? t('errors.unauthorized'))

    if (config.onSessionTimeout) {
      config.onSessionTimeout()
      return
    }

    router.push(config.routes.signIn)
  }, [config, router, t])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!config.sessionTimeout || config.sessionTimeout <= 0) return

    const resetTimer = () => {
      if (sessionTimerRef.current) {
        window.clearTimeout(sessionTimerRef.current)
      }

      sessionTimerRef.current = window.setTimeout(() => {
        runSessionTimeout()
      }, config.sessionTimeout)
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'mousemove',
      'touchstart',
      'focus',
      'scroll',
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true })
    })

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetTimer()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    resetTimer()

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer)
      })
      document.removeEventListener('visibilitychange', onVisibilityChange)

      if (sessionTimerRef.current) {
        window.clearTimeout(sessionTimerRef.current)
      }
    }
  }, [config.sessionTimeout, runSessionTimeout])
  
  // ========== Context Value ==========
  const contextValue = useMemo<AuthKitContextValue>(
    () => ({
      config,
      t,
      isLoading,
      setIsLoading,
      error,
      setError,
      lastUsername,
      setLastUsername,
    }),
    [config, t, isLoading, error, lastUsername]
  )
  
  // ========== Debug Logging ==========
  if (config.debug) {
    kitLogger.log('[AuthKit] Provider initialized with config:', {
      locale: config.locale,
      hasOtpVerify: !!config.onOtpVerify,
      hasForgotPassword: !!config.onForgotPassword,
      hasResetPassword: !!config.onResetPassword,
      sessionTimeout: config.sessionTimeout,
      routes: config.routes,
    })
  }
  
  return (
    <AuthKitContext.Provider value={contextValue}>
      {children}
    </AuthKitContext.Provider>
  )
}
