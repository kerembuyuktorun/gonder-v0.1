'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { GalleryVerticalEnd, Globe, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuthKit } from '../context/useAuthKit'

interface AuthTwoPanelShellProps {
  children: React.ReactNode
}

export function AuthTwoPanelShell({ children }: AuthTwoPanelShellProps) {
  const { config, t } = useAuthKit()
  const [logoError, setLogoError] = useState(false)

  const tOr = (key: string, fallback: string) => {
    const value = t(key)
    return value === key ? fallback : value
  }

  const primaryColor = config.ui?.primaryColor || '#0f172a'
  const accentColor = config.ui?.accentColor || '#334155'

  return (
    <div className="grid min-h-svh bg-zinc-50 lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={config.routes.signIn} className="inline-flex items-center gap-3 font-medium text-slate-900">
            <div className="flex size-7 items-center justify-center rounded-md text-white" style={{ background: primaryColor }}>
              <GalleryVerticalEnd className="size-4" />
            </div>
            {config.ui?.brandName || 'ARF'}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {children}
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        {config.ui?.signIn2?.backgroundImageUrl && (
          <img
            src={config.ui.signIn2.backgroundImageUrl}
            alt={config.ui.signIn2.backgroundImageAlt || 'Background'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {config.ui?.signIn2?.backgroundImageUrl ? (
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(900px 460px at 15% 12%, rgba(255,255,255,0.32), transparent 48%), radial-gradient(1100px 540px at 85% 92%, rgba(255,255,255,0.18), transparent 52%), linear-gradient(150deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(15,23,42,0.30),rgba(15,23,42,0.14))]" />
            <div className="absolute inset-0 opacity-[0.22] bg-[repeating-linear-gradient(120deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_1px,transparent_1px,transparent_12px)]" />
            <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.55)_1px,transparent_0)] bg-size-[20px_20px]" />
          </>
        )}

        <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
          {config.ui?.logoUrl && !logoError && (
            <img
              src={config.ui.logoUrl}
              alt={config.ui.brandName || 'Logo'}
              className="mb-8 h-12 w-auto"
              onError={() => setLogoError(true)}
            />
          )}

          <h2 className="max-w-xl text-[42px] font-semibold leading-[1.08] tracking-tight">
            {config.ui?.signIn2?.title || tOr('signIn.welcome', 'Welcome back')}
          </h2>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/88">
            {config.ui?.signIn2?.description || tOr('signIn2.description', `${config.ui?.brandName || 'ARF'} workspace access with a secure sign-in flow.`)}
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3">
            {[
              {
                icon: ShieldCheck,
                title: tOr('signIn2.secureConnectionTitle', 'Secure encrypted connection'),
                description: tOr('signIn2.secureConnectionDescription', 'Every session action is transmitted through encrypted infrastructure.'),
              },
              {
                icon: Sparkles,
                title: tOr('signIn2.fastVerificationTitle', 'Fast identity verification'),
                description: tOr('signIn2.fastVerificationDescription', 'The verification flow is streamlined and performance-focused.'),
              },
              {
                icon: Globe,
                title: tOr('signIn2.socialSignInTitle', 'Continue with social accounts'),
                description: tOr('signIn2.socialSignInDescription', 'Use Google or Apple for a fast and trusted sign-in experience.'),
              },
            ].map((item) => {
              const IconComponent = item.icon
              return (
                <div key={item.title} className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-white/15 p-1.5">
                      <IconComponent className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-white/78">{item.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
