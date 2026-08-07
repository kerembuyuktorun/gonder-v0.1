import { proxyGeographyList } from '../_lib'

export async function GET(request: Request) {
  return proxyGeographyList(request, 'districts', [
    'cityId',
    'name',
    'page',
    'pageSize',
  ] as const)
}
