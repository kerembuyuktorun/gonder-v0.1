"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  setToken, 
  getToken, 
  removeToken,
  setUser,
  getUser,
  clearAuth,
  decodeToken,
  isTokenExpired,
  getTokenExpiresIn,
} from '@hascanb/arf-ui-kit/auth-kit'

export default function TokenUtilsTestPage() {
  const [token, setTokenInput] = useState("")
  const [userData, setUserData] = useState("")
  const [decodedToken, setDecodedToken] = useState<Record<string, unknown> | null>(null)
  const [storedToken, setStoredToken] = useState<string | null>(null)
  const [storedUser, setStoredUser] = useState<Record<string, unknown> | null>(null)

  // Demo JWT token (expire: 1 saat sonra)
  const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInVzZXJuYW1lIjoiZGVtb3VzZXIiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NDA3NjgwMDB9.demo"

  const handleSaveToken = () => {
    if (token) {
      setToken(token)
      alert("Token localStorage'a kaydedildi!")
      refreshStoredData()
    }
  }

  const handleGetToken = () => {
    const stored = getToken()
    setStoredToken(stored)
    if (stored) {
      const decoded = decodeToken(stored)
      setDecodedToken(decoded)
    }
  }

  const handleRemoveToken = () => {
    removeToken()
    alert("Token silindi!")
    refreshStoredData()
  }

  const handleSaveUser = () => {
    try {
      const user = JSON.parse(userData)
      setUser(user)
      alert("Kullanıcı verisi kaydedildi!")
      refreshStoredData()
    } catch {
      alert("Geçersiz JSON formatı!")
    }
  }

  const handleGetUser = () => {
    const stored = getUser()
    setStoredUser(stored)
  }

  const handleClearAuth = () => {
    clearAuth()
    alert("Tüm auth verileri temizlendi!")
    refreshStoredData()
  }

  const refreshStoredData = () => {
    setStoredToken(getToken())
    setStoredUser(getUser())
  }

  const handleDecodeToken = () => {
    if (token) {
      const decoded = decodeToken(token)
      setDecodedToken(decoded)
      
      if (decoded) {
        const expired = isTokenExpired(token)
        const expiresIn = getTokenExpiresIn(token)
        alert(`Token Decoded!\nExpired: ${expired}\nExpires In: ${expiresIn}s`)
      } else {
        alert("Token decode edilemedi!")
      }
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Token Utils Test</h1>
        <p className="text-muted-foreground">
          Auth Kit token yönetimi fonksiyonlarını test edin
        </p>
      </div>

      {/* Demo Token Info */}
      <Alert>
        <AlertDescription>
          <strong>Demo Token:</strong> Aşağıdaki token'ı kullanabilirsiniz (geçerli JWT formatı).
          <Button 
            variant="link" 
            size="sm"
            onClick={() => setTokenInput(demoToken)}
            className="ml-2"
          >
            Demo Token'ı Kullan
          </Button>
        </AlertDescription>
      </Alert>

      {/* Save Token */}
      <Card>
        <CardHeader>
          <CardTitle>Token Kaydet</CardTitle>
          <CardDescription>setToken(token) - localStorage'a kaydet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">JWT Token</Label>
            <Input
              id="token"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveToken}>Kaydet</Button>
            <Button variant="outline" onClick={handleGetToken}>Kaydedilenı Oku</Button>
            <Button variant="destructive" onClick={handleRemoveToken}>Sil</Button>
          </div>
          {storedToken && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Kaydedilen Token:</p>
              <p className="text-xs font-mono break-all">{storedToken}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decode Token */}
      <Card>
        <CardHeader>
          <CardTitle>Token Decode</CardTitle>
          <CardDescription>decodeToken(), isTokenExpired(), getTokenExpiresIn()</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleDecodeToken} disabled={!token}>
            Token'ı Decode Et
          </Button>
          {decodedToken && (
            <div className="space-y-2">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Decoded Payload:</p>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(decodedToken, null, 2)}
                </pre>
              </div>
              {token && (
                <div className="flex gap-2">
                  <Badge variant={isTokenExpired(token) ? "destructive" : "default"}>
                    {isTokenExpired(token) ? "✗ Expired" : "✓ Valid"}
                  </Badge>
                  {!isTokenExpired(token) && (
                    <Badge variant="secondary">
                      Expires in: {Math.floor(getTokenExpiresIn(token) / 60)} dakika
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Data */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Verisi Kaydet</CardTitle>
          <CardDescription>setUser(data), getUser()</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">User Data (JSON)</Label>
            <Input
              id="user"
              placeholder='{"userId": "123", "name": "Demo User", "role": "admin"}'
              value={userData}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserData(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveUser}>Kaydet</Button>
            <Button variant="outline" onClick={handleGetUser}>Kaydedilenı Oku</Button>
          </div>
          {storedUser && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Kaydedilen User:</p>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(storedUser, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear All */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Auth Verilerini Temizle</CardTitle>
          <CardDescription>clearAuth() - Token, refresh token ve user verilerini siler</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearAuth}>
            Tümünü Temizle (Logout)
          </Button>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanım Örneği</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { 
  setToken, 
  decodeToken, 
  isTokenExpired,
  clearAuth 
} from '@hascanb/arf-ui-kit/auth-kit'

// Login
const handleLogin = (token: string) => {
  setToken(token)
  
  const payload = decodeToken(token)
  console.log('User ID:', payload?.userId)
  
  if (isTokenExpired(token)) {
    console.warn('Token expired!')
  }
}

// Logout
const handleLogout = () => {
  clearAuth()
  router.push('/test/auth/pages/signin')
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
