'use client'

/**
 * Auth Kit - Forgot Password Form Component
 * 
 * E-posta ile şifre sıfırlama bağlantısı gönderme formu
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthKit } from '../context/useAuthKit'
import type { ForgotPasswordFormProps, ForgotPasswordData } from '../context/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { kitLogger } from '../../_shared/logger'
import { sanitizeAuthErrorMessage } from '../utils'

export function ForgotPasswordForm({ 
  onSuccess, 
  onError, 
  className 
}: ForgotPasswordFormProps = {}) {
  const { config, t } = useAuthKit()
  const exposeErrorDetails = config.debug || config.maskSensitiveErrors === false
  const sanitizeError = (rawMessage: unknown, fallback: string) =>
    sanitizeAuthErrorMessage(rawMessage, {
      fallbackMessage: fallback,
      exposeDetails: exposeErrorDetails,
    })
  
  // ========== State ==========
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // ========== Validation ==========
  const validate = (): boolean => {
    if (!email.trim()) {
      const errorMsg = t('validation.required')
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const errorMsg = t('validation.invalidEmail')
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }
    
    return true
  }
  
  // ========== Submit Handler ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    if (!validate()) return
    if (!config.onForgotPassword) {
      kitLogger.error('[AuthKit] config.onForgotPassword is not defined')
      return
    }
    
    setIsLoading(true)
    
    try {
      const data: ForgotPasswordData = {
        email: email.trim(),
      }
      
      const response = await config.onForgotPassword(data)
      
      if (response.success) {
        setSuccess(true)
        onSuccess?.(response)
      } else {
        const errorMsg = sanitizeError(response.error, t('errors.generic'))
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = sanitizeError(err instanceof Error ? err.message : err, t('errors.networkError'))
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-red-50 px-4 py-3 text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-green-50 px-4 py-3 text-emerald-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">
                {t('forgotPassword.checkEmail')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('forgotPassword.email')}</Label>
              <Input
                id="email"
                type="text"
                inputMode="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                placeholder={t('forgotPassword.email')}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
                aria-required="true"
              />
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('forgotPassword.submit')}
            </Button>
          </>
        )}
        
        {/* Back to Sign In */}
        <div className="text-center">
          <Link
            href={config.routes.signIn}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {t('forgotPassword.backToSignIn')}
          </Link>
        </div>
      </div>
    </form>
  )
}
