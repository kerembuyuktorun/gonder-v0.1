'use client'

import { AuthKitProvider, OtpForm } from '@hascanb/arf-ui-kit/auth-kit'
import { demoAuthConfig } from '../../config'

export default function OtpFormDemoPage() {
  return (
    <div className="container max-w-md py-8">
      <AuthKitProvider config={demoAuthConfig}>
        <OtpForm username="demo-user" />
      </AuthKitProvider>
    </div>
  )
}
