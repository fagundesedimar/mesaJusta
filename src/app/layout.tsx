import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
