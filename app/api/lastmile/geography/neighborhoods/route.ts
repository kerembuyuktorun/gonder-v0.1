import { proxyGeographyList } from '../_lib'

export async function GET(request: Request) {
  return proxyGeographyList(request, 'neighborhoods', [
    'districtId',
    'name',
    'page',
    'pageSize',
  ] as const)
}
