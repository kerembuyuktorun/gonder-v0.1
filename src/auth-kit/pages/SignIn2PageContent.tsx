'use client'

/**
 * Auth Kit - Sign In Page Content (Alternative Layout)
 *
 * login-02 bazli: sol panel branding, sag panel form
 */

import React from 'react'
import { AuthTwoPanelShell } from '../components/AuthTwoPanelShell'
import { SignIn2LoginForm } from '../components/SignIn2LoginForm'

export function SignIn2PageContent() {
  return (
    <AuthTwoPanelShell>
      <SignIn2LoginForm />
    </AuthTwoPanelShell>
  )
}
