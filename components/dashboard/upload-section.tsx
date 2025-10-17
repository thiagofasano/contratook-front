"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2, Type, FilePlus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import api from "@/lib/axios"
import { getAnalysisErrorMessage } from "@/lib/error-utils"

// Interface para a resposta da API de análise
interface AnalysisResponse {
  resumo: string
  pontosAtencao: string[]
  sugestoes: string[]
  leis: string[]
  analysisGuid?: string // GUID da análise para download
}

interface UploadSectionProps {
  onAnalysisComplete: (analysis: any) => void
  onStatsUpdate?: () => Promise<void>
}

export function UploadSection({ onAnalysisComplete, onStatsUpdate }: UploadSectionProps) {
  const router = useRouter()
  const { checkAuth } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // Estados para análise por texto
  const [contractText, setContractText] = useState("")
  const [contractTitle, setContractTitle] = useState("")
  const [textErrors, setTextErrors] = useState<Record<string, string>>({})

  // Função para limpar todos os campos
  const clearAllFields = () => {
    setFile(null)
    setContractText("")
    setContractTitle("")
    setTextErrors({})
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)

    try {
      // Criar FormData para envio multipart
      const formData = new FormData()
      formData.append('file', file)

      console.log('📤 Enviando arquivo para análise:', file.name)

      // Chamar endpoint de análise
      const response = await api.post<AnalysisResponse>('/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('✅ Análise recebida:', response.data)

      // Transformar resposta da API para o formato esperado pelo componente
      const analysisData = {
        id: Date.now(),
        fileName: file.name,
        date: new Date().toISOString(),
        summary: response.data.resumo,
        analysisGuid: response.data.analysisGuid, // Incluir GUID para download
        abusiveClauses: response.data.pontosAtencao.map((ponto, index) => ({
          id: index + 1,
          clause: `Ponto de Atenção ${index + 1}`,
          description: ponto,
          severity: index < 2 ? "high" : index < 4 ? "medium" : "low", // Distribuir severidade
          law: response.data.leis[index % response.data.leis.length] || "Legislação aplicável",
        })),
        suggestions: response.data.sugestoes.map((sugestao, index) => ({
          id: index + 1,
          title: `Sugestão ${index + 1}`,
          description: sugestao,
          priority: index < 2 ? "high" : index < 4 ? "medium" : "low", // Distribuir prioridade
        })),
        laws: response.data.leis.map((lei, index) => ({
          id: index + 1,
          title: lei,
          articles: [], // API não retorna artigos específicos
          relevance: "Aplicável ao contrato analisado",
        })),
      }

      toast({
        title: "✅ Análise concluída",
        description: `Contrato "${file.name}" analisado com sucesso!`,
      })

      onAnalysisComplete(analysisData)
      
      // Atualizar estatísticas no dashboard
      if (onStatsUpdate) {
        console.log('📊 Atualizando estatísticas após nova análise...')
        onStatsUpdate()
      }

      // Atualizar dados do usuário para refletir o novo uso mensal
      console.log('🔄 Atualizando dados do usuário após análise...')
      await checkAuth()
    } catch (error: any) {
      console.error('❌ Erro ao analisar contrato:', error)
      
      // Usar função utilitária para extrair erro específico de análise
      const { title, message } = getAnalysisErrorMessage(error)
      
      // Verificar se é erro de limite mensal atingido
      if (message.includes("Limite mensal de análises atingido")) {
        toast({
          variant: "destructive",
          title: "⚠️ Limite atingido",
          description: "Você atingiu o limite do plano gratuito. Redirecionando para upgrade...",
          duration: 3000,
        })
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/planos')
        }, 2000)
        
        return
      }
      
      toast({
        variant: "destructive",
        title,
        description: message,
        duration: 6000, // Mostrar por mais tempo para erros
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const validateTextForm = () => {
    const newErrors: Record<string, string> = {}

    if (!contractTitle.trim()) {
      newErrors.title = "Título é obrigatório"
    } else if (contractTitle.length > 200) {
      newErrors.title = "Título deve ter no máximo 200 caracteres"
    }

    if (!contractText.trim()) {
      newErrors.text = "Texto do contrato é obrigatório"
    } else if (contractText.length < 50) {
      newErrors.text = "Texto deve ter pelo menos 50 caracteres"
    }

    setTextErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAnalyzeText = async () => {
    if (!validateTextForm()) return

    setIsAnalyzing(true)

    try {
      console.log('📤 Enviando texto para análise:', contractTitle)

      // Chamar endpoint de análise por texto
      const response = await api.post<AnalysisResponse>('/analysis/analyze-text', {
        ContractText: contractText,
        ContractTitle: contractTitle
      })

      console.log('✅ Análise recebida:', response.data)

      // Transformar resposta da API para o formato esperado pelo componente
      const analysisData = {
        id: Date.now(),
        fileName: contractTitle,
        date: new Date().toISOString(),
        summary: response.data.resumo,
        analysisGuid: response.data.analysisGuid, // Incluir GUID para download
        abusiveClauses: response.data.pontosAtencao.map((ponto, index) => ({
          id: index + 1,
          clause: `Ponto de Atenção ${index + 1}`,
          description: ponto,
          severity: index < 2 ? "high" : index < 4 ? "medium" : "low", // Distribuir severidade
          law: response.data.leis[index % response.data.leis.length] || "Legislação aplicável",
        })),
        suggestions: response.data.sugestoes.map((sugestao, index) => ({
          id: index + 1,
          title: `Sugestão ${index + 1}`,
          description: sugestao,
          priority: index < 2 ? "high" : index < 4 ? "medium" : "low", // Distribuir prioridade
        })),
        laws: response.data.leis.map((lei, index) => ({
          id: index + 1,
          title: lei,
          articles: [], // API não retorna artigos específicos
          relevance: "Aplicável ao contrato analisado",
        })),
      }

      toast({
        title: "✅ Análise concluída",
        description: `Contrato "${contractTitle}" analisado com sucesso!`,
      })

      onAnalysisComplete(analysisData)
      
      // Atualizar estatísticas no dashboard
      if (onStatsUpdate) {
        console.log('📊 Atualizando estatísticas após nova análise...')
        onStatsUpdate()
      }

      // Atualizar dados do usuário para refletir o novo uso mensal
      console.log('🔄 Atualizando dados do usuário após análise...')
      await checkAuth()

      // Limpar formulário após sucesso
      setContractText("")
      setContractTitle("")
      setTextErrors({})

    } catch (error: any) {
      console.error('❌ Erro ao analisar contrato por texto:', error)
      
      // Usar função utilitária para extrair erro específico de análise
      const { title, message } = getAnalysisErrorMessage(error)
      
      // Verificar se é erro de limite mensal atingido
      if (message.includes("Limite mensal de análises atingido")) {
        toast({
          variant: "destructive",
          title: "⚠️ Limite atingido",
          description: "Você atingiu o limite do plano gratuito. Redirecionando para upgrade...",
          duration: 3000,
        })
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/planos')
        }, 2000)
        
        return
      }
      
      toast({
        variant: "destructive",
        title,
        description: message,
        duration: 6000, // Mostrar por mais tempo para erros
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Contrato</CardTitle>
        <CardDescription>Escolha como enviar seu contrato para análise por IA</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full" onValueChange={clearAllFields}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FilePlus className="h-4 w-4" />
              Upload de Arquivo
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Colar Texto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button variant="outline" onClick={() => setFile(null)} className="cursor-pointer hover:scale-105 transition-transform">
                    Remover arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">Arraste e solte seu contrato aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()} className="cursor-pointer hover:scale-105 transition-transform">
                    Selecionar Arquivo
                  </Button>
                  <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, e DOCX (máx. 10MB)</p>
                </div>
              )}
            </div>

            {file && (
              <Button className="w-full cursor-pointer hover:scale-105 transition-transform" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando contrato...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Analisar Contrato
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-title">Título do Contrato</Label>
                <Input
                  id="contract-title"
                  placeholder="Ex: Contrato de Prestação de Serviços"
                  value={contractTitle}
                  onChange={(e) => {
                    setContractTitle(e.target.value)
                    if (textErrors.title) {
                      setTextErrors(prev => ({ ...prev, title: "" }))
                    }
                  }}
                  className={textErrors.title ? "border-destructive" : ""}
                  maxLength={200}
                  disabled={isAnalyzing}
                />
                {textErrors.title && (
                  <p className="text-sm text-destructive">{textErrors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {contractTitle.length}/200 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract-text">Texto do Contrato</Label>
                <Textarea
                  id="contract-text"
                  placeholder="Cole aqui o texto completo do contrato que você deseja analisar..."
                  value={contractText}
                  onChange={(e) => {
                    setContractText(e.target.value)
                    if (textErrors.text) {
                      setTextErrors(prev => ({ ...prev, text: "" }))
                    }
                  }}
                  className={`min-h-[200px] resize-none ${textErrors.text ? "border-destructive" : ""}`}
                  disabled={isAnalyzing}
                />
                {textErrors.text && (
                  <p className="text-sm text-destructive">{textErrors.text}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mínimo 50 caracteres • {contractText.length} caracteres digitados
                </p>
              </div>

              <Button 
                className="w-full cursor-pointer hover:scale-105 transition-transform" 
                size="lg" 
                onClick={handleAnalyzeText} 
                disabled={isAnalyzing || !contractTitle.trim() || !contractText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando contrato...
                  </>
                ) : (
                  <>
                    <Type className="mr-2 h-5 w-5" />
                    Analisar Texto
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
