"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2 } from "lucide-react"

interface UploadSectionProps {
  onAnalysisComplete: (analysis: any) => void
}

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
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

    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        id: Date.now(),
        fileName: file.name,
        date: new Date().toISOString(),
        abusiveClauses: [
          {
            id: 1,
            clause: "Cláusula 5.2 - Foro de Eleição",
            description:
              "O contrato estabelece foro exclusivo em comarca distante da residência do consumidor, dificultando o acesso à justiça.",
            severity: "high",
            law: "Art. 51, IV do CDC - Código de Defesa do Consumidor",
          },
          {
            id: 2,
            clause: "Cláusula 8.1 - Multa Rescisória",
            description: "Multa rescisória de 40% é considerada abusiva por ser desproporcional.",
            severity: "medium",
            law: "Art. 51, IV do CDC - Cláusulas que estabeleçam obrigações iníquas",
          },
        ],
        suggestions: [
          {
            id: 1,
            title: "Incluir Cláusula de Confidencialidade",
            description: "Recomenda-se adicionar cláusula específica sobre tratamento de dados pessoais conforme LGPD.",
            priority: "high",
          },
          {
            id: 2,
            title: "Definir Prazo de Vigência",
            description: "Estabelecer prazo determinado para vigência do contrato com possibilidade de renovação.",
            priority: "medium",
          },
          {
            id: 3,
            title: "Especificar Forma de Pagamento",
            description: "Detalhar condições, prazos e formas de pagamento de forma mais clara.",
            priority: "low",
          },
        ],
        laws: [
          {
            id: 1,
            title: "Lei nº 8.078/1990 - Código de Defesa do Consumidor",
            articles: ["Art. 51, IV", "Art. 51, XV"],
            relevance: "Aplicável às cláusulas abusivas identificadas",
          },
          {
            id: 2,
            title: "Lei nº 13.709/2018 - LGPD",
            articles: ["Art. 7º", "Art. 8º"],
            relevance: "Necessário para tratamento de dados pessoais",
          },
          {
            id: 3,
            title: "Lei nº 10.406/2002 - Código Civil",
            articles: ["Art. 421", "Art. 422"],
            relevance: "Princípios gerais de contratos",
          },
        ],
      }

      setIsAnalyzing(false)
      onAnalysisComplete(mockAnalysis)
    }, 3000)
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
              <Button variant="outline" onClick={() => setFile(null)}>
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
              <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, DOC, DOCX (máx. 10MB)</p>
            </div>
          )}
        </div>

        {file && (
          <Button className="w-full" size="lg" onClick={handleAnalyze} disabled={isAnalyzing}>
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
