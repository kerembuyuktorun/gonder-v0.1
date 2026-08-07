/**
 * Auth Kit - Type Definitions
 * 
 * Bu dosya auth-kit modülünün tüm type tanımlarını içerir.
 * Kütüphane kullanıcıları AuthKitConfig interface'ini implement ederek
 * kendi auth sistemlerini entegre edebilirler.
 */

// ============================================================================
// Request & Response Types
// ============================================================================

export interface User {
  username?: string
  email?: string
  id?: string
  [key: string]: unknown
}

export interface SignInCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface SignInResponse {
  success: boolean
  requiresOtp?: boolean
  /** Server-authoritative post-login path (e.g. /otp or /) */
  redirectTo?: string
  error?: string
  message?: string
  data?: {
    user?: User
    token?: string
    refreshToken?: string
  }
}

export interface OtpData {
  code: string
  username?: string
}

export interface OtpResponse {
  success: boolean
  error?: string
  message?: string
  data?: {
    token?: string
    user?: User
  }
}

export interface ForgotPasswordData {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  error?: string
  message?: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  error?: string
  message?: string
}

// ============================================================================
// Translation Types
// ============================================================================

export interface AuthKitTranslations {
  signIn: {
    title: string
    welcome: string
    subtitle: string
    username: string
    password: string
    rememberMe: string
    submit: string
    forgotPassword: string
    noAccount: string
    signUp: string
    orContinueWith: string
  }
  otp: {
    title: string
    subtitle: string
    description: string
    code: string
    submit: string
    resend: string
    resentSuccess: string
    backToSignIn: string
    didntReceive: string
  }
  signIn2: {
    description: string
    secureConnectionTitle: string
    secureConnectionDescription: string
    fastVerificationTitle: string
    fastVerificationDescription: string
    socialSignInTitle: string
    socialSignInDescription: string
  }
  forgotPassword: {
    title: string
    subtitle: string
    email: string
    submit: string
    backToSignIn: string
    checkEmail: string
  }
  resetPassword: {
    title: string
    subtitle: string
    password: string
    confirmPassword: string
    submit: string
    success: string
  }
  validation: {
    required: string
    emailRequired: string
    passwordRequired: string
    invalidEmail: string
    invalidPassword: string
    passwordTooShort: string
    passwordsDontMatch: string
    invalidOtp: string
    passwordStrengthLabels: string[]
    invalidStrength: string
  }
  errors: {
    generic: string
    networkError: string
    unauthorized: string
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AuthKitRoutes {
  /** Başarılı giriş sonrası yönlendirilecek sayfa */
  afterSignIn: string
  /** OTP doğrulaması sonrası yönlendirilecek sayfa (opsiyonel) */
  afterOtp?: string
  /** Şifremi unuttum sayfası */
  forgotPassword: string
  /** Şifre sıfırlama sayfası */
  resetPassword: string
  /** Giriş sayfası */
  signIn: string
  /** Kayıt sayfası (opsiyonel) */
  signUp?: string
}

export interface AuthKitSignIn2Content {
  badge?: string
  title?: string
  description?: string
  securityLabel?: string
  securityValue?: string
  securityDescription?: string
  backgroundImageUrl?: string
  backgroundImageAlt?: string
}

export interface AuthKitUIConfig {
  /** "Beni Hatırla" checkbox'ını göster */
  showRememberMe?: boolean
  /** "Şifremi Unuttum" linkini göster */
  showForgotPassword?: boolean
  /** Kayıt linkini göster */
  showSignUpLink?: boolean
  /** Sosyal login butonlarını göster */
  showSocialLogins?: boolean
  /** Sosyal login sağlayıcıları */
  socialProviders?: ('google' | 'apple' | 'microsoft')[] 
  /** Logo URL */
  logoUrl?: string
  /** Marka adı */
  brandName?: string
  /** Tema (light/dark) */
  theme?: 'light' | 'dark'
  /** Birincil renk (hex) */
  primaryColor?: string
  /** Vurgu rengi (hex) */
  accentColor?: string
  /** Border radius (tailwind class) */
  borderRadius?: string
  /** SignIn2 sayfası içerik ayarları */
  signIn2?: AuthKitSignIn2Content
  /** Özel class name'ler */
  classNames?: {
    container?: string
    form?: string
    button?: string
    input?: string
  }
}

export interface AuthKitConfig {
  // ========== Callback Fonksiyonlar ==========
  
  /** Kullanıcı giriş callback'i */
  onSignIn: (credentials: SignInCredentials) => Promise<SignInResponse>
  
  /** Google giriş callback'i */
  onGoogleSignIn?: () => Promise<SignInResponse>
  
  /** Apple giriş callback'i */
  onAppleSignIn?: () => Promise<SignInResponse>
  
  /** Microsoft giriş callback'i */
  onMicrosoftSignIn?: () => Promise<SignInResponse>
  
  /** OTP doğrulama callback'i */
  onOtpVerify?: (data: OtpData) => Promise<OtpResponse>
  
  /** Şifremi unuttum callback'i */
  onForgotPassword?: (data: ForgotPasswordData) => Promise<ForgotPasswordResponse>
  
  /** Şifre sıfırlama callback'i */
  onResetPassword?: (data: ResetPasswordData) => Promise<ResetPasswordResponse>
  
  /** OTP tekrar gönderme callback'i */
  onResendOtp?: (username: string) => Promise<{ success: boolean; error?: string }>
  
  // ========== Routing ==========
  
  /** Route konfigürasyonu */
  routes: AuthKitRoutes
  
  // ========== i18n ==========
  
  /** Aktif dil (varsayılan: 'tr') */
  locale?: string
  
  /** Özel çeviriler (varsayılan çevirileri override eder) */
  translations?: Partial<AuthKitTranslations>
  
  // ========== UI Konfigürasyonu ==========
  
  /** UI ayarları */
  ui?: AuthKitUIConfig
  
  // ========== Opsiyonel ==========
  
  /** Debug modu */
  debug?: boolean

  /** Hassas backend hata detaylarini kullaniciya gostermeyi kapat (varsayilan: true) */
  maskSensitiveErrors?: boolean
  
  /** Session timeout (ms) */
  sessionTimeout?: number

  /** Session timeout tetiklenince calisacak callback */
  onSessionTimeout?: () => void
}

// ============================================================================
// Context Types
// ============================================================================

export interface AuthKitContextValue {
  /** Kütüphane konfigürasyonu */
  config: AuthKitConfig
  
  /** Çeviri fonksiyonu */
  t: (key: string, params?: Record<string, string>) => string
  
  /** Global loading state */
  isLoading: boolean
  
  /** Loading state setter */
  setIsLoading: (loading: boolean) => void
  
  /** Global error state */
  error: string | null
  
  /** Error setter */
  setError: (error: string | null) => void
  
  /** Son giriş yapan kullanıcı adı (OTP için) */
  lastUsername: string | null
  
  /** Son kullanıcı adı setter */
  setLastUsername: (username: string | null) => void
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface SignInFormProps {
  /** Form submit sonrası callback */
  onSuccess?: (response: SignInResponse) => void
  
  /** Hata callback'i */
  onError?: (error: string) => void
  
  /** Özel class name */
  className?: string
}

export interface OtpFormProps {
  /** OTP uzunluğu (varsayılan: 6) */
  length?: number
  
  /** Form submit sonrası callback */
  onSuccess?: (response: OtpResponse) => void
  
  /** Hata callback'i */
  onError?: (error: string) => void
  
  /** Özel class name */
  className?: string
  
  /** Kullanıcı adı (opsiyonel, context'ten alınabilir) */
  username?: string
}

export interface ForgotPasswordFormProps {
  /** Form submit sonrası callback */
  onSuccess?: (response: ForgotPasswordResponse) => void
  
  /** Hata callback'i */
  onError?: (error: string) => void
  
  /** Özel class name */
  className?: string
}

export interface ResetPasswordFormProps {
  /** Reset token (URL'den alınır) */
  token: string
  
  /** Form submit sonrası callback */
  onSuccess?: (response: ResetPasswordResponse) => void
  
  /** Hata callback'i */
  onError?: (error: string) => void
  
  /** Özel class name */
  className?: string
}
