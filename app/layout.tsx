import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Contrato Ok',
  description: 'Contrato Ok - Seu assistente de contratos impulsionado por IA',
=======
  title: 'Contrato Amigo',
  description: 'Contrato Amigo',
>>>>>>> 158d9549918e91d3b8d87464b151d68b95a49069
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
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
