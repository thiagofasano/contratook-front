import axios from 'axios'

// Criar instância do Axios com configuração base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requisições (adiciona token e logs)
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Requisição:', config.method?.toUpperCase(), config.url)
      if (token) {
        console.log('🔐 Token incluído no header')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para respostas (logs e tratamento de auth)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Resposta:', response.status, response.config.url)
    }
    return response
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Erro na requisição:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        message: error.message
      })
    }

    // Se token expirou ou é inválido, remover do localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      // Opcional: redirecionar para login
      // window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// Funções utilitárias para gerenciar token
export const authUtils = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token)
  },
  
  getToken: () => {
    return localStorage.getItem('authToken')
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken')
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  }
}

export default api