'use client'

/**
 * Auth Kit - OTP Form Component
 * 
 * 6 haneli OTP doğrulama formu
 * Ghost UI: InputOTP bileşeni dışarıdan import edilir
 */

import React, { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthKit } from '../context/useAuthKit'
import type { OtpFormProps, OtpData } from '../context/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { kitLogger } from '../../_shared/logger'
import { sanitizeAuthErrorMessage, setAuthSession } from '../utils'

export function OtpForm({ 
  length = 6,
  username,
  onSuccess, 
  onError, 
  className 
}: OtpFormProps = {}) {
  const { config, t, lastUsername } = useAuthKit()
  const tOr = (key: string, fallback: string) => {
    const value = t(key)
    return value === key ? fallback : value
  }
  const exposeErrorDetails = config.debug || config.maskSensitiveErrors === false
  const sanitizeError = (rawMessage: unknown, fallback: string) =>
    sanitizeAuthErrorMessage(rawMessage, {
      fallbackMessage: fallback,
      exposeDetails: exposeErrorDetails,
    })
  
  // ========== State ==========
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const activeUsername = username || lastUsername || ''
  
  // ========== Validation ==========
  const validate = (): boolean => {
    if (code.length !== length) {
      const errorMsg = t('validation.invalidOtp')
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
    setSuccessMsg(null)
    
    if (!validate()) return
    if (!config.onOtpVerify) {
      kitLogger.error('[AuthKit] config.onOtpVerify is not defined')
      return
    }
    
    setIsLoading(true)
    
    try {
      const otpData: OtpData = {
        code,
        username: activeUsername,
      }
      
      const response = await config.onOtpVerify(otpData)
      
      if (response.success) {
        setAuthSession(response.data)
        onSuccess?.(response)
        
        // Redirect — hard nav so session cookies are applied before proxy checks
        const redirectUrl = config.routes.afterOtp || config.routes.afterSignIn
        window.location.assign(redirectUrl)
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
  
  // ========== Resend Handler ==========
  const handleResend = async () => {
    if (!config.onResendOtp) {
      kitLogger.warn('[AuthKit] config.onResendOtp is not defined')
      return
    }
    
    setError(null)
    setSuccessMsg(null)
    setIsResending(true)
    
    try {
      const response = await config.onResendOtp(activeUsername)
      
      if (response.success) {
        setSuccessMsg(tOr('otp.resentSuccess', 'Code resent successfully'))
        setCode('') // Reset code
      } else {
        setError(sanitizeError(response.error, t('errors.generic')))
      }
    } catch (err) {
      const errorMsg = sanitizeError(err instanceof Error ? err.message : err, t('errors.networkError'))
      setError(errorMsg)
    } finally {
      setIsResending(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-red-50 px-4 py-3 text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Alert */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-green-50 px-4 py-3 text-emerald-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{successMsg}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* OTP Input */}
        <div className="space-y-2">
          <Label htmlFor="otp">{t('otp.code')}</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={length}
              value={code}
              onChange={setCode}
              disabled={isLoading}
            >
              <InputOTPGroup>
                {Array.from({ length }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || code.length !== length}
        >
          {isLoading ? '...' : t('otp.submit')}
        </Button>
        
        {/* Resend Button */}
        {config.onResendOtp && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t('otp.didntReceive')}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={isResending || isLoading}
            >
              {isResending ? '...' : t('otp.resend')}
            </Button>
          </div>
        )}
        
        {/* Back to Sign In */}
        <div className="text-center">
          <a 
            href={config.routes.signIn}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {t('otp.backToSignIn')}
          </a>
        </div>
      </div>
    </form>
  )
}
