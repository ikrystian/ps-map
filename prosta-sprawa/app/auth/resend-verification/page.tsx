"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Loader2 } from "lucide-react"

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Wprowadz adres email")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Link weryfikacyjny zostaB wysBany")
        setEmail("")
        // Przekieruj do strony logowania po 2 sekundach
        setTimeout(() => {
          router.push("/logowanie")
        }, 2000)
      } else {
        toast.error(data.error || "WystpiB bBd")
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      toast.error("WystpiB bBd podczas wysyBania emaila")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Mail className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle>Wy[lij ponownie email weryfikacyjny</CardTitle>
          <CardDescription>
            Wprowadz swój adres email, a wy[lemy Ci nowy link weryfikacyjny
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  WysyBanie...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Wy[lij link weryfikacyjny
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/logowanie")}
                disabled={loading}
              >
                Wró do logowania
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
