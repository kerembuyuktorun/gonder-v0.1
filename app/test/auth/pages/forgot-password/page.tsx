'use client'

import { AuthKitProvider, ForgotPasswordPageContent } from '@hascanb/arf-ui-kit/auth-kit'
import { demoAuthConfig } from '../../config'

export default function TestForgotPasswordPage() {
  return (
    <AuthKitProvider config={demoAuthConfig}>
      <ForgotPasswordPageContent />
    </AuthKitProvider>
  )
}
