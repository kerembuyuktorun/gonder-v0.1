/**
 * Test Auth Demo Configuration
 *
 * app/test/auth altindaki sayfa ve component demolari icin ortak config.
 */

import type { AuthKitConfig } from '@hascanb/arf-ui-kit/auth-kit'

export const demoAuthConfig: AuthKitConfig = {
  onSignIn: async (credentials) => {
    void credentials
    await new Promise((resolve) => setTimeout(resolve, 1200))

    if (credentials.username === 'admin' && credentials.password === 'password123') {
      return {
        success: true,
        requiresOtp: true,
        data: {
          user: { username: 'admin' },
        },
      }
    }

    if (credentials.username === 'user' && credentials.password === 'password') {
      return {
        success: true,
        requiresOtp: false,
        data: {
          user: { username: 'user' },
          token: 'demo-jwt-token',
        },
      }
    }

    return {
      success: false,
      error: 'Kullanici adi veya sifre hatali',
    }
  },

  onOtpVerify: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 900))

    if (data.code === '123456') {
      return {
        success: true,
        data: {
          token: 'demo-jwt-token',
          user: { username: data.username },
        },
      }
    }

    return {
      success: false,
      error: 'Gecersiz dogrulama kodu',
    }
  },

  onForgotPassword: async (data) => {
    void data
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
    }
  },

  onResetPassword: async (data) => {
    void data
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı.',
    }
  },

  onResendOtp: async (username) => {
    void username
    await new Promise((resolve) => setTimeout(resolve, 400))

    return {
      success: true,
    }
  },

  routes: {
    afterSignIn: '/test/auth',
    afterOtp: '/test/auth',
    forgotPassword: '/test/auth/pages/forgot-password',
    resetPassword: '/test/auth/pages/reset-password',
    signIn: '/test/auth/pages/signin',
    signUp: '/test/auth/pages/signin',
  },

  locale: 'tr',

  ui: {
    showRememberMe: true,
    showForgotPassword: true,
    showSignUpLink: false,
    logoUrl: '/logo.svg',
    brandName: 'ARF Test Auth',
  },

  debug: true,
}
