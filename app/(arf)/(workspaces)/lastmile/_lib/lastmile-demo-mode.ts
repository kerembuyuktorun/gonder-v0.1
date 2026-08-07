/**
 * Last Mile demo / mock gezinme.
 * `?demo=1` veya `?demo=true` ile liste ve detay mock veriden beslenir.
 */

export function isLastmileDemoForced(
  searchParams: URLSearchParams | null | undefined
): boolean {
  if (!searchParams) return false
  const value = searchParams.get('demo')
  return value === '1' || value === 'true'
}

/** Href'e demo query ekler (zaten varsa dokunmaz). */
export function withLastmileDemo(href: string, demo: boolean): string {
  if (!demo) return href
  if (/[?&]demo=/.test(href)) return href
  return `${href}${href.includes('?') ? '&' : '?'}demo=1`
}

export const LASTMILE_DEMO_QUERY = '?demo=1'
