import { CargoLayoutShell } from "./_components/cargo-layout-shell"

export default function CargoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CargoLayoutShell>{children}</CargoLayoutShell>
}
