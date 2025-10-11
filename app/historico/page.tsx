"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle } from "lucide-react"
import { HistorySection } from "@/components/dashboard/history-section"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProtectedRoute } from "@/components/protected-route"
import api from "@/lib/axios"

export default function HistoricoPage() {
  const router = useRouter()
  const [statsData, setStatsData] = useState({
    totalAnalises: 0,
    totalClausulasAbusivas: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Buscar estatísticas da API
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      console.log('📊 Buscando estatísticas...')

      const analysisResponse = await api.get('/Analysis/stats')
      
      console.log('✅ Estatísticas de análises carregadas:', analysisResponse.data)
      
      setStatsData(analysisResponse.data)
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
      // Manter valores padrão em caso de erro
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Carregar estatísticas quando o componente montar
  useEffect(() => {
    fetchStats()
  }, [])

  const stats = [
    {
      title: "Análises Realizadas",
      value: isLoadingStats ? "..." : statsData.totalAnalises.toString(),
      icon: FileText,
      description: "Total de análises",
    },
    {
      title: "Cláusulas Abusivas",
      value: isLoadingStats ? "..." : statsData.totalClausulasAbusivas.toString(),
      icon: AlertTriangle,
      description: "Identificadas",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Histórico de Análises</h1>
            <p className="text-muted-foreground">
              Visualize todas as suas análises de contratos realizadas anteriormente
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

          {/* History Section */}
          <HistorySection 
            onViewAnalysis={(analysis) => {
              // Redirecionar para o dashboard com a análise selecionada
              router.push(`/dashboard?analysis=${analysis.id}`)
            }}
            onStatsUpdate={fetchStats}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}