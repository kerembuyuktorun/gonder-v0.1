'use client'

import { AuthKitProvider, ResetPasswordForm } from '@hascanb/arf-ui-kit/auth-kit'
import { demoAuthConfig } from '../../config'

export default function ResetPasswordFormDemoPage() {
  return (
    <div className="container max-w-md py-8">
      <AuthKitProvider config={demoAuthConfig}>
        <ResetPasswordForm token="demo-token" />
      </AuthKitProvider>
    </div>
  )
}
