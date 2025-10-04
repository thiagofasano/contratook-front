import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, FileText, Shield, Sparkles } from "lucide-react"

export default function HomePage() {
  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "/mês",
      description: "Para quem está começando",
      features: ["5 análises por mês", "Análise básica de cláusulas", "Download em PDF", "Histórico de 30 dias"],
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
        "50 análises por mês",
        "Análise completa com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões de melhorias",
        "Referências legais",
        "Download em PDF e Word",
        "Histórico ilimitado",
        "Alertas de vencimento",
      ],
      cta: "Assinar Plus",
      href: "/signup?plan=plus",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "R$ 99",
      period: "/mês",
      description: "Para escritórios e empresas",
      features: [
        "Análises ilimitadas",
        "Análise avançada com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões personalizadas",
        "Referências legais completas",
        "Download em múltiplos formatos",
        "Histórico ilimitado",
        "Alertas de vencimento prioritários",
        "Suporte prioritário",
        "API de integração",
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
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ContractAI</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Button asChild>
              <Link href="/signup">Começar Agora</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
          <Sparkles className="h-4 w-4" />
          <span>Análise de Contratos com Inteligência Artificial</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Proteja seus contratos com IA</h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Identifique cláusulas abusivas, receba sugestões inteligentes e mantenha seus contratos sempre seguros e
          atualizados.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Button size="lg" asChild>
            <Link href="/signup">
              <FileText className="mr-2 h-5 w-5" />
              Começar Gratuitamente
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">Ver Planos</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Análise Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                IA avançada identifica cláusulas abusivas e pontos de atenção em segundos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Sugestões Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receba recomendações específicas para melhorar seus contratos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Referências Legais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Todas as análises incluem referências às leis aplicáveis</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Planos e Preços</h2>
          <p className="text-xl text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg shadow-primary/20" : ""}>
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
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
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
          <p>© 2025 ContractAI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
