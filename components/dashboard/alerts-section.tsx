"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, FileText, X } from "lucide-react"

export function AlertsSection() {
  // Mock data for alerts
  const alerts = [
    {
      id: 1,
      type: "expiring",
      title: "Contrato de Locação",
      description: "Vence em 15 dias",
      date: "2025-01-19",
      priority: "high",
    },
    {
      id: 2,
      type: "expiring",
      title: "Contrato de Prestação de Serviços",
      description: "Vence em 28 dias",
      date: "2025-02-01",
      priority: "medium",
    },
    {
      id: 3,
      type: "expiring",
      title: "Contrato de Fornecimento",
      description: "Vence em 45 dias",
      date: "2025-02-18",
      priority: "low",
    },
  ]

  const handleDismiss = (id: number) => {
    console.log("Dismissing alert:", id)
    alert("Alerta dispensado! (funcionalidade de demonstração)")
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Urgente"
      case "medium":
        return "Atenção"
      case "low":
        return "Informativo"
      default:
        return "Normal"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Alertas de Vencimento</CardTitle>
          </div>
          <CardDescription>Contratos que estão próximos do vencimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      alert.priority === "high"
                        ? "bg-destructive/10"
                        : alert.priority === "medium"
                          ? "bg-primary/10"
                          : "bg-muted"
                    }`}
                  >
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant={getPriorityColor(alert.priority)}>{getPriorityLabel(alert.priority)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Vencimento:{" "}
                        {new Date(alert.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Contrato
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDismiss(alert.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Alertas</CardTitle>
          <CardDescription>Personalize quando você deseja receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas por E-mail</p>
              <p className="text-sm text-muted-foreground">Receba notificações no seu e-mail</p>
            </div>
            <Button variant="outline">Configurar</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Antecedência de Alerta</p>
              <p className="text-sm text-muted-foreground">Atualmente: 30 dias antes do vencimento</p>
            </div>
            <Button variant="outline">Alterar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
