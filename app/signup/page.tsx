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

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [plan, setPlan] = useState<string>("free")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam) {
      setPlan(planParam.toLowerCase())
    }
  }, [searchParams])

  const needsAddress = plan === "plus" || plan === "premium"

  const planDetails = {
    free: { name: "Free", price: "R$ 0/mês" },
    plus: { name: "Plus", price: "R$ 49/mês" },
    premium: { name: "Premium", price: "R$ 99/mês" },
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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // In a real app, this would send data to an API
      console.log("Form submitted:", { ...formData, plan })
      // Redirect to dashboard after successful signup
      router.push("/dashboard")
    }
  }

  return (
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
              <span className="font-bold">ContractAI</span>
            </div>
            <CardTitle className="text-2xl">Criar sua conta</CardTitle>
            <CardDescription>
              Plano selecionado:{" "}
              <span className="font-semibold text-foreground">
                {planDetails[plan as keyof typeof planDetails].name}
              </span>{" "}
              - {planDetails[plan as keyof typeof planDetails].price}
            </CardDescription>
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
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" size="lg">
                Criar Conta
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Fazer login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
