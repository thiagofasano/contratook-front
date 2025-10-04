"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Upload, History, Bell, FileText, AlertTriangle } from "lucide-react"
import { UploadSection } from "@/components/dashboard/upload-section"
import { AnalysisResults } from "@/components/dashboard/analysis-results"
import { HistorySection } from "@/components/dashboard/history-section"
import { AlertsSection } from "@/components/dashboard/alerts-section"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null)

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentAnalysis(analysis)
    setActiveTab("results")
  }

  const stats = [
    {
      title: "Análises Realizadas",
      value: "12",
      icon: FileText,
      description: "Este mês",
    },
    {
      title: "Cláusulas Abusivas",
      value: "8",
      icon: AlertTriangle,
      description: "Identificadas",
    },
    {
      title: "Contratos Ativos",
      value: "5",
      icon: Shield,
      description: "Com alertas",
    },
    {
      title: "Próximos Vencimentos",
      value: "3",
      icon: Bell,
      description: "Nos próximos 30 dias",
    },
  ]

  return (
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
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <UploadSection onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <AnalysisResults analysis={currentAnalysis} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <HistorySection onViewAnalysis={(analysis) => setCurrentAnalysis(analysis)} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
