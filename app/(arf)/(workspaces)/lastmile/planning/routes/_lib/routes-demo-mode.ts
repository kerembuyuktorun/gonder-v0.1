/**
 * Rota Listesi / Detay — yalnızca `?demo=1` veya `?demo=true` ile mock veri.
 * Canlı modda API hatası mock'a düşmez; hata mesajı gösterilir.
 */

export function isRoutesDemoForced(searchParams: URLSearchParams | null | undefined): boolean {
  if (!searchParams) return false
  const value = searchParams.get('demo')
  return value === '1' || value === 'true'
}
