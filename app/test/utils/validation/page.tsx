"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  isValidEmail, 
  isValidUsername,
  isValidPhoneNumber,
  isValidOtp,
  getPasswordStrength,
  getPasswordStrengthText,
  passwordsMatch,
  meetsMinPasswordLength,
} from '@hascanb/arf-ui-kit/auth-kit'

export default function ValidationUtilsTestPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const passwordStrength = password ? getPasswordStrength(password) : 0
  const strengthText = getPasswordStrengthText(passwordStrength)
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  return (
    <div className="container mx-auto p-6 space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Validation Utils Test</h1>
        <p className="text-muted-foreground">
          Auth Kit validation fonksiyonlarını test edin
        </p>
      </div>

      {/* Email Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Email Validation</CardTitle>
          <CardDescription>isValidEmail(email)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sonuç:</span>
            {email && (
              <Badge variant={isValidEmail(email) ? "default" : "destructive"}>
                {isValidEmail(email) ? "✓ Geçerli Email" : "✗ Geçersiz Email"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Username Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Username Validation</CardTitle>
          <CardDescription>isValidUsername(username) - Min 3 karakter, alfanumerik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              placeholder="kullanici123"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sonuç:</span>
            {username && (
              <Badge variant={isValidUsername(username) ? "default" : "destructive"}>
                {isValidUsername(username) ? "✓ Geçerli Username" : "✗ Geçersiz Username"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phone Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Phone Number Validation (TR)</CardTitle>
          <CardDescription>isValidPhoneNumber(phone) - Türkiye formatı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon Numarası</Label>
            <Input
              id="phone"
              placeholder="05551234567 veya +90 555 123 45 67"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sonuç:</span>
            {phone && (
              <Badge variant={isValidPhoneNumber(phone) ? "default" : "destructive"}>
                {isValidPhoneNumber(phone) ? "✓ Geçerli Telefon" : "✗ Geçersiz Telefon"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OTP Validation */}
      <Card>
        <CardHeader>
          <CardTitle>OTP Code Validation</CardTitle>
          <CardDescription>isValidOtp(otp, 6) - 6 haneli kod</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Kodu</Label>
            <Input
              id="otp"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sonuç:</span>
            {otp && (
              <Badge variant={isValidOtp(otp) ? "default" : "destructive"}>
                {isValidOtp(otp) ? "✓ Geçerli OTP" : "✗ Geçersiz OTP"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Strength */}
      <Card>
        <CardHeader>
          <CardTitle>Password Strength Calculator</CardTitle>
          <CardDescription>getPasswordStrength(password) - 0-4 skor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </div>
          {password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Güç Skoru:</span>
                <Badge className={strengthColors[passwordStrength]}>
                  {passwordStrength}/4 - {strengthText}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${strengthColors[passwordStrength]} transition-all`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>✓ En az 8 karakter: {password.length >= 8 ? "Evet" : "Hayır"}</p>
                <p>✓ Büyük ve küçük harf: {/[a-z]/.test(password) && /[A-Z]/.test(password) ? "Evet" : "Hayır"}</p>
                <p>✓ Rakam içeriyor: {/\d/.test(password) ? "Evet" : "Hayır"}</p>
                <p>✓ Özel karakter: {/[^a-zA-Z0-9]/.test(password) ? "Evet" : "Hayır"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Match */}
      <Card>
        <CardHeader>
          <CardTitle>Password Match & Min Length</CardTitle>
          <CardDescription>passwordsMatch() ve meetsMinPasswordLength()</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm">Şifre Tekrar</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            />
          </div>
          {password && confirmPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Eşleşme:</span>
                <Badge variant={passwordsMatch(password, confirmPassword) ? "default" : "destructive"}>
                  {passwordsMatch(password, confirmPassword) ? "✓ Şifreler eşleşiyor" : "✗ Şifreler eşleşmiyor"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Min 8 Karakter:</span>
                <Badge variant={meetsMinPasswordLength(password) ? "default" : "destructive"}>
                  {meetsMinPasswordLength(password) ? "✓ Yeterli uzunluk" : "✗ Çok kısa"}
                </Badge>
              </div>
            </div>
          )}
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
  isValidEmail,
  getPasswordStrength 
} from '@hascanb/arf-ui-kit/auth-kit'

// Email kontrolü
if (!isValidEmail(email)) {
  setError('Geçersiz email formatı')
}

// Şifre gücü
const strength = getPasswordStrength(password)
if (strength < 2) {
  setError('Şifreniz çok zayıf')
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
