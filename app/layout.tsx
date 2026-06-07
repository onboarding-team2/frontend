import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IBK 퇴직연금 관리시스템',
  description: '기업 퇴직연금 통합 관리 대시보드',
  generator: 'v0.app',
  icons: {
    icon: '/ibk.ico',
    shortcut: '/ibk.ico',
    apple: '/ibk.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
