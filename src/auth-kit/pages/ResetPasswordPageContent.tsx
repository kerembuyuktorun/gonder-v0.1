'use client'

/**
 * Auth Kit - Reset Password Page Content
 * 
 * Şifre sıfırlama sayfası
 * URL'den token parametresi alır
 */

import React from 'react'
import { useAuthKit } from '../context/useAuthKit'
import { AuthTwoPanelShell } from '../components/AuthTwoPanelShell'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

interface ResetPasswordPageContentProps {
  /** Reset token (URL'den alınır) */
  token: string
}

export function ResetPasswordPageContent({ token }: ResetPasswordPageContentProps) {
  const { t } = useAuthKit()
  
  return (
    <AuthTwoPanelShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('resetPassword.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('resetPassword.subtitle')}</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </AuthTwoPanelShell>
  )
}
