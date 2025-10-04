"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Download, Trash2 } from "lucide-react"

interface HistorySectionProps {
  onViewAnalysis: (analysis: any) => void
}

export function HistorySection({ onViewAnalysis }: HistorySectionProps) {
  // Mock data for history
  const history = [
    {
      id: 1,
      fileName: "Contrato_Prestacao_Servicos.pdf",
      date: "2025-01-03",
      abusiveClauses: 2,
      status: "completed",
    },
    {
      id: 2,
      fileName: "Contrato_Locacao_Imovel.pdf",
      date: "2025-01-02",
      abusiveClauses: 1,
      status: "completed",
    },
    {
      id: 3,
      fileName: "Contrato_Trabalho_CLT.pdf",
      date: "2024-12-28",
      abusiveClauses: 0,
      status: "completed",
    },
    {
      id: 4,
      fileName: "Contrato_Compra_Venda.pdf",
      date: "2024-12-25",
      abusiveClauses: 3,
      status: "completed",
    },
  ]

  const handleView = (item: any) => {
    // In a real app, this would fetch the full analysis
    onViewAnalysis({
      id: item.id,
      fileName: item.fileName,
      date: item.date,
      abusiveClauses: [],
      suggestions: [],
      laws: [],
    })
  }

  const handleDownload = (id: number) => {
    console.log("Downloading analysis:", id)
    alert("Download iniciado! (funcionalidade de demonstração)")
  }

  const handleDelete = (id: number) => {
    console.log("Deleting analysis:", id)
    alert("Análise excluída! (funcionalidade de demonstração)")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Análises</CardTitle>
        <CardDescription>Todas as suas análises anteriores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-start gap-4 flex-1">
                <FileText className="h-10 w-10 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{item.fileName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={item.abusiveClauses > 0 ? "destructive" : "secondary"}>
                      {item.abusiveClauses} cláusula(s) abusiva(s)
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(item.id)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
