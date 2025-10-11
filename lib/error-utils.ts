// Função utilitária para extrair mensagem de erro da resposta da API
export function getApiErrorMessage(error: any): { title: string; message: string } {
  let errorMessage = "Tente novamente em alguns momentos."
  let errorTitle = "❌ Erro"

  if (error.response?.data) {
    // Se a API retornou uma mensagem de erro específica
    if (typeof error.response.data === 'string') {
      errorMessage = error.response.data
    } else if (error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.response.data.error) {
      errorMessage = error.response.data.error
    } else if (error.response.data.details) {
      errorMessage = error.response.data.details
    } else if (error.response.data.title) {
      errorMessage = error.response.data.title
    }
  } else if (error.message) {
    // Tratar erros de rede ou timeout
    if (error.code === 'NETWORK_ERROR') {
      errorMessage = "Erro de conexão. Verifique sua internet."
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Tempo limite esgotado."
    } else {
      errorMessage = error.message
    }
  }

  // Adicionar informações sobre o status HTTP se disponível
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        errorTitle = "❌ Requisição inválida"
        break
      case 401:
        errorTitle = "❌ Não autorizado"
        break
      case 403:
        errorTitle = "❌ Acesso negado"
        break
      case 404:
        errorTitle = "❌ Não encontrado"
        break
      case 413:
        errorTitle = "❌ Arquivo muito grande"
        break
      case 415:
        errorTitle = "❌ Formato não suportado"
        break
      case 422:
        errorTitle = "❌ Dados inválidos"
        break
      case 429:
        errorTitle = "❌ Muitas tentativas"
        break
      case 500:
        errorTitle = "❌ Erro no servidor"
        break
      case 502:
        errorTitle = "❌ Serviço indisponível"
        break
      case 503:
        errorTitle = "❌ Serviço em manutenção"
        break
      case 504:
        errorTitle = "❌ Tempo limite do servidor"
        break
      default:
        errorTitle = `❌ Erro ${error.response.status}`
    }
  }

  return { title: errorTitle, message: errorMessage }
}

// Função específica para erros de análise de documentos
export function getAnalysisErrorMessage(error: any): { title: string; message: string } {
  const { title, message } = getApiErrorMessage(error)
  
  // Personalizar títulos para contexto de análise
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
<<<<<<< HEAD
        return { title: "❌ Erro na requisição", message }
=======
        return { title: "❌ Arquivo inválido", message }
>>>>>>> 158d9549918e91d3b8d87464b151d68b95a49069
      case 413:
        return { title: "❌ Arquivo muito grande", message }
      case 415:
        return { title: "❌ Formato não suportado", message }
      case 422:
        return { title: "❌ Documento não processável", message }
      default:
        return { title: title.includes("análise") ? title : "❌ Erro na análise", message }
    }
  }
  
  return { title: title.includes("análise") ? title : "❌ Erro na análise", message }
}