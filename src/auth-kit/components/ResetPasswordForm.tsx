'use client'

/**
 * Auth Kit - Reset Password Form Component
 * 
 * Token ile şifre sıfırlama formu
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthKit } from '../context/useAuthKit'
import type { ResetPasswordFormProps, ResetPasswordData } from '../context/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { kitLogger } from '../../_shared/logger'
import { sanitizeAuthErrorMessage } from '../utils'

export function ResetPasswordForm({ 
  token,
  onSuccess, 
  onError, 
  className 
}: ResetPasswordFormProps) {
  const router = useRouter()
  const { config, t } = useAuthKit()
  const exposeErrorDetails = config.debug || config.maskSensitiveErrors === false
  const sanitizeError = (rawMessage: unknown, fallback: string) =>
    sanitizeAuthErrorMessage(rawMessage, {
      fallbackMessage: fallback,
      exposeDetails: exposeErrorDetails,
    })
  
  // ========== State ==========
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // ========== Validation ==========
  const validate = (): boolean => {
    if (!password) {
      const errorMsg = t('validation.required')
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }
    
    if (password.length < 8) {
      const errorMsg = t('validation.passwordTooShort')
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }
    
    if (password !== confirmPassword) {
      const errorMsg = t('validation.passwordsDontMatch')
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
    if (!config.onResetPassword) {
      kitLogger.error('[AuthKit] config.onResetPassword is not defined')
      return
    }
    
    setIsLoading(true)
    
    try {
      const data: ResetPasswordData = {
        token,
        password,
        confirmPassword,
      }
      
      const response = await config.onResetPassword(data)
      
      if (response.success) {
        setSuccess(true)
        onSuccess?.(response)
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push(config.routes.signIn)
        }, 2000)
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
    <form onSubmit={handleSubmit} className={className}>
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
                {t('resetPassword.success')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('resetPassword.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder={t('resetPassword.password')}
                disabled={isLoading}
                autoComplete="new-password"
                autoFocus
              />
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('resetPassword.confirmPassword')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder={t('resetPassword.confirmPassword')}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('resetPassword.submit')}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
