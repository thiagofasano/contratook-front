/**
 * Exemplos de como os erros da API são tratados no sistema
 * 
 * Este arquivo demonstra como diferentes tipos de erro são processados
 * e apresentados ao usuário de forma clara e informativa.
 */

import { getApiErrorMessage, getAnalysisErrorMessage } from '@/lib/error-utils'

// ✅ EXEMPLOS DE ERROS TRATADOS PELO SISTEMA

// 1. Erro de arquivo muito grande (413)
const fileTooBigError = {
  response: {
    status: 413,
    data: {
      message: "O arquivo enviado excede o tamanho máximo permitido de 10MB"
    }
  }
}

// 2. Erro de formato não suportado (415)
const unsupportedFormatError = {
  response: {
    status: 415,
    data: {
      error: "Formato de arquivo não suportado. Use PDF, DOC ou DOCX."
    }
  }
}

// 3. Erro de documento não processável (422)
const unprocessableDocError = {
  response: {
    status: 422,
    data: "O documento não contém texto suficiente para análise"
  }
}

// 4. Erro de servidor (500)
const serverError = {
  response: {
    status: 500,
    data: {
      details: "Erro interno do servidor. Nossa equipe foi notificada."
    }
  }
}

// 5. Erro de rede
const networkError = {
  code: 'NETWORK_ERROR',
  message: 'Network Error'
}

// 6. Erro de timeout
const timeoutError = {
  code: 'ECONNABORTED',
  message: 'timeout of 30000ms exceeded'
}

// ✅ EXEMPLOS DE SAÍDA DOS TRATAMENTOS

console.log('=== EXEMPLOS DE TRATAMENTO DE ERROS ===\n')

console.log('1. Arquivo muito grande:')
console.log(getAnalysisErrorMessage(fileTooBigError))
// Saída: { title: "❌ Arquivo muito grande", message: "O arquivo enviado excede o tamanho máximo permitido de 10MB" }

console.log('\n2. Formato não suportado:')
console.log(getAnalysisErrorMessage(unsupportedFormatError))
// Saída: { title: "❌ Formato não suportado", message: "Formato de arquivo não suportado. Use PDF, DOC ou DOCX." }

console.log('\n3. Documento não processável:')
console.log(getAnalysisErrorMessage(unprocessableDocError))
// Saída: { title: "❌ Documento não processável", message: "O documento não contém texto suficiente para análise" }

console.log('\n4. Erro de servidor:')
console.log(getApiErrorMessage(serverError))
// Saída: { title: "❌ Erro no servidor", message: "Erro interno do servidor. Nossa equipe foi notificada." }

console.log('\n5. Erro de rede:')
console.log(getApiErrorMessage(networkError))
// Saída: { title: "❌ Erro", message: "Erro de conexão. Verifique sua internet." }

console.log('\n6. Erro de timeout:')
console.log(getApiErrorMessage(timeoutError))
// Saída: { title: "❌ Erro", message: "Tempo limite esgotado." }

/**
 * 🎯 BENEFÍCIOS DO NOVO SISTEMA:
 * 
 * ✅ Mensagens específicas da API são mostradas ao usuário
 * ✅ Diferentes tipos de erro têm títulos apropriados
 * ✅ Erros de rede e timeout são tratados especificamente
 * ✅ Status HTTP é interpretado e apresentado de forma amigável
 * ✅ Código centralizado e reutilizável em todos os componentes
 * ✅ Melhor experiência do usuário com feedback claro
 * ✅ Logs detalhados para debugging (console.error)
 * ✅ Fallbacks para casos não mapeados
 * 
 * 🚀 COMPONENTES QUE USAM O TRATAMENTO MELHORADO:
 * - UploadSection: Análise de documentos
 * - HistorySection: Carregamento, download e exclusão de análises
 * - AlertsSection: (pode ser adicionado posteriormente)
 * - Todos os interceptors do Axios
 */