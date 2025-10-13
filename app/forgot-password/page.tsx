"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Mail } from "lucide-react"
import { PublicRoute } from "@/components/protected-route"
import api from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("E-mail é obrigatório")
      return
    }

    if (!validateEmail(email)) {
      setError("E-mail inválido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log('📤 Enviando solicitação de recuperação para:', email)

      const response = await api.post('/auth/forgotPass', {
        email: email
      })

      console.log('✅ Solicitação enviada com sucesso:', response.data)

      // Mostrar toast de sucesso
      toast({
        title: "📧 E-mail enviado!",
        description: "Enviamos as instruções para redefinir sua senha. Verifique sua caixa de entrada e o spam.",
        duration: 5000,
      })

      setEmailSent(true)

    } catch (error: any) {
      console.error('❌ Erro na recuperação:', error)
      
      // Tratar diferentes tipos de erro
      if (error.response?.status === 404) {
        setError("E-mail não encontrado")
        toast({
          title: "⚠️ E-mail não encontrado",
          description: "Este e-mail não está cadastrado em nossa base de dados.",
          variant: "destructive",
          duration: 5000,
        })
      } else if (error.response?.status === 400) {
        setError("E-mail inválido")
        toast({
          title: "⚠️ E-mail inválido",
          description: "Verifique se o e-mail está correto e tente novamente.",
          variant: "destructive",
          duration: 5000,
        })
      } else {
        setError("Erro no servidor. Tente novamente.")
        toast({
          title: "🔧 Problema no servidor",
          description: "Algo deu errado. Aguarde um momento e tente novamente.",
          variant: "destructive",
          duration: 6000,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError("")
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src="/logo.png"
                  alt="Contratook"
                  width={120}
                  height={40}
                  className="h-6 w-auto"
                />
              </div>
              <CardTitle className="text-2xl">
                {emailSent ? "E-mail enviado!" : "Esqueceu sua senha?"}
              </CardTitle>
              <CardDescription>
                {emailSent 
                  ? "Verifique sua caixa de entrada e de spam e siga as instruções para redefinir sua senha."
                  : "Digite seu e-mail e enviaremos instruções para redefinir sua senha."
                }
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={handleChange}
                      className={error ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                </CardContent>

                <br />

                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full cursor-pointer hover:scale-105 transition-transform" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar instruções"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Lembrou da senha?{" "}
                    <Link href="/login" className="text-primary hover:underline cursor-pointer">
                      Fazer login
                    </Link>
                  </p>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-6">
                    Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá as instruções em breve.
                  </p>
                  <div className="space-y-2">
                    {/* <Button 
                      onClick={() => {
                        setEmailSent(false)
                        setEmail("")
                      }}
                      variant="outline" 
                      className="w-full"
                    >
                      Enviar para outro e-mail
                    </Button> */}
                    <Button 
                      onClick={() => router.push('/login')}
                      className="w-full cursor-pointer hover:scale-105 transition-transform"
                    >
                      Voltar para login
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PublicRoute>
  )
}