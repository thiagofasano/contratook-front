"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Bell, Calendar, FileText, X, Loader2, RefreshCw, Upload, Plus, ChevronDown, ChevronUp, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import api from "@/lib/axios"

// Interface para contratos da API
interface Contract {
  id: number
  userId: number
  title: string
  fileUrl: string
  expirationDate: string
  createdAt: string
  active: boolean
  guid: string
}

interface AlertsSectionProps {
  onStatsUpdate?: () => Promise<void>
}

export function AlertsSection({ onStatsUpdate }: AlertsSectionProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Estados para o modal de configuração de alerta
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [alertTime, setAlertTime] = useState(30) // Valor padrão: 30 dias
  const [tempAlertTime, setTempAlertTime] = useState(30) // Valor temporário no modal
  const [isSavingAlert, setIsSavingAlert] = useState(false)

  // Estados para o modal de configuração de e-mails
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]) // E-mails atuais
  const [tempEmailText, setTempEmailText] = useState('') // Texto temporário no modal
  const [isSavingEmails, setIsSavingEmails] = useState(false)

  // Estados para cadastro de novo contrato
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [contractTitle, setContractTitle] = useState('')
  const [contractExpirationDate, setContractExpirationDate] = useState('')
  const [isCreatingContract, setIsCreatingContract] = useState(false)
  const [isRegistrationExpanded, setIsRegistrationExpanded] = useState(false)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const [isOtherContractsExpanded, setIsOtherContractsExpanded] = useState(false)

  // Buscar contratos da API
  const fetchContracts = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      console.log('📋 Buscando contratos...')

      const response = await api.get<Contract[]>('/contracts')
      
      console.log('✅ Contratos carregados:', response.data)
      
      setContracts(response.data)
      
      if (showRefreshIndicator) {
        const expiringSoon = getExpiringContracts(response.data)
        toast({
          title: "✅ Contratos atualizados",
          description: `${response.data.length} contrato(s) encontrado(s), ${expiringSoon.length} expirando em breve`,
        })
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar contratos:', error)
      
      toast({
        variant: "destructive",
        title: "❌ Erro ao carregar contratos",
        description: "Não foi possível carregar os contratos. Tente novamente.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Filtrar contratos que estão expirando (baseado na configuração do usuário)
  const getExpiringContracts = (contractsList: Contract[] = contracts) => {
    const now = new Date()
    const inAlertDays = new Date()
    inAlertDays.setDate(now.getDate() + alertTime) // Usar o valor configurado

    return contractsList
      .filter(contract => contract.active) // Apenas contratos ativos
      .filter(contract => {
        const expirationDate = new Date(contract.expirationDate)
        return expirationDate >= now && expirationDate <= inAlertDays
      })
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()) // Ordenar por data de expiração
  }

  // Filtrar contratos que NÃO estão expirando (para exibir separadamente)
  const getOtherContracts = (contractsList: Contract[] = contracts) => {
    const now = new Date()
    const inAlertDays = new Date()
    inAlertDays.setDate(now.getDate() + alertTime)

    return contractsList
      .filter(contract => contract.active) // Apenas contratos ativos
      .filter(contract => {
        const expirationDate = new Date(contract.expirationDate)
        return expirationDate > inAlertDays // Contratos que vencem depois do período de alerta
      })
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()) // Ordenar por data de expiração
  }

  // Calcular prioridade baseada nos dias restantes
  const getContractPriority = (expirationDate: string): 'high' | 'medium' | 'low' => {
    const now = new Date()
    const expDate = new Date(expirationDate)
    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft <= 15) return 'high'    // Urgente: 15 dias ou menos
    if (daysLeft <= 30) return 'medium'  // Atenção: 16-30 dias
    return 'low'                         // Informativo: 31+ dias
  }

  // Calcular descrição baseada nos dias restantes
  const getContractDescription = (expirationDate: string): string => {
    const now = new Date()
    const expDate = new Date(expirationDate)
    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return 'Vencido'
    if (daysLeft === 0) return 'Vence hoje'
    if (daysLeft === 1) return 'Vence amanhã'
    return `Vence em ${daysLeft} dias`
  }

  // Carregar contratos ao montar o componente
  useEffect(() => {
    fetchContracts()
  }, [])

  const handleRefresh = () => {
    fetchContracts(true)
  }

  const handleDismiss = (id: number) => {
    console.log("Dismissing alert:", id)
    toast({
      title: "🔕 Alerta dispensado",
      description: "Funcionalidade de dispensar alertas será implementada em breve!",
    })
  }

  const handleViewContract = (contract: Contract) => {
    console.log("Viewing contract:", contract.title, contract.guid)
    toast({
      title: "📄 Visualização de contrato",
      description: "Funcionalidade de visualização será implementada em breve!",
    })
  }

  // Funções para o modal de configuração de alerta
  const handleOpenAlertModal = () => {
    setTempAlertTime(alertTime) // Definir valor atual como temporário
    setIsAlertModalOpen(true)
  }

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false)
    setTempAlertTime(alertTime) // Resetar para valor atual
  }

  const handleSaveAlertTime = async () => {
    if (tempAlertTime <= 0) {
      toast({
        variant: "destructive",
        title: "❌ Valor inválido",
        description: "A antecedência deve ser maior que 0 dias.",
      })
      return
    }

    try {
      setIsSavingAlert(true)
      
      console.log('⚙️ Salvando configuração de alerta:', tempAlertTime)

      // Chamar endpoint de configuração
      await api.put('/Parameterization/alertContractTime', {
        alertContractTime: tempAlertTime
      })

      console.log('✅ Configuração salva com sucesso')

      // Atualizar estado local
      setAlertTime(tempAlertTime)
      
      toast({
        title: "✅ Configuração salva!",
        description: `Alertas serão exibidos ${tempAlertTime} dias antes do vencimento.`,
      })

      setIsAlertModalOpen(false)
      
      // Recarregar contratos para aplicar nova configuração
      fetchContracts(true)

    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error)
      
      toast({
        variant: "destructive",
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar a configuração. Tente novamente.",
      })
    } finally {
      setIsSavingAlert(false)
    }
  }

  // Funções para o modal de configuração de e-mails
  const handleOpenEmailModal = () => {
    setTempEmailText(emailRecipients.join(', ')) // Converter array para string separada por vírgulas
    setIsEmailModalOpen(true)
  }

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false)
    setTempEmailText(emailRecipients.join(', ')) // Resetar para valor atual
  }

  // Validar formato de e-mail
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const handleSaveEmails = async () => {
    // Processar string de e-mails separados por vírgula
    const emailList = tempEmailText
      .split(',')
      .map(email => email.trim())
      .filter(email => email !== '') // Remover strings vazias

    // Validar todos os e-mails
    const invalidEmails = emailList.filter(email => !isValidEmail(email))
    if (invalidEmails.length > 0) {
      toast({
        variant: "destructive",
        title: "❌ E-mails inválidos",
        description: `Os seguintes e-mails são inválidos: ${invalidEmails.join(', ')}`,
      })
      return
    }

    try {
      setIsSavingEmails(true)
      
      console.log('📧 Salvando configuração de e-mails:', emailList)

      // Chamar endpoint de configuração
      await api.put('/Parameterization/alertContractTimeRecipients', {
        emails: emailList
      })

      console.log('✅ E-mails salvos com sucesso')

      // Atualizar estado local
      setEmailRecipients(emailList)
      
      toast({
        title: "✅ E-mails configurados!",
        description: `${emailList.length} e-mail(s) configurado(s) para receber alertas.`,
      })

      setIsEmailModalOpen(false)

    } catch (error) {
      console.error('❌ Erro ao salvar e-mails:', error)
      
      toast({
        variant: "destructive",
        title: "❌ Erro ao salvar e-mails",
        description: "Não foi possível salvar a configuração de e-mails. Tente novamente.",
      })
    } finally {
      setIsSavingEmails(false)
    }
  }

  // Funções para cadastro de novo contrato
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0])
    }
  }

  const handleCreateContract = async () => {
    // Validações
    if (!contractFile) {
      toast({
        variant: "destructive",
        title: "❌ Arquivo obrigatório",
        description: "Selecione um arquivo de contrato para cadastrar.",
      })
      return
    }

    if (!contractTitle.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Título obrigatório",
        description: "Digite um título para o contrato.",
      })
      return
    }

    if (!contractExpirationDate) {
      toast({
        variant: "destructive",
        title: "❌ Data de expiração obrigatória",
        description: "Selecione a data de expiração do contrato.",
      })
      return
    }

    try {
      setIsCreatingContract(true)

      console.log('📄 Criando novo contrato:', {
        title: contractTitle,
        file: contractFile.name,
        expirationDate: contractExpirationDate
      })

      // Criar FormData para envio multipart
      const formData = new FormData()
      formData.append('file', contractFile)
      formData.append('title', contractTitle)
      
      // Adicionar hora zerada à data (00:00:00) para o formato esperado pela API
      const dateWithTime = contractExpirationDate + 'T00:00:00'
      formData.append('expirationDate', dateWithTime)

      // Chamar endpoint de criação
      await api.post('/contracts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('✅ Contrato criado com sucesso')

      toast({
        title: "✅ Contrato cadastrado!",
        description: `Contrato "${contractTitle}" foi cadastrado com sucesso.`,
      })

      // Limpar formulário
      setContractFile(null)
      setContractTitle('')
      setContractExpirationDate('')

      // Recarregar lista de contratos
      fetchContracts(true)

      // Atualizar estatísticas no dashboard
      if (onStatsUpdate) {
        console.log('📊 Atualizando estatísticas após cadastro de contrato...')
        onStatsUpdate()
      }

    } catch (error) {
      console.error('❌ Erro ao criar contrato:', error)
      
      toast({
        variant: "destructive",
        title: "❌ Erro ao cadastrar contrato",
        description: "Não foi possível cadastrar o contrato. Tente novamente.",
      })
    } finally {
      setIsCreatingContract(false)
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

  const expiringContracts = getExpiringContracts()
  const otherContracts = getOtherContracts()

  // Componente para renderizar um contrato
  const ContractCard = ({ contract, isExpiring = true }: { contract: Contract; isExpiring?: boolean }) => {
    const priority = getContractPriority(contract.expirationDate)
    const description = getContractDescription(contract.expirationDate)
    
    return (
      <div 
        key={contract.id} 
        className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
          isExpiring 
            ? "border-border hover:bg-accent/50" 
            : "border-muted bg-muted/30 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`p-2 rounded-lg ${
              isExpiring 
                ? priority === "high"
                  ? "bg-destructive/10"
                  : priority === "medium"
                    ? "bg-primary/10"
                    : "bg-muted"
                : "bg-muted"
            }`}
          >
            <Calendar className={`h-6 w-6 ${
              isExpiring 
                ? priority === "high"
                  ? "text-destructive"
                  : priority === "medium"
                    ? "text-primary"
                    : "text-muted-foreground"
                : "text-muted-foreground"
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-semibold ${!isExpiring ? "text-muted-foreground" : ""}`}>
                {contract.title}
              </h4>
              {isExpiring && (
                <Badge variant={getPriorityColor(priority)}>
                  {getPriorityLabel(priority)}
                </Badge>
              )}
              {!isExpiring && (
                <Badge variant="outline" className="text-muted-foreground">
                  Em dia
                </Badge>
              )}
            </div>
            <p className={`text-sm mb-2 ${!isExpiring ? "text-muted-foreground" : "text-muted-foreground"}`}>
              {description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Vencimento:{" "}
                {new Date(contract.expirationDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isExpiring ? "outline" : "ghost"}
            size="sm"
            onClick={() => handleViewContract(contract)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver Contrato
          </Button>
          {isExpiring && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDismiss(contract.id)}
              className="cursor-pointer hover:scale-105 transition-transform"
              title="Dispensar alerta"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Alertas de Vencimento</CardTitle>
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
          <CardDescription>
            Contratos que estão próximos do vencimento (próximos {alertTime} dias)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando contratos...</span>
            </div>
          ) : expiringContracts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum contrato expirando em breve</p>
              <p className="text-sm text-muted-foreground">Todos os seus contratos estão em dia! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiringContracts.map((contract) => (
                <ContractCard key={contract.id} contract={contract} isExpiring={true} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção para Outros Contratos */}
      {!isLoading && otherContracts.length > 0 && (
        <Card>
          <Collapsible open={isOtherContractsExpanded} onOpenChange={setIsOtherContractsExpanded}>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-muted-foreground">Outros Contratos</CardTitle>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      isOtherContractsExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </CollapsibleTrigger>
              <CardDescription>
                Contratos cadastrados que não estão próximos do vencimento ({otherContracts.length} contrato{otherContracts.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {otherContracts.map((contract) => (
                    <ContractCard key={contract.id} contract={contract} isExpiring={false} />
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      
      {/* Cadastro de Novo Contrato */}
      <Card>
        <Collapsible open={isRegistrationExpanded} onOpenChange={setIsRegistrationExpanded}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                <div className="flex items-center gap-2">
                  <CardTitle>Cadastrar Contrato para Acompanhamento</CardTitle>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    isRegistrationExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </CollapsibleTrigger>
            <CardDescription>
              Adicione um novo contrato para receber alertas de vencimento
            </CardDescription>
          </CardHeader>
          <CollapsibleContent>
            <br /> 
            <CardContent className="space-y-4 pt-0">
            <div className="grid gap-4">
            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <Label htmlFor="contractFile">Arquivo do Contrato</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="contractFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {contractFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{contractFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setContractFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, DOC, DOCX (máx. 10MB)
              </p>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="contractTitle">Título do Contrato</Label>
              <Input
                id="contractTitle"
                type="text"
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
                placeholder="Ex: Contrato de Prestação de Serviços"
                className="w-full"
              />
            </div>

            {/* Data de Expiração */}
            <div className="space-y-2">
              <Label htmlFor="contractExpirationDate">Data de Expiração</Label>
              <Input
                id="contractExpirationDate"
                type="date"
                value={contractExpirationDate}
                onChange={(e) => setContractExpirationDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Data em que o contrato expira
              </p>
            </div>

            {/* Botão de Cadastrar */}
            <Button
              onClick={handleCreateContract}
              disabled={isCreatingContract}
              className="w-full cursor-pointer hover:scale-105 transition-transform"
              size="lg"
            >
              {isCreatingContract ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cadastrando contrato...
                </>
              ) : (
                <>
                  Cadastrar Contrato
                </>
              )}
            </Button>
          </div>
          </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Settings Card */}
      <Card>
        <Collapsible open={isSettingsExpanded} onOpenChange={setIsSettingsExpanded}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Configurações de Alertas</CardTitle>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    isSettingsExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </CollapsibleTrigger>
            <CardDescription>Personalize quando você deseja receber notificações</CardDescription>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <br />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas por E-mail</p>
              <p className="text-sm text-muted-foreground">
                {emailRecipients.length > 0 
                  ? `${emailRecipients.length} e-mail(s) configurado(s)` 
                  : 'Nenhum e-mail configurado'
                }
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleOpenEmailModal}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              Configurar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Antecedência de Alerta</p>
              <p className="text-sm text-muted-foreground">Atualmente: {alertTime} dias antes do vencimento</p>
            </div>
            <Button 
              variant="outline"
              onClick={handleOpenAlertModal}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              Alterar
            </Button>
          </div>
          </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>


      {/* Modal de Configuração de Alerta */}
      <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurar Antecedência de Alerta</DialogTitle>
            <DialogDescription>
              Define quantos dias antes do vencimento você deseja receber alertas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alertTime" className="text-right">
                Tempo (dias)
              </Label>
              <Input
                id="alertTime"
                type="number"
                min="1"
                max="365"
                value={tempAlertTime}
                onChange={(e) => setTempAlertTime(parseInt(e.target.value) || 1)}
                className="col-span-3"
                placeholder="Ex: 30"
              />
            </div>
            <div className="text-sm text-muted-foreground px-4">
              <p>• Valor mínimo: 1 dia</p>
              <p>• Valor máximo: 365 dias (1 ano)</p>
              <p>• Recomendado: 30 dias</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseAlertModal}
              disabled={isSavingAlert}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAlertTime}
              disabled={isSavingAlert}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              {isSavingAlert ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração de E-mails */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Alertas por E-mail</DialogTitle>
            <DialogDescription>
              Digite os e-mails que devem receber notificações de vencimento de contratos, separados por vírgula.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="emailList">
                E-mails para Notificação
              </Label>
              <Input
                id="emailList"
                type="text"
                value={tempEmailText}
                onChange={(e) => setTempEmailText(e.target.value)}
                placeholder="email1@exemplo.com, email2@exemplo.com, email3@exemplo.com"
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Separar por vírgula:</strong> email1@exemplo.com, email2@exemplo.com</p>
              <p>• <strong>Formato válido:</strong> nome@dominio.com</p>
              <p>• <strong>Sem limite:</strong> Adicione quantos e-mails precisar</p>
              {emailRecipients.length > 0 && (
                <p>• <strong>Atual:</strong> {emailRecipients.length} e-mail(s) configurado(s)</p>
              )}
            </div>
            {tempEmailText && (
              <div className="border rounded-lg p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">Preview dos e-mails:</p>
                <div className="flex flex-wrap gap-1">
                  {tempEmailText.split(',').map((email, index) => {
                    const trimmedEmail = email.trim()
                    const isValid = trimmedEmail && isValidEmail(trimmedEmail)
                    return trimmedEmail ? (
                      <Badge 
                        key={index} 
                        variant={isValid ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {trimmedEmail}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseEmailModal}
              disabled={isSavingEmails}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEmails}
              disabled={isSavingEmails}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              {isSavingEmails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar E-mails"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
