"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { PublicRoute } from "@/components/protected-route"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)
      try {
        await login(formData.email, formData.password)
        
        console.log('✅ Login realizado com sucesso!')
        // O redirecionamento é automático pelo AuthProvider
        router.push("/dashboard")
      } catch (error: any) {
        console.error('Erro no login:', error)
        
        // Tratar diferentes tipos de erro
        if (error.response?.status === 401) {
          setErrors({ password: 'E-mail ou senha incorretos' })
        } else if (error.response?.status === 400) {
          setErrors({ email: 'Dados inválidos' })
        } else {
          setErrors({ email: 'Erro no servidor. Tente novamente.' })
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
                <span className="font-bold">Contratook</span>
              </div>
              <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
              <CardDescription>Entre com suas credenciais para acessar sua conta</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            </CardContent>

            <br />

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full cursor-pointer hover:scale-105 transition-transform" size="lg" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Não tem uma conta?{" "}
                <Link href="/signup" className="text-primary hover:underline cursor-pointer">
                  Criar conta
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
