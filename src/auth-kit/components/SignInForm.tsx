'use client'

/**
 * Auth Kit - Sign In Form Component
 * 
 * Kullanıcı adı ve şifre ile giriş formu
 * Ghost UI pattern: Button, Input, Label, Checkbox bileşenleri dışarıdan import edilir
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthKit } from '../context/useAuthKit'
import type { SignInFormProps, SignInCredentials } from '../context/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert } from '@/components/ui/alert'
import { sanitizeAuthErrorMessage, setAuthSession, setOtpPendingSession } from '../utils'
import { GoogleIcon, AppleIcon } from '../icons/BrandIcons'

export function SignInForm({ 
  onSuccess, 
  onError, 
  className 
}: SignInFormProps = {}) {
  const router = useRouter()
  const { config, t, setLastUsername } = useAuthKit()
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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const enabledProviders = config.ui?.socialProviders || ['google', 'apple']
  const canUseGoogle = enabledProviders.includes('google') && !!config.onGoogleSignIn
  const canUseApple = enabledProviders.includes('apple') && !!config.onAppleSignIn
  
  // ========== Validation ==========
  const validate = (): boolean => {
    if (!username.trim()) {
      const errorMsg = t('validation.required')
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }
    
    if (!password) {
      const errorMsg = t('validation.required')
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
    
    if (!validate()) return
    
    setIsLoading(true)
    
    try {
      const credentials: SignInCredentials = {
        username: username.trim(),
        password,
        rememberMe,
      }
      
      const response = await config.onSignIn(credentials)
      
      if (response.success) {
        // Kullanıcı adını sakla (OTP için gerekebilir)
        setLastUsername(username.trim())
        
        // Success callback
        onSuccess?.(response)
        
        // OTP gerekiyorsa OTP sayfasına yönlendir
        if (response.requiresOtp) {
          setOtpPendingSession()
          window.location.assign('/otp')
        } else {
          setAuthSession(response.data)
          // Hard nav: httpOnly cookie’nin proxy’de görünmesi için soft RSC yerine full reload
          window.location.assign(config.routes.afterSignIn)
        }
      } else {
        const errorMsg = sanitizeError(response.error, tOr('errors.generic', 'An error occurred'))
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
        const errorMsg = sanitizeError(
          err instanceof Error ? err.message : err,
          tOr('errors.networkError', 'A network error occurred')
        )
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // ========== Social Auth Handlers ==========
  const handleGoogleSignIn = async () => {
    setError(null)
    setSocialLoading('google')
    try {
      const response = await config.onGoogleSignIn?.()
      if (response?.success) {
        setLastUsername(response.data?.user?.username || 'google-user')
        setAuthSession(response.data)
        onSuccess?.(response)
        router.push(config.routes.afterSignIn)
      } else {
        const errorMsg = sanitizeError(response?.error, tOr('errors.generic', 'An error occurred'))
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = sanitizeError(
        err instanceof Error ? err.message : err,
        tOr('errors.networkError', 'A network error occurred')
      )
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setSocialLoading(null)
    }
  }

  const handleAppleSignIn = async () => {
    setError(null)
    setSocialLoading('apple')
    try {
      const response = await config.onAppleSignIn?.()
      if (response?.success) {
        setLastUsername(response.data?.user?.username || 'apple-user')
        setAuthSession(response.data)
        onSuccess?.(response)
        router.push(config.routes.afterSignIn)
      } else {
        const errorMsg = sanitizeError(response?.error, tOr('errors.generic', 'An error occurred'))
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = sanitizeError(
        err instanceof Error ? err.message : err,
        tOr('errors.networkError', 'A network error occurred')
      )
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setSocialLoading(null)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}
        
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username">{tOr('signIn.username', 'Username')}</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder={tOr('signIn.username', 'Username')}
            disabled={isLoading}
            autoComplete="username"
            autoFocus
          />
        </div>
        
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">{tOr('signIn.password', 'Password')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder={tOr('signIn.password', 'Password')}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>
        
        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          {config.ui?.showRememberMe !== false && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked: boolean | 'indeterminate') => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                {tOr('signIn.rememberMe', 'Remember me')}
              </Label>
            </div>
          )}
          
          {config.ui?.showForgotPassword !== false && config.onForgotPassword && (
            <Link
              href={config.routes.forgotPassword}
              className="text-sm text-primary hover:underline"
            >
              {tOr('signIn.forgotPassword', 'Forgot password?')}
            </Link>
          )}
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 font-semibold"
          disabled={isLoading || socialLoading !== null}
        >
          {isLoading ? '...' : tOr('signIn.submit', 'Sign In')}
        </Button>
        
        {/* Social Login Divider */}
        {config.ui?.showSocialLogins && (canUseGoogle || canUseApple) && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  {tOr('signIn.orContinueWith', 'or continue with')}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {canUseGoogle && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || socialLoading !== null}
                  onClick={handleGoogleSignIn}
                  className="w-full h-11"
                >
                  {socialLoading === 'google' ? (
                    '...'
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <GoogleIcon size={18} />
                      Google
                    </span>
                  )}
                </Button>
              )}
              
              {canUseApple && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || socialLoading !== null}
                  onClick={handleAppleSignIn}
                  className="w-full h-11"
                >
                  {socialLoading === 'apple' ? (
                    '...'
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <AppleIcon size={18} />
                      Apple
                    </span>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
        
        {/* Sign Up Link */}
        {config.ui?.showSignUpLink && config.routes.signUp && (
          <div className="text-center text-sm text-muted-foreground">
            {tOr('signIn.noAccount', 'Hesabiniz yok mu?')}{' '}
            <Link href={config.routes.signUp} className="text-primary hover:underline">
              {tOr('signIn.signUp', 'Kayit Ol')}
            </Link>
          </div>
        )}
      </div>
    </form>
  )
}
