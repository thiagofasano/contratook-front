"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft } from "lucide-react"
import { PublicRoute } from "@/components/protected-route"
import api from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { add } from "date-fns"

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [plan, setPlan] = useState<string>("free")
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    password: "",
    confirmPassword: "",
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam) {
      setPlan(planParam.toLowerCase())
    }
  }, [searchParams])

  const needsAddress = plan === "plus" || plan === "premium"

  const planDetails = {
    free: { name: "Grátis", price: "R$ 0/mês" },
    plus: { name: "Plus", price: "R$ 49/mês" },
    premium: { name: "Premium", price: "R$ 99/mês" },
  }

  // Função para mapear plano para planId
  const getPlanId = (planName: string): number => {
    const planIdMap: Record<string, number> = {
      free: 5,
      plus: 6,
      premium: 7
    }
    return planIdMap[planName] || 5 // Default para free se não encontrar
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

    if (needsAddress) {
      if (!formData.street) newErrors.street = "Rua é obrigatória"
      if (!formData.number) newErrors.number = "Número é obrigatório"
      if (!formData.city) newErrors.city = "Cidade é obrigatória"
      if (!formData.state) newErrors.state = "Estado é obrigatório"
      if (!formData.zipCode) newErrors.zipCode = "CEP é obrigatório"
      if (!formData.country) newErrors.country = "País é obrigatório"
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
          name: formData.nome,
          email: formData.email,
          password: formData.password,
          planId: getPlanId(plan),
          address:  {
            street: formData.street  || "",
            number: formData.number || "",
            city: formData.city || "",
            state: formData.state || "",
            zipCode: formData.zipCode || "",
            country: formData.country || ""
          } ,
          
        }

        console.log('📤 Enviando dados de registro:', registrationData)

        const response = await api.post('/auth/register', registrationData)

        console.log('✅ Registro realizado com sucesso:', response.data)
        
        // Mostrar toast de sucesso
        toast({
          title: "🎉 Conta criada com sucesso!",
          description: "Bem-vindo ao Contrato do Bem! Redirecionando para o login...",
          duration: 3000,
        })

        // Aguardar um pouco para o usuário ver o toast antes de redirecionar
        setTimeout(() => {
          router.push('/login')
        }, 1500)
        
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

  const handlePlanChange = (newPlan: string) => {
    setPlan(newPlan)
    // Update URL to reflect the new plan
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("plan", newPlan)
    window.history.replaceState({}, "", newUrl.toString())
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">Contrato Ok</span>
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
                                {plan === "plus" && (
                <p className="text-xs text-muted-foreground">✨ Recomendado para profissionais</p>
              )}
              {plan === "premium" && (
                <p className="text-xs text-muted-foreground">🚀 Ideal para empresas</p>
              )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {planDetails[plan as keyof typeof planDetails].price}
                  </p>
                  {plan !== "free" && (
                    <p className="text-xs text-muted-foreground">por mês</p>
                  )}
                </div>
              </div>
              
              {/* Seletor de Planos */}
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={plan === "free" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlanChange("free")}
                  className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  Grátis
                </Button>
                <Button
                  type="button"
                  variant={plan === "plus" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlanChange("plus")}
                  className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  Plus
                </Button>
                <Button
                  type="button"
                  variant={plan === "premium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlanChange("premium")}
                  className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  Premium
                </Button>
              </div>


            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>


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

              {/* Address fields for Plus and Premium */}
              {needsAddress && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold mb-4">Endereço de Cobrança</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        name="street"
                        placeholder="Nome da rua"
                        value={formData.street}
                        onChange={handleChange}
                        className={errors.street ? "border-destructive" : ""}
                      />
                      {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        name="number"
                        placeholder="123"
                        value={formData.number}
                        onChange={handleChange}
                        className={errors.number ? "border-destructive" : ""}
                      />
                      {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="São Paulo"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="SP"
                        maxLength={2}
                        value={formData.state}
                        onChange={handleChange}
                        className={errors.state ? "border-destructive" : ""}
                      />
                      {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      placeholder="00000-000"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={errors.zipCode ? "border-destructive" : ""}
                    />
                    {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="BR"
                      value={formData.country}
                      onChange={handleChange}
                      className={errors.country ? "border-destructive" : ""}
                    />
                    {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                  </div>
                </>
              )}
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
        </Card>
      </div>
    </div>
    </PublicRoute>
  )
}
