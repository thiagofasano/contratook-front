"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Mail, CheckCircle,FileText, Sparkles, Lock, Server  } from "lucide-react"
import { PublicRoute } from "@/components/protected-route"
import api from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { add } from "date-fns"


export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [plan] = useState<string>("free")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const planDetails = {
    free: { name: "Grátis", price: "R$ 0/mês" },
  }

  // Função para mapear plano para planId
  const getPlanId = (planName: string): number => {
    const planIdMap: Record<string, number> = {
      free: 1,
    }
    return planIdMap[planName] || 1 // Default para free se não encontrar
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)
      try {
        const registrationData = {
          name: "", // String vazia conforme solicitado
          email: formData.email,
          password: formData.password,
          planId: getPlanId(plan),
        }

        console.log('📤 Enviando dados de registro:', registrationData)

        const response = await api.post('/auth/register', registrationData)

        console.log('✅ Registro realizado com sucesso:', response.data)
        
        // Mostrar tela de confirmação de email
        setIsEmailSent(true)
        
        toast({
          title: "🎉 Conta criada com sucesso!",
          description: "Verifique seu e-mail para confirmar sua conta.",
          duration: 5000,
        })
        
      } catch (error: any) {
        console.error('❌ Erro no registro:', error)
        
        // Tratar diferentes tipos de erro
        if (error.response?.status === 400) {
          // Erros de validação
          if (error.response.data?.message?.includes('email')) {
            setErrors({ email: 'Este e-mail já está em uso' })
            toast({
              title: "⚠️ E-mail já cadastrado",
              description: "Este e-mail já possui uma conta. Que tal fazer login ou usar outro e-mail?",
              variant: "destructive",
              duration: 5000,
            })
          } else {
            setErrors({ email: 'Dados inválidos. Verifique as informações.' })
            toast({
              title: "⚠️ Verifique os dados",
              description: "Alguns campos precisam ser corrigidos. Confira e tente novamente.",
              variant: "destructive",
              duration: 5000,
            })
          }
        } else if (error.response?.status === 409) {
          setErrors({ email: 'E-mail já cadastrado' })
          toast({
            title: "⚠️ E-mail já cadastrado",
            description: "Este e-mail já possui uma conta. Que tal fazer login para continuar?",
            variant: "destructive",
            duration: 5000,
          })
        } else {
          setErrors({ email: 'Erro no servidor. Tente novamente.' })
          toast({
            title: "🔧 Problema no servidor",
            description: "Algo deu errado do nosso lado. Aguarde um momento e tente novamente.",
            variant: "destructive",
            duration: 6000,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-background p-4">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para home
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Seção de Cadastro */}
          <div className="flex-1 max-w-2xl flex flex-col justify-center min-h-[80vh]">
            <Card className="w-full h-full flex flex-col justify-center">
          {!isEmailSent ? (
            <>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src="/logo.png"
                    alt="Contratook"
                    width={160}
                    height={60}
                    className="h-6 w-auto"
                  />
                </div>
                <CardTitle className="text-2xl">Criar sua conta</CardTitle>
                
                {/* Plano Selecionado - Destacado */}
                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Plano Selecionado</p>
                      <p className="text-lg font-bold text-foreground">
                        {planDetails[plan as keyof typeof planDetails].name}
                      </p>
                      <p>3 análises/mês</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {planDetails[plan as keyof typeof planDetails].price}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Email and Password */}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
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
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-primary hover:underline cursor-pointer">
                      Fazer login
                    </Link>
                  </p>
                </CardFooter>
              </form>

            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Image
                    src="/logo.png"
                    alt="Contratook"
                    width={120}
                    height={40}
                    className="h-6 w-auto"
                  />
                </div>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
                <CardDescription className="text-center text-base">
                  Enviamos um link de confirmação para
                  <br />
                  <span className="font-semibold text-foreground">{formData.email}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Importante!
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Você precisa confirmar seu e-mail antes de fazer login. Verifique sua caixa de entrada e clique no link de confirmação.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Não recebeu o e-mail? Verifique sua pasta de spam ou
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Aqui você pode implementar reenvio do e-mail
                      toast({
                        title: "E-mail reenviado!",
                        description: "Verifique sua caixa de entrada novamente.",
                        duration: 3000,
                      })
                    }}
                    className="w-full"
                  >
                    Reenviar e-mail de confirmação
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Já confirmou seu e-mail?
                  </p>
                  <Button 
                    onClick={() => router.push('/login')}
                    className="w-full" 
                    variant="default"
                  >
                    Ir para o login
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setIsEmailSent(false)}
                  variant="ghost" 
                  className="w-full text-sm"
                >
                  ← Voltar ao cadastro
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>

      {/* Features Grid ao lado */}
      <div className="flex-1 min-h-[80vh]">
        <div className="h-full flex flex-col justify-center">

          
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.0s_forwards] w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <Shield className="h-10 w-10 text-black flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle>Análise Inteligente</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    IA avançada identifica cláusulas abusivas e pontos de atenção em segundos.
                  </p>
                </div>
              </CardHeader>
            </Card>

            <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.2s_forwards] w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <Sparkles className="h-10 w-10 text-black flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle>Sugestões Personalizadas</CardTitle>
                  <p className="text-muted-foreground mt-2">Receba recomendações específicas para melhorar seus contratos.</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.4s_forwards] w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <FileText className="h-10 w-10 text-black flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle>Referências Legais</CardTitle>
                  <p className="text-muted-foreground mt-2">Todas as análises incluem referências às leis aplicáveis.</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.6s_forwards] w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <Lock className="h-10 w-10 text-black flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle>Processamento Seguro</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Os contratos são processados por meio de conexões criptografadas (HTTPS) e não ficam salvos em nossos servidores após a análise, garantindo privacidade total.
                  </p>
                </div>
              </CardHeader>
            </Card>

                        <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.6s_forwards] w-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <Server className="h-12 w-12 text-black mb-6 mx-auto" />
                <div className="flex-1">
                  <CardTitle>Conformidade total com a LGPD</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD), os documentos são usados exclusivamente para o propósito de análise contratual solicitada pelo usuário, não ficando armazenados.
                  </p>
                </div>
              </CardHeader>
            </Card>


          </div>
        </div>
      </div>
    </div>


 

    </div>

    
    </PublicRoute>
  )
}
