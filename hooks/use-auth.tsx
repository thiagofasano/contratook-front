'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import api, { authUtils } from '@/lib/axios'

interface User {
  id: string
  email: string
  name?: string
  plano?: string
  limiteMensal?: number
  usadoMes?: number
  // Adicione outros campos do usuário conforme necessário
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isCheckingRef = useRef(false)

  const isAuthenticated = !!user && authUtils.isAuthenticated()

  // Verificar se o token é válido fazendo uma chamada para a API
  const checkAuth = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isCheckingRef.current) {
      console.log('⏳ CheckAuth já em andamento, ignorando...')
      return
    }

    try {
      isCheckingRef.current = true
      setIsLoading(true)
      const token = authUtils.getToken()
      
      if (!token) {
        setUser(null)
        return
      }

      // Fazer uma chamada para verificar se o token ainda é válido
      const response = await api.get('user/me') // endpoint que retorna dados do usuário incluindo plano
      
      if (response.data) {
        setUser(response.data)
        console.log('✅ Usuário autenticado:', response.data)
      }
    } catch (error: any) {
      console.log('❌ Token inválido ou expirado')
      // Token inválido, limpar dados
      authUtils.removeToken()
      setUser(null)
    } finally {
      setIsLoading(false)
      isCheckingRef.current = false
    }
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.token) {
        authUtils.setToken(response.data.token)
        
        // Se a API retorna dados do usuário junto com o token
        if (response.data.user) {
          setUser(response.data.user)
        } else {
          // Senão, buscar dados do usuário
          await checkAuth()
        }
        
        console.log('🔐 Login realizado com sucesso!')
      }
    } catch (error) {
      authUtils.removeToken()
      setUser(null)
      throw error
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    authUtils.removeToken()
    setUser(null)
    router.push('/login')
    console.log('👋 Logout realizado')
  }, [router])

  // Verificar autenticação quando o componente carrega
  useEffect(() => {
    checkAuth()
  }, [])

  // Interceptor para logout automático quando token expira
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🚫 Token expirado, fazendo logout automático')
          authUtils.removeToken()
          setUser(null)
          router.push('/login')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [router])

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }), [user, isLoading, isAuthenticated, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}