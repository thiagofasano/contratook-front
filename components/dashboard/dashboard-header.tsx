"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Shield, User, Settings, LogOut, History, Bell, LayoutDashboard, CreditCard, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    console.log('👋 Fazendo logout...')
    logout()
  }

  // Função para calcular a porcentagem de uso
  const getUsagePercentage = () => {
    if (!currentUser?.limiteMensal || currentUser.limiteMensal === 0) return 0
    return Math.min((currentUser.usadoMes || 0) / currentUser.limiteMensal * 100, 100)
  }

  // Função para determinar a cor da barra de progresso
  const getProgressColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500" 
    return "bg-green-500"
  }

  // Função para determinar se deve mostrar alerta de limite
  const shouldShowLimitAlert = () => {
    const percentage = getUsagePercentage()
    return percentage >= 80
  }

  // Função para obter texto do status do plano
  const getPlanStatusText = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 100) return "Limite atingido"
    if (percentage >= 90) return "Quase no limite"
    if (percentage >= 70) return "Uso alto"
    return `${percentage.toFixed(0)}% usado`
  }

  // Mock temporário para testes - remover quando o endpoint estiver funcionando
  // Descomente as linhas abaixo para testar diferentes cenários
  /*
  const mockScenarios = {
    basic: {
      name: "Usuário Básico",
      email: "basico@email.com", 
      plano: "básico",
      limiteMensal: 5,
      usadoMes: 2
    },
    premium: {
      name: "Usuário Premium",
      email: "premium@email.com",
      plano: "premium", 
      limiteMensal: 50,
      usadoMes: 35
    },
    almostLimit: {
      name: "Usuário Limite",
      email: "limite@email.com",
      plano: "básico",
      limiteMensal: 5,
      usadoMes: 5
    }
  }

  const mockUser = mockScenarios.almostLimit // Altere para testar diferentes cenários
  const currentUser = user?.plano ? user : mockUser
  */
  
  const currentUser = user

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      description: "Visão geral e upload de contratos",
      icon: LayoutDashboard,
    },
    {
      title: "Histórico",
      href: "/historico",
      description: "Visualize todas as análises anteriores",
      icon: History,
    },
    {
      title: "Acompanhamento",
      href: "/acompanhamento",
      description: "Gerencie e monitore seus contratos",
      icon: Bell,
    },
  ]

  return (
    <TooltipProvider>
      <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Contratook</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </div>
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navigationItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 w-full">
                      <item.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Informações do Plano - Desktop */}
          {currentUser?.plano && (
            <Link 
              href="/planos" 
              className="hidden md:block cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="text-sm bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 hover:bg-primary/20 transition-colors min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <p className="font-medium text-primary capitalize">{currentUser.plano}</p>
                  {shouldShowLimitAlert() && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      ⚠️
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uso do mês</span>
                    <span>{currentUser.usadoMes || 0}/{currentUser.limiteMensal || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                      style={{ width: `${getUsagePercentage()}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {getPlanStatusText()}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Informações do Plano - Mobile */}
          {currentUser?.plano && (
            <Link 
              href="/planos" 
              className="md:hidden cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary capitalize">{currentUser.plano}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {currentUser.usadoMes || 0}/{currentUser.limiteMensal || 0}
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
              </div>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full cursor-pointer hover:scale-105 transition-transform">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                {user?.name ? user.name : 'Minha Conta'}
              </DropdownMenuLabel>
              {user?.email && (
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  {user.email}
                </div>
              )}
              {currentUser?.plano && (
                <div className="px-2 py-2 text-xs">
                  <div className="bg-primary/10 rounded-lg px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-primary" />
                        <span className="font-medium text-primary capitalize">{currentUser.plano}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {currentUser.usadoMes || 0}/{currentUser.limiteMensal || 0}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Status</span>
                        <span className={`font-medium ${shouldShowLimitAlert() ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {getPlanStatusText()}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor()}`}
                          style={{ width: `${getUsagePercentage()}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/planos">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Planos e Assinatura
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    </TooltipProvider>
  )
}
