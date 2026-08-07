import type { AuthKitConfig } from '@hascanb/arf-ui-kit/auth-kit'
import { ARF_ROUTES } from '../_shared/routes'
import {
  forgotPassword,
  resendOtp,
  resetPassword,
  signInWithPassword,
  verifyOtpCode,
} from './_api/auth-client'
import { sanitizeAuthError } from './_lib/sanitize-error'

const INVALID_OR_EXPIRED_RESET_LINK =
  'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.'

export const arfAuthConfig: AuthKitConfig = {
  onSignIn: async (credentials) => {
    const response = await signInWithPassword({
      email: credentials.username,
      password: credentials.password,
      rememberMe: credentials.rememberMe,
    })

    if (!response.success) {
      return {
        success: false,
        error: sanitizeAuthError(response.error),
      }
    }

    const requiresOtp = Boolean(
      response.requiresOtp ||
        response.redirectTo === '/otp' ||
        (response.data &&
          typeof response.data === 'object' &&
          'requiresOtp' in response.data &&
          Boolean((response.data as { requiresOtp?: boolean }).requiresOtp))
    )

    const redirectTo =
      (typeof response.redirectTo === 'string' && response.redirectTo.trim()) ||
      (requiresOtp ? '/otp' : ARF_ROUTES.root)

    return {
      success: true,
      requiresOtp,
      redirectTo,
      data: {
        user: response.data?.user,
        token: requiresOtp ? undefined : '__cookie_managed_session__',
      },
    }
  },

  onGoogleSignIn: async () => {
    return {
      success: false,
      error: 'Google girişi henüz aktif değil.',
    }
  },

  onAppleSignIn: async () => {
    return {
      success: false,
      error: 'Apple girişi henüz aktif değil.',
    }
  },

  onOtpVerify: async (data) => {
    const response = await verifyOtpCode({
      code: data.code,
    })

    if (!response.success) {
      return {
        success: false,
        error: sanitizeAuthError(response.error),
      }
    }

    return {
      success: true,
      data: {
        token: '__cookie_managed_session__',
        user: response.data?.user,
      },
    }
  },

  onForgotPassword: async (data) => {
    const response = await forgotPassword({
      email: data.email,
    })

    if (!response.success) {
      return {
        success: false,
        error: sanitizeAuthError(response.error),
      }
    }

    return {
      success: true,
      message: 'E-posta adresinizi kontrol edin. Şifre sıfırlama bağlantısı gönderildi.',
    }
  },

  onResetPassword: async (data) => {
    const token = data.token?.trim()
    if (!token) {
      return {
        success: false,
        error: INVALID_OR_EXPIRED_RESET_LINK,
      }
    }

    const response = await resetPassword({
      token,
      password: data.password,
    })

    if (!response.success) {
      return {
        success: false,
        error: sanitizeAuthError(response.error),
      }
    }

    return {
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı.',
    }
  },

  onResendOtp: async () => {
    const response = await resendOtp()

    return {
      success: Boolean(response.success),
      error: response.success ? undefined : sanitizeAuthError(response.error),
    }
  },

  routes: {
    afterSignIn: ARF_ROUTES.root,
    afterOtp: ARF_ROUTES.root,
    forgotPassword: ARF_ROUTES.auth.forgotPassword,
    resetPassword: ARF_ROUTES.auth.resetPassword,
    signIn: ARF_ROUTES.auth.signIn,
  },

  locale: 'tr',

  translations: {
    signIn: {
      title: 'Giriş Yap',
      welcome: 'Hoş Geldiniz',
      subtitle: '',
      username: 'E-posta Adresi',
      password: 'Şifre',
      rememberMe: 'Beni Hatırla',
      submit: 'Giriş Yap',
      forgotPassword: 'Şifremi Unuttum?',
      noAccount: 'Hesabınız yok mu?',
      signUp: 'Kayıt Ol',
      orContinueWith: 'veya',
    },
    signIn2: {
      description: 'ARF çalışma alanına tek noktadan erişin; operasyon, finans ve kullanıcı süreçlerinizi güvenli biçimde yönetin.',
      secureConnectionTitle: 'Kurumsal güvenlik altyapısı',
      secureConnectionDescription: 'Oturum ve veri trafiği, güncel şifreleme standartlarıyla güvenli kanallar üzerinden korunur.',
      fastVerificationTitle: 'Hızlı ve kesintisiz kimlik doğrulama',
      fastVerificationDescription: 'Doğrulama adımları, kullanıcı deneyimini hızlandıracak şekilde yalın ve kararlı olarak tasarlanmıştır.',
      socialSignInTitle: 'Sosyal hesaplarla güvenli giriş',
      socialSignInDescription: 'Google ve Apple hesaplarıyla doğrulanmış, hızlı ve güvenilir oturum açma deneyimi sunulur.',
    },
  },

  ui: {
    showRememberMe: true,
    showForgotPassword: true,
    showSignUpLink: false,
    showSocialLogins: false,
    socialProviders: ['google', 'apple'],
    logoUrl: undefined,
    brandName: 'ARF',
    theme: 'light',
    primaryColor: '#2b2a31',
    accentColor: '#5b5752',
    borderRadius: 'rounded-2xl',
    signIn2: {
      badge: 'ARF Çalışma Alanı',
      title: 'Arf Süper Platforma Hoş Geldiniz',
      description: 'Hesabınıza giriş yaparak tüm süreçlerinizi tek panelden güvenle yönetin.',
      backgroundImageUrl: undefined,
      backgroundImageAlt: 'Logo ve arka plan görseli',
    },
  },

  debug: false,
}
