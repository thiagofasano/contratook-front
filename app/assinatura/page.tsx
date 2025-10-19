"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, FileText, User, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function AssinaturaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const plan = searchParams.get('plan') || 'plus'
  const planDetails = {
    plus: { name: 'Plus', price: 'R$ 45', description: '30 análises por mês' },
    premium: { name: 'Premium', price: 'R$ 99', description: '100 análises por mês' }
  }
  
  const [formData, setFormData] = useState({
    // Dados pessoais
    nomeCompleto: '',
    cpfCnpj: '',
    email: '',
    
    // Endereço
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numeroComplemento: '',
    
    // Pagamento
    metodoPagamento: 'cartao'
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }
    
    // Preencher email do usuário logado
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }))
    }
  }, [user, isLoading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCepChange = async (cep: string) => {
    handleInputChange('cep', cep)
    
    // Auto-completar endereço via CEP (apenas se CEP tem 8 dígitos)
    if (cep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            estado: data.uf,
            cidade: data.localidade,
            bairro: data.bairro,
            rua: data.logradouro
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/assinatura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plano: plan
        }),
      })

      if (response.ok) {
        toast.success('Assinatura realizada com sucesso!')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao processar assinatura')
      }
    } catch (error) {
      toast.error('Erro ao processar assinatura')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/planos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Finalizar Assinatura</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Plan Highlight Section */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      Plano {planDetails[plan as keyof typeof planDetails].name}
                    </h2>
                    <p className="text-muted-foreground">
                      {planDetails[plan as keyof typeof planDetails].description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {planDetails[plan as keyof typeof planDetails].price}
                  </div>
                  <div className="text-sm text-muted-foreground">por mês</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Seus Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seus Dados
                </CardTitle>
                <CardDescription>
                  Informações pessoais para a assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                      required
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                    <Input
                      id="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                      required
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="seu@email.com"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
                <CardDescription>
                  Endereço para faturamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      required
                      placeholder="00000-000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      required
                      placeholder="UF"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      required
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange('bairro', e.target.value)}
                      required
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rua">Rua *</Label>
                    <Input
                      id="rua"
                      value={formData.rua}
                      onChange={(e) => handleInputChange('rua', e.target.value)}
                      required
                      placeholder="Nome da rua"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="numeroComplemento">Número e Complemento *</Label>
                  <Input
                    id="numeroComplemento"
                    value={formData.numeroComplemento}
                    onChange={(e) => handleInputChange('numeroComplemento', e.target.value)}
                    required
                    placeholder="123, Apto 45"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha a forma de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.metodoPagamento}
                  onValueChange={(value) => handleInputChange('metodoPagamento', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cartao" id="cartao" />
                    <Label htmlFor="cartao" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Cartão de Crédito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boleto" id="boleto" />
                    <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Boleto Bancário
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Botão de Assinatura */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Assinar Plano'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

function AssinaturaPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default function AssinaturaPage() {
  return (
    <Suspense fallback={<AssinaturaPageLoading />}>
      <AssinaturaForm />
    </Suspense>
  )
}