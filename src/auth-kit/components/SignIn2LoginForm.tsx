'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { useAuthKit } from '../context/useAuthKit'
import type { SignInCredentials } from '../context/types'
import { sanitizeAuthErrorMessage, setAuthSession, setOtpPendingSession } from '../utils'
import { GoogleIcon, AppleIcon } from '../icons/BrandIcons'

export function SignIn2LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const { config, t, setLastUsername } = useAuthKit()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enabledProviders = config.ui?.socialProviders || ['google', 'apple']
  const canUseGoogle = config.ui?.showSocialLogins && enabledProviders.includes('google') && !!config.onGoogleSignIn
  const canUseApple = config.ui?.showSocialLogins && enabledProviders.includes('apple') && !!config.onAppleSignIn

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

  const goAfterSignIn = (path?: string) => {
    // Hard nav so httpOnly session cookies from /api/auth/login are visible to proxy
    window.location.assign(path || config.routes.afterSignIn)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() && !password) {
      setError(tOr('validation.required', 'Bu alan zorunludur'))
      return
    }

    if (!username.trim()) {
      setError(tOr('validation.emailRequired', 'E-posta adresi zorunludur'))
      return
    }

    if (!password) {
      setError(tOr('validation.passwordRequired', 'Şifre zorunludur'))
      return
    }

    setIsLoading(true)

    try {
      const credentials: SignInCredentials = {
        username: username.trim(),
        password,
      }

      const response = await config.onSignIn(credentials)

      if (!response.success) {
        setError(sanitizeError(response.error, tOr('errors.generic', 'Sign in failed')))
        setIsLoading(false)
        return
      }

      setLastUsername(username.trim())

      const nextPath =
        (typeof response.redirectTo === 'string' && response.redirectTo.trim()) ||
        (response.requiresOtp ? '/otp' : config.routes.afterSignIn)

      if (response.requiresOtp || nextPath === '/otp') {
        setOtpPendingSession()
        window.location.assign('/otp')
        return
      }

      setAuthSession(response.data)
      goAfterSignIn(nextPath)
    } catch (err) {
      setError(
        sanitizeError(
          err instanceof Error ? err.message : err,
          tOr('errors.networkError', 'A network error occurred')
        )
      )
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!config.onGoogleSignIn) return

    setError(null)
    setSocialLoading('google')

    try {
      const response = await config.onGoogleSignIn()

      if (!response.success) {
        setError(sanitizeError(response.error, tOr('errors.generic', 'Sign in failed')))
        return
      }

      setLastUsername(response.data?.user?.username || 'google-user')
      setAuthSession(response.data)
      goAfterSignIn()
    } catch (err) {
      setError(
        sanitizeError(
          err instanceof Error ? err.message : err,
          tOr('errors.networkError', 'A network error occurred')
        )
      )
    } finally {
      setSocialLoading(null)
    }
  }

  const handleAppleSignIn = async () => {
    if (!config.onAppleSignIn) return

    setError(null)
    setSocialLoading('apple')

    try {
      const response = await config.onAppleSignIn()

      if (!response.success) {
        setError(sanitizeError(response.error, tOr('errors.generic', 'Sign in failed')))
        return
      }

      setLastUsername(response.data?.user?.username || 'apple-user')
      setAuthSession(response.data)
      goAfterSignIn()
    } catch (err) {
      setError(
        sanitizeError(
          err instanceof Error ? err.message : err,
          tOr('errors.networkError', 'A network error occurred')
        )
      )
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {tOr('signIn.title', 'Sign In')}
          </h1>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-linear-to-r from-rose-50 to-red-50 px-4 py-3 text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="username">{tOr('signIn.username', 'Username')}</FieldLabel>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder={tOr('signIn.username', 'Username')}
            autoComplete="username"
            disabled={isLoading || socialLoading !== null}
            aria-required="true"
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{tOr('signIn.password', 'Password')}</FieldLabel>
            {config.ui?.showForgotPassword !== false && config.onForgotPassword && (
              <Link
                href={config.routes.forgotPassword}
                className="ml-auto text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                {tOr('signIn.forgotPassword', 'Forgot password?')}
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder={tOr('signIn.password', 'Password')}
            autoComplete="current-password"
            disabled={isLoading || socialLoading !== null}
            aria-required="true"
          />
        </Field>

        <Field>
          <Button type="submit" className="h-11 w-full font-semibold" disabled={isLoading || socialLoading !== null}>
            {isLoading ? '...' : tOr('signIn.submit', 'Sign In')}
          </Button>
        </Field>

        {process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="text-sm font-medium">Test girişi aktif</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              API olmadan oturum açılır; OTP atlanır. Örnek:{' '}
              <code className="rounded bg-amber-100 px-1">superadmin@arfplatform.local</code> /{' '}
              <code className="rounded bg-amber-100 px-1">Demo123!</code>
              <br />
              veya herhangi bir e-posta + şifre.
            </p>
          </div>
        )}

        {(canUseGoogle || canUseApple) && (
          <>
            <FieldSeparator>{tOr('signIn.orContinueWith', 'or continue with')}</FieldSeparator>
            <Field>
              <div className={cn('grid gap-3', canUseGoogle && canUseApple ? 'grid-cols-2' : 'grid-cols-1')}>
                {canUseGoogle && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || socialLoading !== null}
                    className="h-11"
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
                    onClick={handleAppleSignIn}
                    disabled={isLoading || socialLoading !== null}
                    className="h-11"
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
            </Field>
          </>
        )}

        {config.ui?.showSignUpLink && config.routes.signUp && (
          <FieldDescription className="text-center">
            {tOr('signIn.noAccount', 'Hesabiniz yok mu?')}{' '}
            <Link href={config.routes.signUp} className="underline underline-offset-4 hover:text-slate-900">
              {tOr('signIn.signUp', 'Kayit Ol')}
            </Link>
          </FieldDescription>
        )}
      </FieldGroup>
    </form>
  )
}
