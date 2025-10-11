"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Upload, History, Bell, FileText, AlertTriangle } from "lucide-react"
import { UploadSection } from "@/components/dashboard/upload-section"
import { AnalysisResults } from "@/components/dashboard/analysis-results"
import { HistorySection } from "@/components/dashboard/history-section"
import { AlertsSection } from "@/components/dashboard/alerts-section"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProtectedRoute } from "@/components/protected-route"
import api from "@/lib/axios"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0) // Para forçar refresh do histórico
  const [statsData, setStatsData] = useState({
    totalAnalises: 0,
    totalClausulasAbusivas: 0
  })
  const [contractsData, setContractsData] = useState({
    totalAtivos: 0,
    totalExpirandoEm30Dias: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Buscar estatísticas da API
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      console.log('📊 Buscando estatísticas...')

      // Buscar estatísticas de análises e contratos em paralelo
      const [analysisResponse, contractsResponse] = await Promise.all([
        api.get('/Analysis/stats'),
        api.get('/Contracts/stats')
      ])
      
      console.log('✅ Estatísticas de análises carregadas:', analysisResponse.data)
      console.log('✅ Estatísticas de contratos carregadas:', contractsResponse.data)
      
      setStatsData(analysisResponse.data)
      setContractsData(contractsResponse.data)
      
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

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentAnalysis(analysis)
    setActiveTab("results")
    // Recarregar estatísticas após nova análise
    fetchStats()
    // Forçar refresh do histórico
    setHistoryRefreshKey(prev => prev + 1)
  }

  const stats = [
    {
      title: "Análises Realizadas",
      value: isLoadingStats ? "..." : statsData.totalAnalises.toString(),
      icon: FileText,
      description: "Este mês",
    },
    {
      title: "Cláusulas Abusivas",
      value: isLoadingStats ? "..." : statsData.totalClausulasAbusivas.toString(),
      icon: AlertTriangle,
      description: "Identificadas",
    },
    {
      title: "Contratos Ativos",
      value: isLoadingStats ? "..." : contractsData.totalAtivos.toString(),
      icon: Shield,
      description: "Com alertas",
    },
    {
      title: "Próximos Vencimentos",
      value: isLoadingStats ? "..." : contractsData.totalExpirandoEm30Dias.toString(),
      icon: Bell,
      description: "Nos próximos 30 dias",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Acompanhamento de Contratos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <UploadSection 
              onAnalysisComplete={handleAnalysisComplete} 
              onStatsUpdate={fetchStats}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <AnalysisResults analysis={currentAnalysis} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <HistorySection 
              key={historyRefreshKey} // Força re-render quando muda
              onViewAnalysis={(analysis) => {
                setCurrentAnalysis(analysis)
                setActiveTab("results") // Vai direto para a aba de resultados
              }}
              onStatsUpdate={fetchStats} // Callback para atualizar estatísticas
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertsSection onStatsUpdate={fetchStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ProtectedRoute>
  )
}
