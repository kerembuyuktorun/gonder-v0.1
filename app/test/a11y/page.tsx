import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const checklist = [
  'Landmark yapisi (header/nav/main/footer)',
  'Klavye ile tam gezinebilirlik',
  'Odak gorunurlugu ve odak sirasi',
  'ARIA rol ve label tutarliligi',
  'Kontrast ve okunabilirlik denetimi',
]

export default function A11yPanelPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Test Hub', href: '/test' },
          { label: 'A11y Paneli' },
        ]}
        searchPlaceholder="A11y kontrol ara..."
        notificationCount={0}
      />

      <main className="flex flex-1 flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>A11y Kontrol Paneli</CardTitle>
            <CardDescription>
              Kritik erisilebilirlik kontrollerinin merkezi paneli.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
