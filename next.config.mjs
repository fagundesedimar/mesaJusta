/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
}

const sentryWebpackPluginOptions = {}

export default process.env.SENTRY_DSN
  ? (await import('@sentry/nextjs')).withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
