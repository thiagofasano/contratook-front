"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Bell } from "lucide-react"
import { AlertsSection } from "@/components/dashboard/alerts-section"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProtectedRoute } from "@/components/protected-route"
import api from "@/lib/axios"

// Interface para parametrização da API
interface Parameterization {
  alertContractTime: number
  alertContractTimeRecipients: string[]
}

export default function AcompanhamentoPage() {
  const [contractsData, setContractsData] = useState({
    totalAtivos: 0,
    totalExpirandoEm30Dias: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [parameterization, setParameterization] = useState<Parameterization | null>(null)

  // Buscar parametrização da API
  const fetchParameterization = async () => {
    try {
      console.log('📋 Buscando parametrização...')

      const response = await api.get<Parameterization>('/Parameterization/me-params')
      
      console.log('✅ Parametrização carregada:', response.data)
      
      setParameterization(response.data)
      
    } catch (error) {
      console.error('❌ Erro ao carregar parametrização:', error)
    }
  }

  // Buscar estatísticas da API
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      console.log('📊 Buscando estatísticas de contratos...')

      const contractsResponse = await api.get('/Contracts/stats')
      
      console.log('✅ Estatísticas de contratos carregadas:', contractsResponse.data)
      
      setContractsData(contractsResponse.data)
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
      // Manter valores padrão em caso de erro
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Carregar parametrização e estatísticas quando o componente montar
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchParameterization() // Carregar parametrização primeiro
      await fetchStats() // Depois carregar estatísticas
    }
    
    loadInitialData()
  }, [])

  const stats = [
    {
      title: "Contratos Ativos",
      value: isLoadingStats ? "..." : contractsData.totalAtivos.toString(),
      icon: Shield,
      description: "Com alertas configurados",
    },
    {
      title: "Próximos Vencimentos",
      value: isLoadingStats ? "..." : contractsData.totalExpirandoEm30Dias.toString(),
      icon: Bell,
      description: parameterization 
        ? `Vencem em ${parameterization.alertContractTime} dias ou menos` 
        : "Vencem em 30 dias ou menos",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Acompanhamento de Contratos</h1>
            <p className="text-muted-foreground">
              Gerencie e monitore seus contratos, configure alertas de vencimento e mantenha tudo organizado
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alerts Section */}
          <AlertsSection onStatsUpdate={fetchStats} />
        </main>
      </div>
    </ProtectedRoute>
  )
}