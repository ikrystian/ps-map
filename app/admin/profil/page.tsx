"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Mail, Calendar, Shield, Loader2, Save, KeyRound } from "lucide-react"
import { format } from "date-fns"
import { pl } from "date-fns/locale/pl"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoginHistory } from "@/components/auth"

interface AdminProfile {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
  lastLogin: string | null
  image: string | null
}

export default function AdminProfilPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dane formularza
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Zmiana hasła
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setName(data.name || "")
        setEmail(data.email || "")
      } else {
        toast.error("Nie udało się pobrać profilu")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Wystąpił błąd podczas pobierania profilu")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profil został zaktualizowany")
      fetchProfile()
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Nie udało się zaktualizować profilu")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    // Walidacja
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Wszystkie pola są wymagane")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Nowe hasło i potwierdzenie nie są identyczne")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Nowe hasło musi mieć minimum 8 znaków")
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch("/api/admin/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to change password")
      }

      toast.success("Hasło zostało zmienione")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error.message || "Nie udało się zmienić hasła")
    } finally {
      setChangingPassword(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: pl })
  }

  const getInitials = (name: string | null) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nie udało się załadować profilu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium tracking-tight font-playfair">
          <User className="h-8 w-8" />
          Mój Profil
        </h1>
        <p className="text-muted-foreground">
          Zarządzaj swoim kontem administratora
        </p>
      </div>

      <Separator />

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.image || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name || "Administrator"}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="default" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {profile.role}
                </Badge>
                <Badge
                  variant={profile.status === "ACTIVE" ? "default" : "secondary"}
                  className={profile.status === "ACTIVE" ? "bg-green-600" : ""}
                >
                  {profile.status === "ACTIVE" ? "Aktywny" : profile.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Konto utworzono</p>
                <p className="text-sm text-muted-foreground">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ostatnia aktualizacja</p>
                <p className="text-sm text-muted-foreground">{formatDate(profile.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ostatnie logowanie</p>
                <p className="text-sm text-muted-foreground">{formatDate(profile.lastLogin)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edytuj Profil</CardTitle>
          <CardDescription>
            Zaktualizuj swoje dane osobowe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Zapisz zmiany
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Zmień Hasło
          </CardTitle>
          <CardDescription>
            Zaktualizuj hasło do swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Aktualne hasło</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nowe hasło</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <p className="text-sm text-muted-foreground">
              Minimum 8 znaków
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <KeyRound className="mr-2 h-4 w-4" />
              Zmień hasło
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bezpieczeństwo Konta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Uwierzytelnianie dwuskładnikowe</p>
                <p className="text-sm text-muted-foreground">
                  Dodatkowa warstwa bezpieczeństwa dla Twojego konta
                </p>
              </div>
              <Badge variant="secondary">Wkrótce</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Historia logowań</p>
                <p className="text-muted-foreground">
                  Zobacz ostatnie logowania do konta
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Zobacz historię
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <DialogTitle>Historia Logowań</DialogTitle>
                    <DialogDescription>
                      Lista ostatnich 20 prób logowania do Twojego konta administratora.
                    </DialogDescription>
                  </DialogHeader>
                  <LoginHistory noCard />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Sesje aktywne</p>
                <p className="text-sm text-muted-foreground">
                  Zarządzaj aktywnymi sesjami w systemie
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Wyloguj wszystkie
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
