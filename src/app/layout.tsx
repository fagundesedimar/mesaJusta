import type { Metadata } from 'next'
import './globals.css'
import SkipLink from '@/components/layout/SkipLink'
import ThemeToggle from '@/components/layout/ThemeToggle'

export const metadata: Metadata = {
  title: 'Mesa Justa',
  description: 'Circuito Solidário',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SkipLink />
        <div style={{ position: 'fixed', top: '0.75rem', right: '0.75rem', zIndex: 9999 }}>
          <ThemeToggle />
        </div>
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
