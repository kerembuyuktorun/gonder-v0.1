import { LastmileLayoutShell } from './_components/lastmile-layout-shell'

export default function LastmileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LastmileLayoutShell>{children}</LastmileLayoutShell>
}
