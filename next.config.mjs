/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Address map preview (OpenStreetMap embed)
      "frame-src 'self' https://www.openstreetmap.org https://www.google.com https://maps.google.com https://maps.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      // Dev: allow localhost ws/http for Next HMR + RSC; prod keeps https-only connect
      isDev
        ? "connect-src 'self' http: https: ws: wss:"
        : "connect-src 'self' https:",
      "object-src 'none'",
      // Never force HTTPS on localhost — breaks RSC soft navigation (Failed to fetch)
      ...(isDev ? [] : ['upgrade-insecure-requests']),
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]),
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/arf/auth/signin', destination: '/signin', permanent: false },
      { source: '/arf/auth/otp', destination: '/otp', permanent: false },
      { source: '/arf/auth/forgot-password', destination: '/forgot-password', permanent: false },
      { source: '/arf/auth/reset-password', destination: '/reset-password', permanent: false },
      { source: '/arf/auth/accept-invite', destination: '/accept-invite', permanent: false },
      { source: '/arf', destination: '/', permanent: false },
    ]
  },
  async rewrites() {
    return []
  },
}

export default nextConfig
