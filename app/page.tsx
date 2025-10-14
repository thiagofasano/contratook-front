"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Shield, Sparkles, Lock, Eye, Server, HelpCircle, CreditCard, Zap, Plus, Mail, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"

export default function HomePage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [captcha, setCaptcha] = useState({
    question: "",
    answer: "",
    userAnswer: "",
    correctAnswer: 0
  })
  const [isClient, setIsClient] = useState(false)

  // Gerar pergunta de captcha simples
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operations = ['+', '-', '*']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let result = 0
    let question = ""
    
    switch (operation) {
      case '+':
        result = num1 + num2
        question = `${num1} + ${num2} = ?`
        break
      case '-':
        const larger = Math.max(num1, num2)
        const smaller = Math.min(num1, num2)
        result = larger - smaller
        question = `${larger} - ${smaller} = ?`
        break
      case '*':
        result = num1 * num2
        question = `${num1} × ${num2} = ?`
        break
    }
    
    setCaptcha({
      question,
      answer: "",
      userAnswer: "",
      correctAnswer: result
    })
  }

  // Inicializar captcha quando componente carregar no cliente
  useEffect(() => {
    setIsClient(true)
    generateCaptcha()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptcha(prev => ({ ...prev, userAnswer: e.target.value }))
  }

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "❌ Nome obrigatório",
        description: "Por favor, informe seu nome.",
        variant: "destructive"
      })
      return false
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "❌ E-mail inválido",
        description: "Por favor, informe um e-mail válido.",
        variant: "destructive"
      })
      return false
    }

    if (!formData.mensagem.trim()) {
      toast({
        title: "❌ Mensagem obrigatória",
        description: "Por favor, escreva sua mensagem.",
        variant: "destructive"
      })
      return false
    }

    if (parseInt(captcha.userAnswer) !== captcha.correctAnswer) {
      toast({
        title: "❌ Verificação incorreta",
        description: "Por favor, resolva corretamente a operação matemática.",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await api.post('/faleConosco', {
        nome: formData.nome,
        email: formData.email,
        mensagem: formData.mensagem
      })

      toast({
        title: "✅ Mensagem enviada!",
        description: "Recebemos sua mensagem e responderemos em breve.",
        duration: 5000
      })

      // Limpar formulário
      setFormData({ nome: "", email: "", mensagem: "" })
      generateCaptcha()
      
    } catch (error) {
      toast({
        title: "❌ Erro ao enviar",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Contratook"
              width={180}
              height={80}
              className="h-6 md:h-8 w-auto"
            />
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild className="cursor-pointer transition-transform bg-black hover:text-white hover:bg-gray hover:scale-105">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            </Button>
            <Button asChild className="cursor-pointer hover:scale-105 transition-transform">
              <Link href="/signup">Testar Grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-md mb-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
          <Sparkles className="h-4 w-4" />
          <span>Proteja seus contratos com IA</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">Contratos mal elaborados custam caro</h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
           Utilize nossa IA para identificar cláusulas abusivas, mostrar sugestões inteligentes, listar referências legais e manter contratos seguros e
          atualizados.
        </p>

        <br />

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.0s_forwards]">
            <CardHeader className="flex flex-col items-center text-center">
              <Shield className="h-10 w-10 text-black mb-2" />
              <CardTitle>Análise Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                IA avançada identifica cláusulas abusivas e pontos de atenção em segundos.
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.2s_forwards]">
            <CardHeader className="flex flex-col items-center text-center">
              <Sparkles className="h-10 w-10 text-black mb-2" />
              <CardTitle>Sugestões Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receba recomendações específicas para melhorar seus contratos.</p>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.4s_forwards]">
            <CardHeader className="flex flex-col items-center text-center">
              <FileText className="h-10 w-10 text-black mb-2" />
              <CardTitle>Referências Legais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Todas as análises incluem referências às leis aplicáveis.</p>
            </CardContent>
          </Card>

          <Card className="opacity-0 animate-[fadeInUp_0.8s_ease-out_1.6s_forwards]">
            <CardHeader className="flex flex-col items-center text-center">
              <Lock className="h-10 w-10 text-black mb-2" />
              <CardTitle>Processamento Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Os contratos são processados por meio de conexões criptografadas (HTTPS) e não ficam salvos em nossos servidores após a análise, garantindo privacidade total.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-lime-200/20 rounded-full blur-lg"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content Side */}
              <div className="text-center lg:text-left">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
                  <span className="text-green-600">Seu contrato</span>{" "}
                  <span className="text-gray-900">te protege</span>{" "}
                  <span className="text-green-600">mesmo?</span>
                </h2>
                
                <p className="text-2xl text-gray-700 mb-4 max-w-3xl mx-auto lg:mx-0 font-medium">
                  Descubra grátis em <span className="text-green-600 font-bold">30 segundos</span> 
                </p>
                
                <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                  Milhares de contratos possuem cláusulas abusivas que podem te prejudicar. 
                  Não seja mais uma vítima.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                  <Button size="lg" asChild className="cursor-pointer hover:scale-105 transition-all duration-300 bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl">
                    <Link href="/signup">
                      <Shield className="mr-2 h-6 w-6" />
                      Analisar Meu Contrato GRÁTIS
                    </Link>
                  </Button>
                </div>

                {/* Limite do plano gratuito */}
                <p className="text-sm text-gray-500 text-center lg:text-left mb-8">
                  Limite de 3 análises por mês no plano grátis. <br /> Não é necessário cadastrar cartão de crédito.
                </p>
              </div>

              {/* Video Side */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-full max-w-[600px] h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <video
                      src="/contract-analysis.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                      preload="auto"
                      className="w-full h-full object-cover scale-150"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    IA Avançada
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  Em conformidade com a Lei Geral de Proteção de Dados (LGPD), os documentos são usados exclusivamente para o propósito de análise contratual solicitada pelo usuário, não ficando armazenados.
                </p>
              </CardContent>
            </Card>
          </div>


        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tire suas dúvidas sobre nosso serviço
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline cursor-pointer">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-green-600 shrink-0" />
                    A análise é mesmo gratuita?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 pb-4 ml-8">
                  Sim. O plano gratuito inclui 3 análises mensais, sem necessidade de assinatura ou cartão de crédito.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-600 shrink-0" />
                    Eu consigo analisar mais de 3 vezes por mês?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 pb-4 ml-8">
                  Sim. Temos opções de planos pagos que oferecem até 60 análises por mês e utilizam um modelo mais avançado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-green-600 shrink-0" />
                    Qual a diferença em usar o Contratook e o ChatGPT?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 pb-4 ml-8">
                  <p>Vamos listar alguns dos nossos diferenciais =)</p>
                  <br />
                  <ul>
                  <li>1) Diferente do ChatGPT, onde os documentos podem ser usados para aprimorar o modelo, em nosso sistema seus arquivos não são armazenados nem utilizados para nenhum tipo de treinamento. A análise ocorre de forma segura e temporária, garantindo total confidencialidade. </li>
                  <li>2) Receba uma avaliação completa do seu contrato, com identificação de cláusulas abusivas, sugestões de melhorias e referências legais que embasam cada ponto. </li>
                  <li>3) Baixe um relatório claro e profissional, reunindo todas as informações e insights gerados pela análise, pronto para imprimir ou compartilhar.</li>
                  <li>4) Cadastre seus contratos e receba notificações automáticas de vencimento, evitando esquecimentos e mantendo tudo sob controle em um só lugar.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-green-600 shrink-0" />
                    Além da análise de contratos, o contratook possui mais funcionalidades?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 pb-4 ml-8">
                  Sim. Temos também o gerenciador de contratos, onde você pode cadastrar contratos, anexando o documento ou não, para acompanhar e receber alertas sobre seu prazo de vencimento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Precisa de ajuda?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entre em contato conosco! Nossa equipe está pronta para ajudar você com qualquer dúvida ou suporte técnico.
            </p>
            
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle>Envie sua mensagem</CardTitle>
                <CardDescription>Responderemos o mais rápido possível</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem *</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      placeholder="Descreva sua dúvida ou solicitation..."
                      rows={5}
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Validador humano */}
                  <div className="space-y-2">
                    <Label htmlFor="captcha">Verificação humana *</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold bg-muted px-4 py-2 rounded">
                        {isClient ? captcha.question : "Carregando..."}
                      </span>
                      <Input
                        id="captcha"
                        type="number"
                        placeholder="Resposta"
                        value={captcha.userAnswer}
                        onChange={handleCaptchaChange}
                        disabled={isLoading || !isClient}
                        className="w-24"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCaptcha}
                        disabled={isLoading || !isClient}
                      >
                        Nova pergunta
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <br />

                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Ou envie um e-mail diretamente para:{" "}
                    <a 
                      href="mailto:faleconosco@contratook.com.br"
                      className="text-primary hover:underline"
                    >
                      faleconosco@contratook.com.br
                    </a>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-0">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Contratook - Seu assistente de contratos impulsionado por IA.</p>
        </div>
      </footer>
    </div>
  )
}
