"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, Mail, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import api from "@/lib/axios"

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const token = searchParams.get('token')

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Token de confirmação não encontrado. Verifique o link recebido por email.')
        return
      }

      try {
        setStatus('loading')
        
        // Chamar endpoint de confirmação
        const response = await api.put(`/auth/confirm-register?token=${token}`)

        if (response.status === 200) {
          setStatus('success')
          setMessage('Email confirmado com sucesso! Redirecionando para o login...')
          
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
        
      } catch (error: any) {
        console.error('Erro ao confirmar email:', error)
        setStatus('error')
        
        if (error.response?.status === 400) {
          setMessage('Token inválido ou expirado. Solicite um novo email de confirmação.')
        } else if (error.response?.status === 404) {
          setMessage('Token não encontrado. Verifique o link recebido por email.')
        } else if (error.response?.data?.message) {
          setMessage(error.response.data.message)
        } else {
          setMessage('Erro ao confirmar email. Tente novamente mais tarde.')
        }
      }
    }

    confirmEmail()
  }, [token, router])

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500 mx-auto" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmando seu email...'
      case 'success':
        return 'Email confirmado!'
      case 'error':
        return 'Erro na confirmação'
    }
  }

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Logo Header */}
        <div className="pt-6 pb-2 text-center border-b border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo.png"
              alt="Contratook"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">Confirmação de Email</p>
                  <br />

        </div>

        
        <CardHeader className="text-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Aguarde enquanto verificamos seu email...'}
            {status === 'success' && 'Sua conta foi ativada com sucesso!'}
            {status === 'error' && 'Não foi possível confirmar seu email.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>
          
          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Mail className="h-4 w-4" />
                <span>Redirecionando automaticamente...</span>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">
                  Ir para Login
                </Link>
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">
                  Voltar ao Cadastro
                </Link>
              </Button>
              <Button asChild variant={getButtonColor()} className="w-full">
                <Link href="/login">
                  Tentar Login
                </Link>
              </Button>
            </div>
          )}
          
          {status === 'loading' && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ConfirmEmailPageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<ConfirmEmailPageLoading />}>
      <ConfirmEmailContent />
    </Suspense>
  )
}