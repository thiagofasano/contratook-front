"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Eye, Download, Trash2, Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { getApiErrorMessage } from "@/lib/error-utils"

// Interface para a resposta da API de histórico
interface AnalysisHistoryItem {
  id: number
  userId: number
  fileName: string
  summary: string
  abusiveClauses: string
  improvements: string
  legalRefs: string
  createdAt: string
  user: any
  guid: string
}

interface HistorySectionProps {
  onViewAnalysis: (analysis: any) => void
  onStatsUpdate?: () => Promise<void>
}

export function HistorySection({ onViewAnalysis, onStatsUpdate }: HistorySectionProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  
  // Estados para o modal de confirmação de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [analysisToDelete, setAnalysisToDelete] = useState<AnalysisHistoryItem | null>(null)
  
  // Estados para o modal de visualização de análise
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [analysisToView, setAnalysisToView] = useState<any | null>(null)

  // Buscar histórico de análises
  const fetchHistory = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      console.log('📋 Buscando histórico de análises...')

      const response = await api.get<AnalysisHistoryItem[]>('/analysis')
      
      console.log('✅ Histórico carregado:', response.data)
      
      setHistory(response.data)
      
      if (showRefreshIndicator) {
        toast({
          title: "✅ Histórico atualizado",
          description: `${response.data.length} análise(s) encontrada(s)`,
        })
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar histórico:', error)
      
      const { title, message } = getApiErrorMessage(error)
      
      toast({
        variant: "destructive",
        title: title || "❌ Erro ao carregar histórico",
        description: message || "Não foi possível carregar o histórico de análises.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Carregar histórico ao montar o componente
  useEffect(() => {
    fetchHistory()
  }, [])

  // Contar cláusulas abusivas (string separada por \n)
  const countAbusiveClauses = (abusiveClauses: string): number => {
    if (!abusiveClauses || abusiveClauses.trim() === '') return 0
    return abusiveClauses.split('\n').filter(clause => clause.trim() !== '').length
  }

  const handleView = (item: AnalysisHistoryItem) => {
    // Transformar dados da API para o formato esperado pelo modal
    const analysisData = {
      id: item.id,
      fileName: item.fileName,
      date: item.createdAt,
      summary: item.summary,
      guid: item.guid, // Incluir GUID para download
      abusiveClauses: item.abusiveClauses.split('\n').filter(clause => clause.trim() !== '').map((clause, index) => ({
        id: index + 1,
        clause: `Cláusula Abusiva ${index + 1}`,
        description: clause.trim(),
        severity: index < 2 ? "high" : index < 4 ? "medium" : "low",
        law: "Legislação aplicável",
      })),
      suggestions: item.improvements.split('\n').filter(improvement => improvement.trim() !== '').map((improvement, index) => ({
        id: index + 1,
        title: `Melhoria ${index + 1}`,
        description: improvement.trim(),
        priority: index < 2 ? "high" : index < 4 ? "medium" : "low",
      })),
      laws: item.legalRefs.split('\n').filter(law => law.trim() !== '').map((law, index) => ({
        id: index + 1,
        title: law.trim(),
        articles: [],
        relevance: "Aplicável ao contrato analisado",
      })),
    }

    // Abrir modal com os dados da análise
    setAnalysisToView(analysisData)
    setIsViewModalOpen(true)
  }

  const handleRefresh = () => {
    fetchHistory(true)
  }

  const handleDownload = async (item: AnalysisHistoryItem) => {
    try {
      console.log('📥 Iniciando download da análise:', item.fileName, 'GUID:', item.guid)
      
      toast({
        title: "📥 Preparando download...",
        description: `Baixando análise de "${item.fileName}"`,
      })

      // Chamar endpoint de download
      const response = await api.get(`/analysis/${item.guid}/download`, {
        responseType: 'blob', // Importante para download de arquivos
      })

      console.log('✅ Download concluído, criando arquivo...')

      // Criar blob e URL para download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Criar link temporário para download automático
      const link = document.createElement('a')
      link.href = url
      link.download = `analise_${item.fileName.replace('.pdf', '')}_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpar URL do blob
      window.URL.revokeObjectURL(url)

      toast({
        title: "✅ Download concluído!",
        description: `Análise de "${item.fileName}" baixada com sucesso!`,
      })

    } catch (error: any) {
      console.error('❌ Erro ao baixar análise:', error)
      
      const { title, message } = getApiErrorMessage(error)
      
      toast({
        variant: "destructive",
        title: title || "❌ Erro no download",
        description: message || "Não foi possível baixar a análise.",
        duration: 5000,
      })
    }
  }

  const handleDeleteClick = (analysisId: number) => {
    const analysis = history.find(item => item.id === analysisId)
    if (analysis) {
      setAnalysisToDelete(analysis)
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!analysisToDelete) return

    try {
      // Adicionar ao conjunto de IDs sendo excluídos
      setDeletingIds(prev => new Set(prev).add(analysisToDelete.id))

      console.log('🗑️ Excluindo análise:', { id: analysisToDelete.id, guid: analysisToDelete.guid })

      // Chamar endpoint de exclusão
      await api.delete(`/analysis/${analysisToDelete.guid}`)

      console.log('✅ Análise excluída com sucesso')

      // Mostrar toast de sucesso
      toast({
        title: "✅ Análise excluída",
        description: `Análise "${analysisToDelete.fileName}" foi excluída com sucesso.`,
      })

      // Atualizar a lista removendo o item excluído
      setHistory(prev => prev.filter(item => item.id !== analysisToDelete.id))

      // Atualizar estatísticas no dashboard
      if (onStatsUpdate) {
        console.log('📊 Atualizando estatísticas após exclusão...')
        onStatsUpdate()
      }

      // Fechar modal
      setIsDeleteModalOpen(false)
      setAnalysisToDelete(null)

    } catch (error: any) {
      console.error('❌ Erro ao excluir análise:', error)
      
      const { title, message } = getApiErrorMessage(error)
      
      toast({
        variant: "destructive",
        title: title || "❌ Erro ao excluir análise",
        description: message || "Não foi possível excluir a análise.",
        duration: 5000,
      })
    } finally {
      // Remover do conjunto de IDs sendo excluídos
      if (analysisToDelete) {
        setDeletingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(analysisToDelete.id)
          return newSet
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Análises</CardTitle>
            <CardDescription>Todas as suas análises anteriores</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma análise encontrada</p>
            <p className="text-sm text-muted-foreground">Faça upload de um contrato para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const abusiveClausesCount = countAbusiveClauses(item.abusiveClauses)
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-10 w-10 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{item.fileName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={abusiveClausesCount > 0 ? "destructive" : "secondary"}>
                          {abusiveClausesCount} cláusula(s) abusiva(s)
                        </Badge>
                        {item.summary && (
                          <Badge variant="outline">
                            Resumo disponível
                          </Badge>
                        )}
                      </div>
                      {item.summary && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.summary.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleView(item)}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      title="Visualizar análise"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload(item)}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      title="Baixar análise"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteClick(item.id)}
                      disabled={deletingIds.has(item.id)}
                      className="cursor-pointer hover:scale-105 transition-transform disabled:cursor-not-allowed disabled:opacity-50"
                      title={deletingIds.has(item.id) ? "Excluindo análise..." : "Excluir análise"}
                    >
                      {deletingIds.has(item.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Modal de Visualização de Análise */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise do Contrato</DialogTitle>
            <DialogDescription>
              Detalhes completos da análise realizada
            </DialogDescription>
          </DialogHeader>
          {analysisToView && (
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">📄 Informações do Arquivo</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">{analysisToView.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    Analisado em: {new Date(analysisToView.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Resumo */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">📋 Resumo da Análise</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{analysisToView.summary}</p>
                </div>
              </div>

              {/* Cláusulas Abusivas */}
              {analysisToView.abusiveClauses && analysisToView.abusiveClauses.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-600">⚠️ Cláusulas Abusivas Identificadas ({analysisToView.abusiveClauses.length})</h3>
                  <div className="space-y-3">
                    {analysisToView.abusiveClauses.map((clause: any) => (
                      <div key={clause.id} className="border border-red-200 bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={clause.severity === 'high' ? 'destructive' : clause.severity === 'medium' ? 'default' : 'secondary'}>
                            {clause.severity === 'high' ? 'Alto Risco' : clause.severity === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{clause.clause}</p>
                        <p className="text-sm mt-1">{clause.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{clause.law}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões de Melhoria */}
              {analysisToView.suggestions && analysisToView.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-blue-600">💡 Sugestões de Melhoria ({analysisToView.suggestions.length})</h3>
                  <div className="space-y-3">
                    {analysisToView.suggestions.map((suggestion: any) => (
                      <div key={suggestion.id} className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={suggestion.priority === 'high' ? 'default' : 'secondary'}>
                            {suggestion.priority === 'high' ? 'Alta Prioridade' : suggestion.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{suggestion.title}</p>
                        <p className="text-sm mt-1">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referências Legais */}
              {analysisToView.laws && analysisToView.laws.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-600">⚖️ Referências Legais ({analysisToView.laws.length})</h3>
                  <div className="space-y-2">
                    {analysisToView.laws.map((law: any) => (
                      <div key={law.id} className="border border-green-200 bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-sm">{law.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{law.relevance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewModalOpen(false)
                setAnalysisToView(null)
              }}
            >
              Fechar
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {analysisToDelete && (
            <div className="py-4">
              <div className="space-y-2">
                <p className="font-medium">Arquivo: {analysisToDelete.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Criado em: {new Date(analysisToDelete.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteModalOpen(false)
                setAnalysisToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={analysisToDelete ? deletingIds.has(analysisToDelete.id) : false}
            >
              {analysisToDelete && deletingIds.has(analysisToDelete.id) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
