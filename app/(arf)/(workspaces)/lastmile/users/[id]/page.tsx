import UserDetailPageContent from './page-content'

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <UserDetailPageContent params={params} />
}
