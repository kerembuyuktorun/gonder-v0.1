import { proxyGeographyList } from '../_lib'

export async function GET(request: Request) {
  return proxyGeographyList(request, 'cities', ['name', 'page', 'pageSize'] as const)
}
