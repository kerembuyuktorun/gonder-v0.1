import { LastmilePlaceholderPage } from './_components/lastmile-placeholder-page'

export default function LastmileNotFoundPage() {
  return (
    <LastmilePlaceholderPage
      breadcrumbs={['Last Mile']}
      title='Sayfa bulunamadı'
      description='Bu last-mile yolu tanımlı değil veya henüz yayınlanmadı.'
    />
  )
}
