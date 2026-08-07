'use client'

/**
 * Auth Kit - Forgot Password Page Content
 * 
 * Şifremi unuttum sayfası
 */

import React from 'react'
import { useAuthKit } from '../context/useAuthKit'
import { AuthTwoPanelShell } from '../components/AuthTwoPanelShell'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function ForgotPasswordPageContent() {
  const { t } = useAuthKit()
  
  return (
    <AuthTwoPanelShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('forgotPassword.title')}</h1>
        </div>
        <ForgotPasswordForm />
      </div>
    </AuthTwoPanelShell>
  )
}
