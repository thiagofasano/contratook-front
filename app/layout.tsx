import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/toaster'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contratook',
  description: 'Contratook - Seu assistente de contratos impulsionado por IA',
  generator: 'App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
