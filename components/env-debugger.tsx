"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EnvDebugger() {
  const [showDebug, setShowDebug] = useState(false)

  if (process.env.NODE_ENV === 'production' && !showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setShowDebug(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
        >
          🐛 Debug ENV
        </Button>
      </div>
    )
  }

  if (!showDebug) return null

  const envVars = {
    'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
    'NEXT_PUBLIC_ENV': process.env.NEXT_PUBLIC_ENV,
    'NEXT_PUBLIC_APP_NAME': process.env.NEXT_PUBLIC_APP_NAME,
    'NEXT_PUBLIC_APP_VERSION': process.env.NEXT_PUBLIC_APP_VERSION,
    'NEXT_PUBLIC_LOG_LEVEL': process.env.NEXT_PUBLIC_LOG_LEVEL,
    'NODE_ENV': process.env.NODE_ENV,
  }

  const determineEnvFile = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const env = process.env.NEXT_PUBLIC_ENV
    
    if (env === 'dev' || env === 'development') {
      return '📁 .env.local (Development)'
    } else if (env === 'production') {
      return '📁 .env.production (Production)'
    } else if (apiUrl?.includes('localhost')) {
      return '📁 .env.local (localhost detected)'
    } else if (apiUrl?.includes('contractadminapi')) {
      return '📁 .env.production ou Vercel Env Vars (Azure API detected)'
    } else {
      return '❓ Arquivo .env não identificado'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>🔍 Environment Variables Debug</CardTitle>
            <Button 
              onClick={() => setShowDebug(false)}
              variant="outline"
              size="sm"
            >
              ✕ Fechar
            </Button>
          </div>
          <div className="text-sm text-green-600 font-semibold">
            {determineEnvFile()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="border rounded p-3">
                <div className="font-mono text-sm font-semibold text-blue-600">
                  {key}
                </div>
                <div className="font-mono text-sm mt-1 break-all">
                  {value || <span className="text-red-500">undefined</span>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">📊 Análise:</h4>
            <div className="text-sm space-y-1">
              <div>• <strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
              <div>• <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL?.includes('localhost') ? 'Localhost (Dev)' : 'Azure (Prod)'}</div>
              <div>• <strong>Environment:</strong> {process.env.NEXT_PUBLIC_ENV || 'Não definido'}</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Como identificar:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• Se NEXT_PUBLIC_ENV = "dev" → <strong>.env.local</strong></div>
              <div>• Se NEXT_PUBLIC_ENV = "production" → <strong>.env.production</strong></div>
              <div>• Se API_URL tem "localhost" → <strong>.env.local</strong></div>
              <div>• Se API_URL tem "azure" → <strong>.env.production ou Vercel</strong></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}