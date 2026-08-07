"use client"

import * as React from "react"
import { 
  // Butonlar
  Button, 
  ButtonGroup,
  Toggle,
  ToggleGroup,
  
  // Konteynerler
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  
  // Form Elemanları
  Input,
  InputGroup,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  Label,
  
  // Görsel Elemanlar
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Skeleton,
  Spinner,
  Progress,
  AspectRatio,
  
  // Navigasyon
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  
  // Overlay/Modal
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  
  // Bildirimler
  Alert,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  
  // Data Display
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Calendar,
  Empty,
  EmptyTitle,
  EmptyDescription,
  
  // Diğer
  Kbd,
  
  // Gelişmiş Componentler
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  // Chart primitives
  Bar,
  BarChart,
  Area,
  AreaChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  CartesianGrid,
  XAxis,
  ChartLabel,
  PolarGrid,
  PolarAngleAxis,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemActions,
  
  // Sidebar
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui"

import { toast } from "@/hooks/use-toast"
import { toast as sonnerToast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { 
  Info,
  Plus,
  Check,
  ChevronDown,
  Settings,
  User,
  Mail,
  Phone,
  Bold,
  Italic,
  Underline,
  Search,
  Copy,
  FileText,
  Calendar as CalendarIcon,
  Bell,
  Monitor,
  Smartphone,
} from "lucide-react"

// Form validation schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Kullanıcı adı en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
})

// Chart data
const chartData = [
  { month: "Ocak", desktop: 186, mobile: 80 },
  { month: "Şubat", desktop: 305, mobile: 200 },
  { month: "Mart", desktop: 237, mobile: 120 },
  { month: "Nisan", desktop: 73, mobile: 190 },
  { month: "Mayıs", desktop: 209, mobile: 130 },
  { month: "Haziran", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
    icon: Monitor,
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
    icon: Smartphone,
  },
}

// Pie Chart data
const pieChartData = [
  { category: "Chrome", visitors: 275, fill: "hsl(var(--chart-1))" },
  { category: "Safari", visitors: 200, fill: "hsl(var(--chart-2))" },
  { category: "Firefox", visitors: 187, fill: "hsl(var(--chart-3))" },
  { category: "Edge", visitors: 173, fill: "hsl(var(--chart-4))" },
  { category: "Other", visitors: 90, fill: "hsl(var(--chart-5))" },
]

const pieChartConfig = {
  visitors: {
    label: "Ziyaretçiler",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Diğer",
    color: "hsl(var(--chart-5))",
  },
}

// Radar Chart data
const radarChartData = [
  { subject: "Hız", desktop: 120, mobile: 110 },
  { subject: "Güvenlik", desktop: 98, mobile: 130 },
  { subject: "Kullanım", desktop: 86, mobile: 130 },
  { subject: "Tasarım", desktop: 99, mobile: 100 },
  { subject: "Performans", desktop: 85, mobile: 90 },
]

// Radial Chart data
const radialChartData = [
  { name: "Desktop", value: 1260, fill: "hsl(var(--chart-1))" },
  { name: "Mobile", value: 570, fill: "hsl(var(--chart-2))" },
]

const radialChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

export default function GalleryPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [comboboxOpen, setComboboxOpen] = React.useState(false)
  const [comboboxValue, setComboboxValue] = React.useState("")
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  
  const frameworks = [
    { value: "next", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ]
  
  const tableData = [
    { id: "1", name: "Ali Yılmaz", email: "ali@example.com", role: "Admin" },
    { id: "2", name: "Ayşe Demir", email: "ayse@example.com", role: "Editor" },
    { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", role: "Viewer" },
  ]
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Form gönderildi!",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    })
  }
  
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ARF UI Kit - Tüm Componentler</h1>
        <p className="text-muted-foreground">Kütüphanedeki tüm bileşenlerin görsel referans ve test alanı.</p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="bg-muted/50 p-1 inline-flex">
            <TabsTrigger value="buttons">Butonlar</TabsTrigger>
            <TabsTrigger value="forms">Form</TabsTrigger>
            <TabsTrigger value="visual">Görsel</TabsTrigger>
            <TabsTrigger value="containers">Konteynerler</TabsTrigger>
            <TabsTrigger value="navigation">Navigasyon</TabsTrigger>
            <TabsTrigger value="overlays">Overlay/Modal</TabsTrigger>
            <TabsTrigger value="feedback">Bildirimler</TabsTrigger>
            <TabsTrigger value="data">Data Display</TabsTrigger>
            <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* --- BUTONLAR --- */}
        <TabsContent value="buttons" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Button</CardTitle>
              <CardDescription>Tüm buton varyasyonları ve boyutları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ButtonGroup</CardTitle>
              <CardDescription>Birden fazla butonu gruplandırma</CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonGroup>
                <Button variant="outline">Sol</Button>
                <Button variant="outline">Orta</Button>
                <Button variant="outline">Sağ</Button>
              </ButtonGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toggle & ToggleGroup</CardTitle>
              <CardDescription>Açma/kapama düğmeleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Toggle aria-label="Bold">
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle aria-label="Italic">
                  <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle aria-label="Underline">
                  <Underline className="h-4 w-4" />
                </Toggle>
              </div>
              <ToggleGroup type="single">
                <Toggle value="bold">B</Toggle>
                <Toggle value="italic">I</Toggle>
                <Toggle value="underline">U</Toggle>
              </ToggleGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FORM ELEMANLARI --- */}
        <TabsContent value="forms" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Input & InputGroup</CardTitle>
              <CardDescription>Metin giriş alanları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="text">Standart Input</Label>
                <Input id="text" placeholder="Metin girin..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <InputGroup>
                  <Mail className="h-4 w-4" />
                  <Input id="email" type="email" placeholder="ornek@mail.com" />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <InputGroup>
                  <Phone className="h-4 w-4" />
                  <Input id="phone" type="tel" placeholder="0555 123 45 67" />
                </InputGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Textarea</CardTitle>
              <CardDescription>Çok satırlı metin alanı</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <Textarea placeholder="Notlarınızı buraya yazın..." rows={4} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select</CardTitle>
              <CardDescription>Açılır menü seçimi</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Bir seçenek seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Seçenek 1</SelectItem>
                  <SelectItem value="option2">Seçenek 2</SelectItem>
                  <SelectItem value="option3">Seçenek 3</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkbox & RadioGroup</CardTitle>
              <CardDescription>Seçim kutuları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Şartları kabul ediyorum</Label>
              </div>
              
              <Separator />
              
              <RadioGroup defaultValue="option1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option1" id="r1" />
                  <Label htmlFor="r1">Seçenek 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option2" id="r2" />
                  <Label htmlFor="r2">Seçenek 2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option3" id="r3" />
                  <Label htmlFor="r3">Seçenek 3</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Switch</CardTitle>
              <CardDescription>Açma/kapama anahtarı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Uçak modu</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slider</CardTitle>
              <CardDescription>Değer kaydırıcı</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <Slider defaultValue={[50]} max={100} step={1} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>InputOtp</CardTitle>
              <CardDescription>OTP/PIN giriş alanı</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field</CardTitle>
              <CardDescription>Form field layout wrapper (alternatif form yapısı)</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md space-y-6">
              <FieldSet>
                <FieldLegend>Kişisel Bilgiler</FieldLegend>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Ad Soyad</FieldLabel>
                    <Input placeholder="Adınızı girin" />
                    <FieldDescription>Tam adınızı yazınız</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>E-posta</FieldLabel>
                    <Input type="email" placeholder="ornek@mail.com" />
                    <FieldDescription>İletişim e-posta adresiniz</FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- GÖRSEL ELEMANLAR --- */}
        <TabsContent value="visual" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Badge</CardTitle>
              <CardDescription>Etiket ve durum göstergeleri</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>Kullanıcı profil resimleri</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>HB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Separator</CardTitle>
              <CardDescription>Ayırıcı çizgiler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>Üst içerik</div>
              <Separator />
              <div>Alt içerik</div>
              <div className="flex h-20 items-center space-x-4">
                <div>Sol</div>
                <Separator orientation="vertical" />
                <div>Sağ</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>Yükleme placeholder'ları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spinner & Progress</CardTitle>
              <CardDescription>Yükleme göstergeleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 items-center">
                <Spinner className="h-4 w-4" />
                <Spinner className="h-6 w-6" />
                <Spinner className="h-8 w-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <Progress value={33} />
                <Progress value={66} />
                <Progress value={100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AspectRatio</CardTitle>
              <CardDescription>En-boy oranı kontrollü konteyner</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">16:9 Oran</span>
              </AspectRatio>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- KONTEYNERLER --- */}
        <TabsContent value="containers" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>İçerik kartları</CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>İç Card Başlığı</CardTitle>
                  <CardDescription>Card açıklaması buraya gelir</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Card içeriği buraya yazılır.</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>Genişletilebilir panel listesi</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>İlk Panel</AccordionTrigger>
                  <AccordionContent>
                    Bu ilk panelin içeriğidir. İstediğiniz içeriği buraya ekleyebilirsiniz.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>İkinci Panel</AccordionTrigger>
                  <AccordionContent>
                    Bu ikinci panelin içeriğidir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Üçüncü Panel</AccordionTrigger>
                  <AccordionContent>
                    Bu üçüncü panelin içeriğidir.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collapsible</CardTitle>
              <CardDescription>Daraltılabilir içerik alanı</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    Daha fazla göster
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Bu gizli içeriktir. Butona tıkladığınızda görünür hale gelir.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ScrollArea</CardTitle>
              <CardDescription>Kaydırılabilir içerik alanı</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full max-w-md border rounded-md p-4">
                <div className="space-y-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="text-sm">
                      Kaydırılabilir içerik satırı {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- NAVİGASYON --- */}
        <TabsContent value="navigation" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Breadcrumb</CardTitle>
              <CardDescription>Sayfa yolu navigasyonu</CardDescription>
            </CardHeader>
            <CardContent>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/cargo">Cargo</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/test/gallery">Galeri</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Detay</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagination</CardTitle>
              <CardDescription>Sayfa numaralandırma</CardDescription>
            </CardHeader>
            <CardContent>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- OVERLAY/MODAL --- */}
        <TabsContent value="overlays" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>Modal pencere</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Dialog Aç</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Başlığı</DialogTitle>
                    <DialogDescription>
                      Bu bir dialog penceresinin içeriğidir.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sheet</CardTitle>
              <CardDescription>Yan panel (drawer)</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sol</Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Sol Panel</SheetTitle>
                    <SheetDescription>
                      Soldan açılan panel içeriği
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sağ</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Sağ Panel</SheetTitle>
                    <SheetDescription>
                      Sağdan açılan panel içeriği
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popover</CardTitle>
              <CardDescription>Açılır içerik kutusu</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover Aç</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Popover Başlığı</h4>
                    <p className="text-sm text-muted-foreground">
                      Popover içeriği buraya gelir.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HoverCard</CardTitle>
              <CardDescription>Üzerine gelindiğinde görünen kart</CardDescription>
            </CardHeader>
            <CardContent>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@kullanici</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Kullanıcı Adı</h4>
                    <p className="text-sm text-muted-foreground">
                      Kullanıcı hakkında bilgi
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
              <CardDescription>İpucu baloncukları - Farklı pozisyonlar ve stiller</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Üste</Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Üstte görünen tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Sağda</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Sağda görünen tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Altta</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Altta görünen tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Solda</Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Solda görünen tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Bilgi</p>
                      <p className="text-xs text-muted-foreground">
                        Bu bir bilgi tooltip'idir
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DropdownMenu</CardTitle>
              <CardDescription>Açılır menü</CardDescription>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Menü Aç</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profil</DropdownMenuItem>
                  <DropdownMenuItem>Ayarlar</DropdownMenuItem>
                  <DropdownMenuItem>Çıkış</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- BİLDİRİMLER --- */}
        <TabsContent value="feedback" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert</CardTitle>
              <CardDescription>Bilgi ve uyarı mesajları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Bilgi</AlertTitle>
                <AlertDescription>
                  Bu bir bilgi mesajıdır.
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>
                  Bu bir hata mesajıdır.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AlertDialog</CardTitle>
              <CardDescription>Onay gerekteren dialoglar</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Sil</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction>Devam Et</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- DATA DISPLAY --- */}
        <TabsContent value="data" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Table</CardTitle>
              <CardDescription>Veri tablosu</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Ali Yılmaz</TableCell>
                    <TableCell>ali@example.com</TableCell>
                    <TableCell><Badge>Aktif</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ayşe Demir</TableCell>
                    <TableCell>ayse@example.com</TableCell>
                    <TableCell><Badge>Bekliyor</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mehmet Kaya</TableCell>
                    <TableCell>mehmet@example.com</TableCell>
                    <TableCell><Badge variant="destructive">Pasif</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Tarih seçici</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empty</CardTitle>
              <CardDescription>Boş durum gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <Empty>
                <EmptyTitle>Veri bulunamadı</EmptyTitle>
                <EmptyDescription>Henüz herhangi bir kayıt bulunmuyor.</EmptyDescription>
              </Empty>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kbd</CardTitle>
              <CardDescription>Klavye kısayol gösterimi</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 items-center">
              <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> ile kopyalayın
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item</CardTitle>
              <CardDescription>Liste öğesi layout componentleri</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <ItemGroup>
                <Item>
                  <ItemMedia variant="icon">
                    <User className="h-4 w-4" />
                  </ItemMedia>
                  <div className="flex-1 min-w-0">
                    <ItemTitle>Ali Yılmaz</ItemTitle>
                    <ItemDescription>ali@example.com</ItemDescription>
                  </div>
                  <ItemActions>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </ItemActions>
                </Item>
                <ItemSeparator />
                <Item>
                  <ItemMedia variant="icon">
                    <User className="h-4 w-4" />
                  </ItemMedia>
                  <div className="flex-1 min-w-0">
                    <ItemTitle>Ayşe Demir</ItemTitle>
                    <ItemDescription>ayse@example.com</ItemDescription>
                  </div>
                  <ItemActions>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </ItemActions>
                </Item>
                <ItemSeparator />
                <Item>
                  <ItemMedia variant="icon">
                    <User className="h-4 w-4" />
                  </ItemMedia>
                  <div className="flex-1 min-w-0">
                    <ItemTitle>Mehmet Kaya</ItemTitle>
                    <ItemDescription>mehmet@example.com</ItemDescription>
                  </div>
                  <ItemActions>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- GELİŞMİŞ COMPONENTLER --- */}
        <TabsContent value="advanced" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Carousel</CardTitle>
              <CardDescription>Resim/içerik kaydırıcı</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md mx-auto">
              <Carousel>
                <CarouselContent>
                  <CarouselItem>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <span className="text-4xl font-semibold">1</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <span className="text-4xl font-semibold">2</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <span className="text-4xl font-semibold">3</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Command</CardTitle>
              <CardDescription>Komut paleti (⌘K menüsü)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setCommandOpen(true)} variant="outline" className="w-full max-w-md justify-between">
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Komut ara...
                </span>
                <Kbd>⌘K</Kbd>
              </Button>
              <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <CommandInput placeholder="Komut veya arama yapın..." />
                <CommandList>
                  <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                  <CommandGroup heading="Öneriler">
                    <CommandItem>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Takvim</span>
                    </CommandItem>
                    <CommandItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </CommandItem>
                    <CommandItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ayarlar</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="İşlemler">
                    <CommandItem>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Kopyala</span>
                    </CommandItem>
                    <CommandItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Yeni Dosya</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ContextMenu</CardTitle>
              <CardDescription>Sağ tık menüsü</CardDescription>
            </CardHeader>
            <CardContent>
              <ContextMenu>
                <ContextMenuTrigger className="flex h-32 w-full max-w-md items-center justify-center rounded-md border border-dashed text-sm">
                  Buraya sağ tıklayın
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuLabel>İşlemler</ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Kopyala</ContextMenuItem>
                  <ContextMenuItem>Yapıştır</ContextMenuItem>
                  <ContextMenuItem>Sil</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Özellikleri Görüntüle</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drawer</CardTitle>
              <CardDescription>Alt/üst çekmece paneli</CardDescription>
            </CardHeader>
            <CardContent>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">Drawer Aç</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Drawer Başlığı</DrawerTitle>
                    <DrawerDescription>
                      Bu bir drawer bileşenidir. Alt veya üst taraftan açılabilir.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Drawer içeriği buraya gelir.
                    </p>
                  </div>
                  <DrawerFooter>
                    <Button>Kaydet</Button>
                    <DrawerClose asChild>
                      <Button variant="outline">İptal</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menubar</CardTitle>
              <CardDescription>Üst menü çubuğu</CardDescription>
            </CardHeader>
            <CardContent>
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>Dosya</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Yeni Dosya</MenubarItem>
                    <MenubarItem>Aç</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Kaydet</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Düzenle</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Geri Al</MenubarItem>
                    <MenubarItem>İleri Al</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Kes</MenubarItem>
                    <MenubarItem>Kopyala</MenubarItem>
                    <MenubarItem>Yapıştır</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Görünüm</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Kenar Çubuğu</MenubarItem>
                    <MenubarItem>Panel</MenubarItem>
                    <MenubarSeparator />
                    <MenubarLabel>Tema</MenubarLabel>
                    <MenubarItem>Açık Tema</MenubarItem>
                    <MenubarItem>Koyu Tema</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NavigationMenu</CardTitle>
              <CardDescription>Ana navigasyon menüsü</CardDescription>
            </CardHeader>
            <CardContent>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Başlangıç</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-400px">
                        <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground" href="#">
                          <div className="text-sm font-medium">Giriş</div>
                          <p className="text-sm text-muted-foreground">Projeye nasıl başlanır</p>
                        </NavigationMenuLink>
                        <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground" href="#">
                          <div className="text-sm font-medium">Dokümantasyon</div>
                          <p className="text-sm text-muted-foreground">Tüm özellikler</p>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Bileşenler</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-100">
                        <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground" href="#">
                          <div className="text-sm font-medium">UI Elementleri</div>
                          <p className="text-sm text-muted-foreground">Button, Input ve daha fazlası</p>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink className="px-4 py-2 text-sm font-medium" href="#">
                      İletişim
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resizable</CardTitle>
              <CardDescription>Boyutlandırılabilir paneller</CardDescription>
            </CardHeader>
            <CardContent>
              <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-32 items-center justify-center p-6">
                    <span className="font-semibold">Sol Panel</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-32 items-center justify-center p-6">
                    <span className="font-semibold">Sağ Panel</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toast</CardTitle>
              <CardDescription>Bildirim mesajları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Başarılı!",
                    description: "İşlem başarıyla tamamlandı.",
                  })
                }}
              >
                Bildirim Göster
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    variant: "destructive",
                    title: "Hata!",
                    description: "İşlem sırasında bir hata oluştu.",
                  })
                }}
              >
                Hata Bildirimi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sonner</CardTitle>
              <CardDescription>Modern bildirim sistemi (alternatif Toast)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  sonnerToast("Başarılı işlem", {
                    description: "İşleminiz başarıyla tamamlandı.",
                  })
                }}
              >
                Sonner Bildirimi
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sonnerToast.success("Başarılı!", {
                    description: "Kayıt başarıyla eklendi.",
                  })
                }}
              >
                Başarı Bildirimi
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sonnerToast.error("Hata!", {
                    description: "İşlem başarısız oldu.",
                  })
                }}
              >
                Hata Bildirimi
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  sonnerToast.promise(
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                    {
                      loading: "Yükleniyor...",
                      success: "Yükleme tamamlandı!",
                      error: "Bir hata oluştu.",
                    }
                  )
                }}
              >
                Promise ile Bildirim
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Chart</CardTitle>
              <CardDescription>Sütun grafik gösterimi - Default tooltip</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Chart - Custom Tooltip</CardTitle>
              <CardDescription>Label formatter ile özelleştirilmiş tooltip</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        labelFormatter={(value) => {
                          return `${value} 2024`
                        }}
                      />
                    }
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Chart - Tooltip with Indicator</CardTitle>
              <CardDescription>Farklı indicator stilleri</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Chart - Tooltip without Label</CardTitle>
              <CardDescription>Label gizlenmiş tooltip</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Chart - Tooltip with Icons</CardTitle>
              <CardDescription>Icon'lu tooltip gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent hideIndicator />}
                  />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Area Chart</CardTitle>
              <CardDescription>Alan grafik gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <AreaChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Chart</CardTitle>
              <CardDescription>Çizgi grafik gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-50 w-full">
                <LineChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="desktop"
                    type="monotone"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="mobile"
                    type="monotone"
                    stroke="var(--color-mobile)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pie Chart</CardTitle>
              <CardDescription>Pasta grafik gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="h-64 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieChartData}
                    dataKey="visitors"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <ChartLabel
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {pieChartData.reduce((a, b) => a + b.visitors, 0)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Ziyaretçi
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar Chart</CardTitle>
              <CardDescription>Radar grafik gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <RadarChart data={radarChartData}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarGrid />
                  <Radar
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    fillOpacity={0.6}
                  />
                  <Radar
                    dataKey="mobile"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radial Chart</CardTitle>
              <CardDescription>Dairesel grafik gösterimi</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={radialChartConfig} className="h-64 w-full">
                <RadialBarChart
                  data={radialChartData}
                  innerRadius={30}
                  outerRadius={110}
                >
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <RadialBar dataKey="value" background />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
              <CardDescription>Layout sidebar componentleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg overflow-hidden">
                <SidebarProvider>
                  <Sidebar>
                    <SidebarContent>
                      <SidebarGroup>
                        <SidebarGroupLabel>Menü</SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <SidebarMenuButton>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profil</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Ayarlar</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton>
                                <Bell className="mr-2 h-4 w-4" />
                                <span>Bildirimler</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>
                  </Sidebar>
                  <SidebarInset>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">Ana içerik alanı</p>
                    </div>
                  </SidebarInset>
                </SidebarProvider>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Combobox</CardTitle>
              <CardDescription>Command + Popover ile arama yapılabilen seçim kutusu</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-75 justify-between"
                  >
                    {comboboxValue
                      ? frameworks.find((framework) => framework.value === comboboxValue)?.label
                      : "Framework seçin..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-75 p-0">
                  <Command>
                    <CommandInput placeholder="Framework ara..." />
                    <CommandList>
                      <CommandEmpty>Framework bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setComboboxValue(currentValue === comboboxValue ? "" : currentValue)
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                comboboxValue === framework.value ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {framework.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date Picker</CardTitle>
              <CardDescription>Calendar + Popover ile tarih seçici</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-75 justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      selectedDate.toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setDatePickerOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Table component'i ile gelişmiş tablo yapısı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-25">ID</TableHead>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <Badge variant={row.role === "Admin" ? "default" : "secondary"}>
                            {row.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Düzenle</DropdownMenuItem>
                              <DropdownMenuItem>Sil</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form</CardTitle>
              <CardDescription>React Hook Form ile form yönetimi</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kullanıcı Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Bu, herkese açık görünen kullanıcı adınızdır.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@mail.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Size bildirimler göndereceğimiz e-posta adresi.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Gönder</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}