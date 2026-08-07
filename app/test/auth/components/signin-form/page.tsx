'use client'

import { AuthKitProvider, SignInForm } from '@hascanb/arf-ui-kit/auth-kit'
import { demoAuthConfig } from '../../config'

export default function SignInFormDemoPage() {
  return (
    <div className="container max-w-md py-8">
      <AuthKitProvider config={demoAuthConfig}>
        <SignInForm />
      </AuthKitProvider>
    </div>
  )
}
