import './globals.css'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ReactNode } from 'react'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/contexts/auth-context'
import { TenantProvider } from '@/contexts/tenant-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Digital Umroh - SaaS Manajemen Travel Umrah & Haji',
  description: 'Platform manajemen travel umrah dan haji terpadu dengan multi-tenant',
  keywords: 'umroh, haji, travel, management, saas',
  authors: [{ name: 'Digital Umroh Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#059669',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

interface RootLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <TenantProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </TenantProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}