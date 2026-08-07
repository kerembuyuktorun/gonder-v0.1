/**
 * Auth Kit - Default Translations
 * 
 * Varsayılan çeviri metinleri (TR ve EN)
 * Kullanıcılar AuthKitConfig.translations ile bu değerleri override edebilir
 */

import type { AuthKitTranslations } from '../context/types'

export const defaultTranslations: Record<string, AuthKitTranslations> = {
  tr: {
    signIn: {
      title: 'Giriş Yap',
      welcome: 'Hoş Geldiniz',
      subtitle: 'Hesabınıza giriş yapın',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      rememberMe: 'Beni Hatırla',
      submit: 'Giriş Yap',
      forgotPassword: 'Şifremi Unuttum?',
      noAccount: 'Hesabınız yok mu?',
      signUp: 'Kayıt Ol',
      orContinueWith: 'veya şununla devam et',
    },
    otp: {
      title: 'Doğrulama Kodu',
      subtitle: 'Doğrulama Kodunu Girin',
      description: 'Telefonunuza gönderilen 6 haneli kodu girin',
      code: 'Doğrulama Kodu',
      submit: 'Doğrula',
      resend: 'Kodu Tekrar Gönder',
      resentSuccess: 'Kod tekrar gönderildi',
      backToSignIn: 'Giriş sayfasına dön',
      didntReceive: 'Kod almadınız mı?',
    },
    signIn2: {
      description: 'ARF platformuna giriş yaparak işlemlerinizi güvenli şekilde yönetebilirsiniz.',
      secureConnectionTitle: 'Güvenli ve şifreli bağlantı',
      secureConnectionDescription: 'Tüm oturum hareketleri şifrelenmiş altyapı üzerinden iletilir.',
      fastVerificationTitle: 'Hızlı kimlik doğrulama',
      fastVerificationDescription: 'Kullanıcı doğrulama süreci sade ve performans odaklıdır.',
      socialSignInTitle: 'Sosyal hesaplarla devam',
      socialSignInDescription: 'Google ve Apple ile hızlı ve güvenilir şekilde oturum açın.',
    },
    forgotPassword: {
      title: 'Şifremi Unuttum',
      subtitle: 'Şifrenizi sıfırlayın',
      email: 'E-posta Adresi',
      submit: 'Sıfırlama Bağlantısı Gönder',
      backToSignIn: 'Giriş sayfasına dön',
      checkEmail: 'E-posta adresinizi kontrol edin. Şifre sıfırlama bağlantısı gönderildi.',
    },
    resetPassword: {
      title: 'Şifreyi Sıfırla',
      subtitle: 'Yeni şifrenizi belirleyin',
      password: 'Yeni Şifre',
      confirmPassword: 'Yeni Şifre (Tekrar)',
      submit: 'Şifreyi Sıfırla',
      success: 'Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...',
    },
    validation: {
      required: 'Bu alan zorunludur',
      emailRequired: 'E-posta adresi zorunludur',
      passwordRequired: 'Şifre zorunludur',
      invalidEmail: 'Geçersiz e-posta adresi',
      invalidPassword: 'Geçersiz şifre',
      passwordTooShort: 'Şifre en az 8 karakter olmalıdır',
      passwordsDontMatch: 'Şifreler eşleşmiyor',
      invalidOtp: 'Doğrulama kodu 6 haneli olmalıdır',
      passwordStrengthLabels: ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'],
      invalidStrength: 'Geçersiz',
    },
    errors: {
      generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      networkError: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
      unauthorized: 'Yetkisiz erişim. Lütfen tekrar giriş yapın.',
    },
  },
  
  en: {
    signIn: {
      title: 'Sign In',
      welcome: 'Welcome back',
      subtitle: 'Sign in to your account',
      username: 'Username',
      password: 'Password',
      rememberMe: 'Remember Me',
      submit: 'Sign In',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      orContinueWith: 'or continue with',
    },
    otp: {
      title: 'Verification Code',
      subtitle: 'Enter Verification Code',
      description: 'Enter the 6-digit code sent to your phone',
      code: 'Verification Code',
      submit: 'Verify',
      resend: 'Resend Code',
      resentSuccess: 'Code resent successfully',
      backToSignIn: 'Back to sign in',
      didntReceive: "Didn't receive the code?",
    },
    signIn2: {
      description: 'Sign in to your ARF workspace and manage your operations securely.',
      secureConnectionTitle: 'Secure encrypted connection',
      secureConnectionDescription: 'Every session action is transmitted through encrypted infrastructure.',
      fastVerificationTitle: 'Fast identity verification',
      fastVerificationDescription: 'The verification flow is streamlined and performance-focused.',
      socialSignInTitle: 'Continue with social accounts',
      socialSignInDescription: 'Use Google or Apple for a fast and trusted sign-in experience.',
    },
    forgotPassword: {
      title: 'Forgot Password',
      subtitle: 'Reset your password',
      email: 'Email Address',
      submit: 'Send Reset Link',
      backToSignIn: 'Back to sign in',
      checkEmail: 'Check your email. A password reset link has been sent.',
    },
    resetPassword: {
      title: 'Reset Password',
      subtitle: 'Set your new password',
      password: 'New Password',
      confirmPassword: 'Confirm New Password',
      submit: 'Reset Password',
      success: 'Your password has been reset successfully. Redirecting to sign in...',
    },
    validation: {
      required: 'This field is required',
      emailRequired: 'Email address is required',
      passwordRequired: 'Password is required',
      invalidEmail: 'Invalid email address',
      invalidPassword: 'Invalid password',
      passwordTooShort: 'Password must be at least 8 characters',
      passwordsDontMatch: "Passwords don't match",
      invalidOtp: 'Verification code must be 6 digits',
      passwordStrengthLabels: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'],
      invalidStrength: 'Invalid',
    },
    errors: {
      generic: 'An error occurred. Please try again.',
      networkError: 'Network error. Please check your internet connection.',
      unauthorized: 'Unauthorized access. Please sign in again.',
    },
  },
}

/**
 * Varsayılan dili al
 */
export const getDefaultLocale = (): string => 'tr'

/**
 * Desteklenen dilleri al
 */
export const getSupportedLocales = (): string[] => Object.keys(defaultTranslations)
