'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import type { CustomerOption, FacilityOption, OrderCreateStep } from './_types/order-create'
import { createInitialOrderForm } from './_mock/order-create-options'
import { createLastMileOrder } from './_api/create-order'
import { fetchCustomers } from './_api/customers'
import { fetchCustomerAddresses } from './_api/customer-addresses'
import {
  buildCreateOrderPayload,
  CreateOrderPayloadError,
} from './_lib/build-create-payload'
import {
  canNavigateToStep,
  firstInvalidStep,
  getOrderTypeFieldConfig,
  getStepFieldErrors,
  validateOrderCreate,
  validationErrorMessages,
} from './_lib/order-create-helpers'
import { OrderCreateStepper } from './_components/order-create-stepper'
import { OrderSummaryDialog } from './_components/order-summary-dialog'
import { StepBasics } from './_components/step-basics'
import { useOrderSkillCatalog } from './_hooks/use-order-skill-catalog'
import { StepLocations } from './_components/step-locations'
import { StepPackages } from './_components/step-packages'
import { StepAssignment } from './_components/step-assignment'
import { StepMetadata } from './_components/step-metadata'

function showFormFieldErrorToast(count: number) {
  toast.error(`${count} Form Giriş Alanı Eksik Veya Hatalı`, {
    position: 'top-center',
  })
}

const FOOTER_BUTTON_CLASS = 'h-11 rounded-2xl px-5 text-sm font-semibold'

function createErrorMessage(code?: string, fallback?: string) {
  switch (code) {
    case 'GEL_AL_NOT_SUPPORTED':
      return 'Gel-Al sipariş oluşturma henüz desteklenmiyor.'
    case 'GEO_HIERARCHY_RESOLVE_FAILED':
      return 'Adres konum hiyerarşisi çözülemedi. Lütfen adresi listeden yeniden seçin.'
    case 'DISPATCH_MODE_CONFLICT':
      return 'Yakındaki kurye ve anında rota birlikte seçilemez.'
    case 'MILK_RUN_ITEMS_REQUIRED':
      return 'Toplama Ringi için en az iki paket kalemi gerekir.'
    case 'INSTALL_SKILLS_REQUIRED':
      return 'Kurulumlu teslimatta gereksinim seçimi zorunludur.'
    case 'INSTALL_SERVICE_TIME_REQUIRED':
      return 'Kurulumlu teslimatta görev süresi zorunludur.'
    case 'SCHEDULE_SAME_DAY_REQUIRED':
      return 'Alım ve teslim aynı günde olmalıdır.'
    case 'SCHEDULE_PICKUP_AFTER_DELIVERY':
      return 'Teslim saati, alım penceresi bitmeden başlayamaz.'
    case 'SCHEDULE_PICKUP_REQUIRED':
      return 'Bu sipariş tipi için alım zaman penceresi zorunludur.'
    case 'SCHEDULE_DELIVERY_REQUIRED':
      return 'Bu sipariş tipi için teslim zaman penceresi zorunludur.'
    default:
      return fallback || 'Sipariş oluşturulamadı.'
  }
}

export default function OrderCreatePage() {
  const router = useRouter()
  const { state: sidebarState, isMobile } = useSidebar()
  const [form, setForm] = useState(createInitialOrderForm)
  const [currentStep, setCurrentStep] = useState<OrderCreateStep>(1)
  const [attemptedSteps, setAttemptedSteps] = useState<Set<OrderCreateStep>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [customerFacilities, setCustomerFacilities] = useState<FacilityOption[]>([])
  const { skills: orderSkillCatalog, isLoading: isOrderSkillCatalogLoading } =
    useOrderSkillCatalog()

  const config = useMemo(() => getOrderTypeFieldConfig(form.siparis_tipi), [form.siparis_tipi])
  const stepErrors = useMemo(
    () => getStepFieldErrors(currentStep, form),
    [currentStep, form]
  )
  const showStepErrors = attemptedSteps.has(currentStep)

  const fieldError = (key: keyof typeof stepErrors) =>
    showStepErrors ? stepErrors[key] : undefined

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await fetchCustomers()
      if (cancelled) return
      if (result.success) setCustomers(result.data.items)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!form.musteriId) {
      setCustomerFacilities([])
      return
    }

    void (async () => {
      const result = await fetchCustomerAddresses(form.musteriId)
      if (cancelled) return
      if (result.success) setCustomerFacilities(result.data.items)
      else setCustomerFacilities([])
    })()

    return () => {
      cancelled = true
    }
  }, [form.musteriId])

  const stickyLeftClass =
    !isMobile && sidebarState === 'expanded'
      ? 'md:left-(--sidebar-width)'
      : !isMobile && sidebarState === 'collapsed'
        ? 'md:left-(--sidebar-width-icon)'
        : 'left-0'

  const markStepAttempted = (step: OrderCreateStep) => {
    setAttemptedSteps((previous) => {
      const next = new Set(previous)
      next.add(step)
      return next
    })
  }

  const goNext = () => {
    markStepAttempted(currentStep)
    const errors = getStepFieldErrors(currentStep, form)
    const messages = validationErrorMessages(errors)
    if (messages.length > 0) {
      showFormFieldErrorToast(messages.length)
      return
    }
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as OrderCreateStep)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OrderCreateStep)
    }
  }

  const handleStepClick = (target: OrderCreateStep) => {
    if (target === currentStep) return

    if (target < currentStep) {
      setCurrentStep(target)
      return
    }

    if (!canNavigateToStep(target, form)) {
      const allErrors = validateOrderCreate(form)
      const invalidStep = firstInvalidStep(allErrors)
      markStepAttempted(invalidStep)
      setCurrentStep(invalidStep)
      const messages = validationErrorMessages(getStepFieldErrors(invalidStep, form))
      showFormFieldErrorToast(messages.length || 1)
      return
    }

    setCurrentStep(target)
  }

  const handleSubmit = () => {
    markStepAttempted(currentStep)
    const allErrors = validateOrderCreate(form)
    const messages = validationErrorMessages(allErrors)
    if (messages.length > 0) {
      const invalidStep = firstInvalidStep(allErrors)
      markStepAttempted(invalidStep)
      setCurrentStep(invalidStep)
      showFormFieldErrorToast(messages.length)
      return
    }

    if (form.siparis_tipi === 'gel_al') {
      toast.error(
        'Gel-Al sipariş oluşturma henüz desteklenmiyor. Backend müşteri-merkezli tasarım sonrası açılacak.'
      )
      return
    }

    setSummaryOpen(true)
  }

  const confirmCreateOrder = async () => {
    setSubmitting(true)
    try {
      const payload = buildCreateOrderPayload(form, { skillCatalog: orderSkillCatalog })
      const result = await createLastMileOrder(payload)

      if (!result.success) {
        toast.error(createErrorMessage(result.code, result.error))
        return
      }

      const orderId = typeof result.data.id === 'string' ? result.data.id : undefined

      const trackingNo =
        [result.data.trackingCode, result.data.trackingNo, result.data.takip_no, result.data.code].find(
          (value): value is string => typeof value === 'string' && value.trim().length > 0
        )?.trim()

      toast.success(
        trackingNo ? `Takip no ${trackingNo} oluşturuldu` : 'Takip no oluşturuldu'
      )

      if (result.data.dispatchWarning) {
        toast.warning(result.data.dispatchWarning)
      }

      setSummaryOpen(false)
      if (orderId) {
        router.push(ARF_ROUTES.lastmile.orders.detail(orderId))
      } else {
        router.push(ARF_ROUTES.lastmile.orders.list)
      }
    } catch (error) {
      if (error instanceof CreateOrderPayloadError) {
        toast.error(error.message)
      } else {
        toast.error('Sipariş oluşturulamadı.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Sipariş Yönetimi', href: ARF_ROUTES.lastmile.orders.list },
          { label: 'Sipariş Oluştur' },
        ]}
      />

      <div className='flex min-w-0 flex-1 flex-col gap-6 bg-slate-50 p-6 pb-44 lg:pb-40'>
        <div className='flex w-full items-center gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <h1 className='truncate text-2xl font-semibold tracking-tight'>Sipariş Oluştur</h1>
            <Badge variant='secondary' className='hidden sm:inline-flex'>
              Manuel
            </Badge>
          </div>
        </div>

        <div className='w-full space-y-4'>
          <Card className='rounded-[24px] border-slate-200 bg-white shadow-sm'>
            <CardContent className='p-5 lg:p-6'>
              {currentStep === 1 && (
                <StepBasics
                  form={form}
                  setForm={setForm}
                  customers={customers}
                  requirementOptions={orderSkillCatalog}
                  isRequirementsLoading={isOrderSkillCatalogLoading}
                  fieldError={fieldError}
                />
              )}
              {currentStep === 2 && (
                <StepLocations
                  form={form}
                  setForm={setForm}
                  config={config}
                  customerFacilities={customerFacilities}
                  fieldError={fieldError}
                />
              )}
              {currentStep === 3 && (
                <StepPackages
                  form={form}
                  setForm={setForm}
                  showGidenPaket={config.showGidenPaket}
                  showErrors={showStepErrors}
                  fieldError={fieldError}
                />
              )}
              {currentStep === 4 && (
                <StepAssignment form={form} setForm={setForm} fieldError={fieldError} />
              )}
              {currentStep === 5 && <StepMetadata form={form} setForm={setForm} />}
            </CardContent>
          </Card>
        </div>
      </div>

      <div
        className={cn(
          'fixed bottom-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm',
          stickyLeftClass
        )}
      >
        <div className='flex w-full flex-wrap items-end justify-between gap-3'>
          <div className='min-w-[280px] flex-1 lg:mr-6'>
            <OrderCreateStepper currentStep={currentStep} onStepClick={handleStepClick} />
          </div>
          <div className='ml-auto flex items-center gap-2'>
            {currentStep > 1 ? (
              <Button
                type='button'
                variant='outline'
                className={FOOTER_BUTTON_CLASS}
                onClick={goBack}
              >
                Geri
              </Button>
            ) : null}
            {currentStep < 5 ? (
              <Button type='button' className={FOOTER_BUTTON_CLASS} onClick={goNext}>
                Devam et
              </Button>
            ) : (
              <Button
                type='button'
                className={FOOTER_BUTTON_CLASS}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  'Oluşturuluyor…'
                ) : (
                  <>
                    <Send className='mr-2 size-4' />
                    Siparişi Oluştur
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <OrderSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        form={form}
        config={config}
        customers={customers}
        customerFacilities={customerFacilities}
        submitting={submitting}
        onConfirm={() => void confirmCreateOrder()}
      />
    </>
  )
}
