import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Shield, ArrowLeft, Lock, Eye, Server } from "lucide-react"

export default function PlanosPage() {
  const plans = [
    {
      name: "Plus",
      price: "R$ 49",
      period: "/mês",
      description: "Para profissionais autônomos",
      features: [
        "30 Análises por mês",
        "Análise completa e avançada com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões personalizadas",
        "Referências legais completas",
        "Download das análises em PDF",
        "Histórico de análises",
      ],
      cta: "Assinar Plus",
      href: "/assinatura?plan=plus",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "R$ 129",
      period: "/mês",
      description: "Para escritórios e empresas",
      features: [
        "90 Análises por mês",
        "Análise completa e avançada com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões personalizadas",
        "Referências legais completas",
        "Download das análises em PDF",
        "Histórico de análises",
        "Gestão de Contratos - Notificações de vencimento"
      ],
      cta: "Assinar Premium",
      href: "/assinatura?plan=premium",
      highlighted: false,
    },
    {
      name: "Personalizado",
      price: "Sob",
      period: "consulta",
      description: "Um plano montado especialmente para suas necessidades",
      features: [
        "Análises ilimitadas",
        "Análise completa e avançada com IA",
        "Identificação de cláusulas abusivas",
        "Sugestões personalizadas",
        "Referências legais completas",
        "Download das análises em PDF",
        "Histórico de análises",
        "Gestão de Contratos - Notificações de vencimento",
        "Suporte",
      ],
      cta: "Fale Conosco",
      href: "mailto:contato@contratodobem.com.br?subject=Interesse no Plano Personalizado",
      highlighted: false,
      isCustom: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Contratook"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <nav className="flex items-center gap-6">
            <Button asChild variant="ghost" className="cursor-pointer hover:scale-105 transition-transform">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm mb-6">
          <Shield className="h-4 w-4" />
          <span>Upgrade do plano</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
          Atingiu o limite de uso?
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Continue analisando seus contratos com segurança e recursos avançados. 
          Escolha o plano ideal para suas necessidades.
        </p>
      </section>

      
      {/* Benefits Section */}
      <section className="bg-muted/50 py-5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que fazer upgrade?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desbloqueie todo o potencial da nossa plataforma de análise de contratos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mais Análises</h3>
              <p className="text-muted-foreground">
                Precisa revisar diversos contratos? Faça upgrade e analise mais. Aumente sua eficiência, reduza riscos e tome decisões com base em dados claros e confiáveis.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recursos Avançados</h3>
              <p className="text-muted-foreground">
                Desbloqueie o poder da análise avançada e obtenha relatórios mais ricos e detalhados.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="h-8 w-8 text-primary rotate-180" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestão de Contratos</h3>
              <p className="text-muted-foreground">
                Cadastre seus contratos e receba notificações automáticas de vencimento, evitando esquecimentos e mantendo tudo sob controle em um só lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <br />
      <br />

      {/* Pricing Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Planos e Preços</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
                {plan.isCustom ? (
                  <Button className="w-full cursor-pointer hover:scale-105 transition-transform" variant="outline" asChild>
                    <a href={plan.href}>{plan.cta}</a>
                  </Button>
                ) : (
                  <Button className="w-full cursor-pointer hover:scale-105 transition-transform" variant={plan.highlighted ? "default" : "outline"} asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>


      {/* Privacy & Security Section */}
      <section className="py-10">
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

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            <Card className="text-center">
              <CardHeader>
                <Eye className="h-12 w-12 text-black mb-6 mx-auto" />
                <CardTitle>Privacidade e Confidencialidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                 Os documentos enviados são processados de forma totalmente segura.
Nenhum contrato é armazenado ou utilizado para treinar modelos de IA — a análise ocorre apenas para gerar o resultado solicitado.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Server className="h-12 w-12 text-black mb-6 mx-auto" />
                <CardTitle>Uso de tecnologia de ponta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilizamos a tecnologia GPT da OpenAI — a mesma base utilizada por grandes empresas globais — em sua versão profissional e segura, com confidencialidade garantida.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Server className="h-12 w-12 text-black mb-6 mx-auto" />
                <CardTitle>Conformidade total com a LGPD</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em conformidade com a Lei Geral de Proteção de Dados (LGPD), os documentos são usados exclusivamente para o propósito de análise contratual solicitada pelo usuário
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Contratook. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}