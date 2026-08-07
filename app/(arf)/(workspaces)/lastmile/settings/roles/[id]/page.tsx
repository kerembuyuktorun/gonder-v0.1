import RoleDetailPageContent from './page-content'

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <RoleDetailPageContent params={params} />
}
