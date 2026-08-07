'use client'

/**
 * Auth Kit - Context Hook
 * 
 * AuthKit context'ine erişim sağlayan hook
 * AuthKitProvider içinde kullanılmalıdır
 * 
 * @example
 * function MyComponent() {
 *   const { config, t, isLoading } = useAuthKit()
 *   
 *   return <div>{t('signIn.title')}</div>
 * }
 */

import { useContext } from 'react'
import { AuthKitContext } from './AuthKitProvider'
import type { AuthKitContextValue } from './types'

/**
 * AuthKit context hook
 * @throws Eğer AuthKitProvider dışında kullanılırsa hata fırlatır
 */
export function useAuthKit(): AuthKitContextValue {
  const context = useContext(AuthKitContext)
  
  if (!context) {
    throw new Error(
      'useAuthKit must be used within AuthKitProvider. ' +
      'Make sure to wrap your component tree with <AuthKitProvider config={...}>'
    )
  }
  
  return context
}

/**
 * AuthKit config'e doğrudan erişim için yardımcı hook
 */
export function useAuthKitConfig() {
  const { config } = useAuthKit()
  return config
}

/**
 * AuthKit translation'a doğrudan erişim için yardımcı hook
 */
export function useAuthKitTranslation() {
  const { t } = useAuthKit()
  return t
}
