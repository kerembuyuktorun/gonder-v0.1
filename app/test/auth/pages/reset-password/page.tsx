'use client'

import { AuthKitProvider, ResetPasswordPageContent } from '@hascanb/arf-ui-kit/auth-kit'
import { demoAuthConfig } from '../../config'

export default function TestResetPasswordPage() {
  return (
    <AuthKitProvider config={demoAuthConfig}>
      <ResetPasswordPageContent token="demo-token" />
    </AuthKitProvider>
  )
}
