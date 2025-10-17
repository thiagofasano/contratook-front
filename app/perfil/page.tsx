"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, MapPin, CreditCard, Loader2, Edit } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/error-utils"

interface UserProfile {
  id: string
  name: string
  email: string
  cpfCnpj?: string
  // Endereço
  cep?: string
  estado?: string
  cidade?: string
  bairro?: string
  rua?: string
  numeroComplemento?: string
  // Plano
  plano?: string
  planoAtivo?: boolean
  proximoVencimento?: string
}

interface UserAddress {
  street: string
  number: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(true)
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    cpfCnpj: '',
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numeroComplemento: '',
    plano: '',
    planoAtivo: false,
    proximoVencimento: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/user/me')
      
      if (response.data) {
        setProfile(response.data)
        
        console.log('📍 Dados do usuário carregados:', response.data)
        
        setFormData(prevFormData => ({
          ...prevFormData,
          id: response.data.id || '',
          name: response.data.name || '',
          email: response.data.email || '',
          cpfCnpj: response.data.cpfCnpj || '',
          // Mapear dados de endereço se existirem
          rua: response.data.address?.street || '',
          numeroComplemento: response.data.address?.number || '',
          cidade: response.data.address?.city || '',
          estado: response.data.address?.state || '',
          cep: response.data.address?.zipCode || '',
          plano: response.data.plano || 'Gratuito',
          planoAtivo: response.data.planoAtivo || false,
          proximoVencimento: response.data.proximoVencimento || ''
        }))
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error)
      const { message } = getApiErrorMessage(error)
      toast.error(message || 'Erro ao carregar dados do perfil')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/user/me', formData)
      
      if (response.data) {
        setProfile(response.data)
        toast.success('Perfil atualizado com sucesso!')
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      const { message } = getApiErrorMessage(error)
      toast.error(message || 'Erro ao atualizar perfil')
    }
  }

  const handleUpdateAddress = async () => {
    try {
      const addressData = {
        street: formData.rua || "",
        number: formData.numeroComplemento || "",
        city: formData.cidade || "",
        state: formData.estado || "",
        zipCode: formData.cep || "",
        country: "Brasil"
      }

      console.log('📍 Atualizando endereço:', addressData)

      await api.put('/user/address', addressData)
      
      toast.success('Endereço atualizado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar endereço:', error)
      const { message } = getApiErrorMessage(error)
      toast.error(message || 'Erro ao atualizar endereço')
    }
  }

  const getPlanBadgeVariant = (plano: string) => {
    switch (plano?.toLowerCase()) {
      case 'plus':
        return 'default'
      case 'premium':
        return 'secondary'
      case 'personalizado':
        return 'outline'
      default:
        return 'destructive'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Meu Perfil</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Suas informações básicas de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    disabled
                    className="bg-muted"

                  />
                </div>
                <div>
                  <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                    disabled
                    className="bg-muted"

                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
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
                Seu endereço para faturamento e correspondências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    disabled={!isEditing}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    disabled={!isEditing}
                    placeholder="UF"
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nome da cidade"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nome do bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={formData.rua}
                    onChange={(e) => handleInputChange('rua', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nome da rua"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="numeroComplemento">Número e Complemento</Label>
                <Input
                  id="numeroComplemento"
                  value={formData.numeroComplemento}
                  onChange={(e) => handleInputChange('numeroComplemento', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Complemento"
                />
              </div>
              
              {/* Botão para atualizar endereço */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleUpdateAddress}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  Atualizar Endereço
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano Atual
              </CardTitle>
              <CardDescription>
                Informações sobre sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Plano:</span>
                    <Badge variant={getPlanBadgeVariant(formData.plano || 'Gratuito')}>
                      {formData.plano || 'Gratuito'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <Badge variant={formData.planoAtivo ? "default" : "secondary"}>
                      {formData.planoAtivo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  {formData.proximoVencimento && (
                    <p className="text-sm text-muted-foreground">
                      Próximo vencimento: {new Date(formData.proximoVencimento).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button asChild variant="outline">
                    <Link href="/planos">
                      Ver Planos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}