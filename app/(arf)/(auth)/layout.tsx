'use client'

import { AuthKitProvider } from '@hascanb/arf-ui-kit/auth-kit'
import { arfAuthConfig } from './config'

export default function ArfAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthKitProvider config={arfAuthConfig}>{children}</AuthKitProvider>
}
