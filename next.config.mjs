/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
}

export default nextConfig
