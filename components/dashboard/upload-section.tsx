"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { getAnalysisErrorMessage } from "@/lib/error-utils"

// Interface para a resposta da API de análise
interface AnalysisResponse {
  resumo: string
  pontosAtencao: string[]
  sugestoes: string[]
  leis: string[]
  guid?: string // GUID da análise para download
}

interface UploadSectionProps {
  onAnalysisComplete: (analysis: any) => void
  onStatsUpdate?: () => Promise<void>
}

export function UploadSection({ onAnalysisComplete, onStatsUpdate }: UploadSectionProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

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
        guid: response.data.guid, // Incluir GUID para download
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Contrato</CardTitle>
        <CardDescription>Faça upload do contrato para análise por IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  )
}
