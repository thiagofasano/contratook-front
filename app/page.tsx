import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, FileText, Shield, Sparkles, Lock, Eye, Server } from "lucide-react"

export default function HomePage() {
  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "/mês",
      description: "Para quem está começando",
      features: ["3 análises por mês", "Análise completa com IA", "Identificação de cláusulas abusivas", "Sugestões de melhorias", "Download das análises em PDF", "Histórico de análises"],
      cta: "Começar Grátis",
      href: "/signup?plan=free",
      highlighted: false,
    },
    {
      name: "Plus",
      price: "R$ 49",
      period: "/mês",
      description: "Para profissionais autônomos",
      features: [
        "30 análises por mês",
        "Análise completa com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões de melhorias",
        "Referências legais",
        "Download das análises em PDF",
        "Histórico de análises",
      ],
      cta: "Assinar Plus",
      href: "/signup?plan=plus",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "R$ 129",
      period: "/mês",
      description: "Para escritórios e empresas",
      features: [
        "100 Análises por mês",
        "Análise completa e avançada com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões personalizadas",
        "Referências legais completas",
        "Download das análises em PDF",
        "Histórico de análises",
        "Cadastro e alertas de vencimento de contratos",
        "Suporte prioritário",
      ],
      cta: "Assinar Premium",
      href: "/signup?plan=premium",
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-black" />
            <span className="text-xl font-bold">Contratook</span>
          </div>
          <nav className="flex items-center gap-6">
            <Button asChild className="cursor-pointer transition-transform bg-black hover:text-white hover:bg-gray hover:scale-105">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            </Button>
            <Button asChild className="cursor-pointer hover:scale-105 transition-transform">
              <Link href="/signup">Começar</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
          <Sparkles className="h-4 w-4" />
          <span>Análise de Contratos com Inteligência Artificial</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">Proteja seus contratos com IA</h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          Identifique cláusulas abusivas, receba sugestões inteligentes e mantenha seus contratos sempre seguros e
          atualizados.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards]">
          <Button size="lg" asChild className="cursor-pointer hover:scale-105 transition-transform">
            <Link href="/signup">
              <FileText className="mr-2 h-5 w-5" />
              Começar
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="cursor-pointer hover:scale-105 transition-transform">
            <Link href="#pricing">Ver Planos</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.0s_forwards]">
            <CardHeader>
              <Shield className="h-10 w-10 text-black mb-2" />
              <CardTitle>Análise Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                IA avançada identifica cláusulas abusivas e pontos de atenção em segundos
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.2s_forwards]">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-black mb-2" />
              <CardTitle>Sugestões Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receba recomendações específicas para melhorar seus contratos</p>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.4s_forwards]">
            <CardHeader>
              <FileText className="h-10 w-10 text-black mb-2" />
              <CardTitle>Referências Legais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Todas as análises incluem referências às leis aplicáveis</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Lock className="h-4 w-4" />
              <span>Privacidade e Segurança</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Seus dados estão seguros conosco</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Utilizamos as mais altas tecnologias de segurança e criptografia para proteger suas informações e documentos contratuais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            <Card className="text-center">
              <CardHeader>
                <Eye className="h-12 w-12 text-black mb-6 mx-auto" />
                <CardTitle>Política de Zero Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seus dados nunca são armazenados permanentemente. Após a análise, todos os documentos são 
                  automaticamente excluídos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Server className="h-12 w-12 text-black mb-6 mx-auto" />
                <CardTitle>Conformidade LGPD</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Você tem total controle sobre seus dados e pode remover a qualquer momento.
                </p>
              </CardContent>
            </Card>
          </div>


        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Planos e Preços</h2>
          <p className="text-xl text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={plan.highlighted ? "border-primary shadow-lg shadow-primary/20" : ""}
            >
              <CardHeader>
                {plan.highlighted && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-2 w-fit">
                    Recomendado
                  </div>
                )}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-black shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full cursor-pointer hover:scale-105 transition-transform" variant={plan.highlighted ? "default" : "outline"} asChild>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Contrato Ok. - Seu assistente de contratos impulsionado por IA.</p>
        </div>
      </footer>
    </div>
  )
}
