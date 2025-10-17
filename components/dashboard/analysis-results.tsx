"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, AlertTriangle, Lightbulb, Scale, FileText, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"

interface AnalysisResultsProps {
  analysis: any
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Nenhuma análise disponível</p>
          <p className="text-sm text-muted-foreground">Faça upload de um contrato para começar ou acesse a aba histórico para ver análises anteriores.</p>
        </CardContent>
      </Card>
    )
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      // Verificar se temos o GUID da análise
      if (!analysis.AnalysisGuid) {
        toast({
          variant: "destructive",
          title: "❌ Erro no download",
          description: "GUID da análise não encontrado.",
        })
        return
      }

      console.log('📥 Iniciando download da análise:', { id: analysis.id, guid: analysis.AnalysisGuid })

      // Chamar endpoint de download
      const response = await api.get(`/analysis/${analysis.AnalysisGuid}/download`, {
        responseType: 'blob',
      })

      console.log('✅ Download concluído')

      // Criar URL do blob para download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Criar link temporário para download
      const link = document.createElement('a')
      link.href = url
      link.download = `analise-${analysis.fileName || 'contrato'}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Limpar recursos
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "✅ Download concluído",
        description: `Análise "${analysis.fileName || 'contrato'}" baixada com sucesso!`,
      })

    } catch (error) {
      console.error('❌ Erro ao baixar análise:', error)
      
      toast({
        variant: "destructive",
        title: "❌ Erro no download",
        description: "Não foi possível baixar a análise. Tente novamente.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Download */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Análise Completa</CardTitle>
              <CardDescription>
                {analysis.fileName} - {new Date(analysis.date).toLocaleDateString("pt-BR")}
              </CardDescription>
            </div>
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="cursor-pointer hover:scale-105 transition-transform disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Relatório
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Abusive Clauses */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Cláusulas Abusivas Identificadas</CardTitle>
          </div>
          <CardDescription>
            {analysis.abusiveClauses.length} cláusula(s) que podem ser consideradas abusivas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.abusiveClauses.map((clause: any) => (
            <div key={clause.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold">{clause.clause}</h4>
                <Badge variant={getSeverityColor(clause.severity)}>
                  {clause.severity === "high" ? "Alta" : clause.severity === "medium" ? "Média" : "Baixa"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{clause.description}</p>
              <div className="flex items-start gap-2 bg-muted p-3 rounded-md">
                <Scale className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">{clause.law}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Sugestões de Melhoria</CardTitle>
          </div>
          <CardDescription>Recomendações para aprimorar o contrato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.suggestions.map((suggestion: any) => (
            <div key={suggestion.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-semibold">{suggestion.title}</h4>
                <Badge variant={getPriorityColor(suggestion.priority)}>
                  {suggestion.priority === "high" ? "Alta" : suggestion.priority === "medium" ? "Média" : "Baixa"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legal References */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Referências Legais</CardTitle>
          </div>
          <CardDescription>Leis e artigos aplicáveis ao contrato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.laws.map((law: any) => (
            <div key={law.id} className="space-y-2">
              <h4 className="font-semibold">{law.title}</h4>
              <div className="flex flex-wrap gap-2">
                {law.articles.map((article: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {article}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{law.relevance}</p>
              {law.id !== analysis.laws[analysis.laws.length - 1].id && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
