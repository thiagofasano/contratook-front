"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, Lock, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import api from "@/lib/axios"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/error-utils"

function ResetPassContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de redefinição não encontrado. Verifique o link recebido por email.')
    }
  }, [token])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validatePasswords = () => {
    if (!formData.newPassword) {
      toast.error('Digite a nova senha')
      return false
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    
    if (!formData.confirmPassword) {
      toast.error('Confirme a nova senha')
      return false
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswords()) return
    if (!token) {
      toast.error('Token inválido')
      return
    }

    try {
      setIsSubmitting(true)
      setStatus('loading')
      
      // Chamar endpoint de reset de senha
      const response = await api.put('/auth/resetPass', {
        token: token,
        newPassword: formData.newPassword
      })

      if (response.status === 200) {
        setStatus('success')
        setMessage('Senha redefinida com sucesso! Redirecionando para o login...')
        toast.success('Senha alterada com sucesso!')
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
      
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      setStatus('error')
      setIsSubmitting(false)
      
      // Usar função utilitária para extrair mensagem de erro
      const { message } = getApiErrorMessage(error)
      
      setMessage(message || 'Erro ao redefinir senha. Tente novamente mais tarde.')
      toast.error(message || 'Erro ao alterar senha')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500 mx-auto" />
      case 'form':
        return <Lock className="h-16 w-16 text-primary mx-auto" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Redefinindo senha...'
      case 'success':
        return 'Senha redefinida!'
      case 'error':
        return 'Erro na redefinição'
      case 'form':
        return 'Redefinir Senha'
    }
  }

  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Aguarde enquanto processamos sua nova senha...'
      case 'success':
        return 'Sua senha foi alterada com sucesso!'
      case 'error':
        return 'Não foi possível redefinir sua senha.'
      case 'form':
        return 'Digite sua nova senha abaixo'
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
          <p className="text-sm text-muted-foreground">Redefinir Senha</p>
                  <br />
        </div>


        
        <CardHeader className="text-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          )}

          {status !== 'form' && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {message}
              </p>
              
              {status === 'success' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
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
                    <Link href="/forgot-password">
                      Solicitar Novo Link
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/login">
                      Voltar ao Login
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResetPassPageLoading() {
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

export default function ResetPassPage() {
  return (
    <Suspense fallback={<ResetPassPageLoading />}>
      <ResetPassContent />
    </Suspense>
  )
}