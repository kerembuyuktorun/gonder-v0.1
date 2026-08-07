/**
 * Auth Kit - Translation Hook
 * 
 * Nested key desteği ile çeviri hook'u
 * Örnek: t('signIn.title') -> "Giriş Yap"
 */

import { useCallback, useMemo } from 'react'
import { kitLogger } from '../../_shared/logger'
import { defaultTranslations, getDefaultLocale } from './defaults'
import type { AuthKitTranslations } from '../context/types'

/**
 * Nested object'te key path ile değer bul
 * @example getNestedValue({ a: { b: 'value' } }, 'a.b') -> 'value'
 */
function getNestedValue(obj: AuthKitTranslations, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }
  
  return typeof current === 'string' ? current : undefined
}

/**
 * Template string'i parametrelerle doldur
 * @example interpolate('Hello {{name}}', { name: 'World' }) -> 'Hello World'
 */
function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) return template
  
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }, template)
}

/**
 * Çeviri hook'u
 * 
 * @param locale Aktif dil
 * @param customTranslations Özel çeviriler (varsayılanları override eder)
 * @returns Çeviri fonksiyonu
 * 
 * @example
 * const { t } = useTranslation('tr')
 * t('signIn.title') // -> "Giriş Yap"
 * t('errors.generic', { error: 'timeout' }) // -> parametreli çeviri
 */
export function useTranslation(
  locale?: string,
  customTranslations?: Partial<AuthKitTranslations>
) {
  const activeLocale = locale || getDefaultLocale()
  
  // Varsayılan ve özel çevirileri birleştir
  const translations = useMemo(() => {
    const defaultTrans = defaultTranslations[activeLocale] || defaultTranslations[getDefaultLocale()]
    
    if (!customTranslations) return defaultTrans
    
    // Deep merge
    return {
      signIn: { ...defaultTrans.signIn, ...customTranslations.signIn },
      otp: { ...defaultTrans.otp, ...customTranslations.otp },
      signIn2: { ...defaultTrans.signIn2, ...customTranslations.signIn2 },
      forgotPassword: { ...defaultTrans.forgotPassword, ...customTranslations.forgotPassword },
      resetPassword: { ...defaultTrans.resetPassword, ...customTranslations.resetPassword },
      validation: { ...defaultTrans.validation, ...customTranslations.validation },
      errors: { ...defaultTrans.errors, ...customTranslations.errors },
    } as AuthKitTranslations
  }, [activeLocale, customTranslations])
  
  /**
   * Çeviri fonksiyonu
   * @param key Nested key (örn: 'signIn.title')
   * @param params Template parametreleri (opsiyonel)
   */
  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const value = getNestedValue(translations, key)
      
      if (!value) {
        kitLogger.warn(`[auth-kit] Translation key not found: "${key}"`)
        return key // Key bulunamazsa key'i döndür
      }
      
      return interpolate(value, params)
    },
    [translations]
  )
  
  return { t, locale: activeLocale, translations }
}
