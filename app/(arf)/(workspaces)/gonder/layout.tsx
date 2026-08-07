import { GonderLayoutShell } from './_components/gonder-layout-shell'

export default function GonderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <GonderLayoutShell>{children}</GonderLayoutShell>
}
