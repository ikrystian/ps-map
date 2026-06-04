"use client"

import { LoginHistory } from "@/components/auth"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { useEffect, useState } from "react"

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface NotificationSettings {
  id?: string
  userId?: string
  emailNoweOferty: boolean
  emailWiadomosci: boolean
  emailStatusy: boolean
  smsPilne: boolean
  kontaktKlienci: boolean
  kluczowe: boolean
  wskazowkiPorady: boolean
  ofertPromocje: boolean
  przypomnienieWiadomosci: boolean
  noweFunkcje: boolean
  zmianyCenniki: boolean
  zmianyRegulamin: boolean
  kontaktDoradca: boolean
  wyswietlanieAwatara: boolean
  autoProsbOpinie: boolean
  powiadomienieDzwiekowe: boolean
  ustawieniaOgloszenia: boolean
  powiadomieniaSmNowa: boolean
  wiadomosciZbiorcze: boolean
  urlop: boolean
}

interface AccountInfo {
  createdAt: string
  lastLogin: {
    date: string
    ipAddress: string | null
  } | null
  lastFailedLogin: {
    date: string
    ipAddress: string | null
  } | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export default function LawFirmSettingsPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [showAvatarCropper, setShowAvatarCropper] = useState(false)

  // Dane użytkownika
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    email: "",
    image: null,
  })

  // Ustawienia powiadomień
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNoweOferty: true,
    emailWiadomosci: true,
    emailStatusy: true,
    smsPilne: false,
    kontaktKlienci: true,
    kluczowe: true,
    wskazowkiPorady: true,
    ofertPromocje: true,
    przypomnienieWiadomosci: true,
    noweFunkcje: true,
    zmianyCenniki: true,
    zmianyRegulamin: true,
    kontaktDoradca: false,
    wyswietlanieAwatara: true,
    autoProsbOpinie: false,
    powiadomienieDzwiekowe: false,
    ustawieniaOgloszenia: true,
    powiadomieniaSmNowa: false,
    wiadomosciZbiorcze: true,
    urlop: false,
  })

  // Informacje o koncie
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobierz dane użytkownika
        if (session?.user) {
          setUserData({
            id: session.user.id || "",
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image || null,
          })
        }

        // Pobierz ustawienia powiadomień
        const settingsRes = await fetch("/api/notification-settings")
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setNotificationSettings(settingsData)
        }

        // Pobierz informacje o koncie
        const accountRes = await fetch("/api/auth/account-info")
        if (accountRes.ok) {
          const accountData = await accountRes.json()
          setAccountInfo(accountData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Nie udało się pobrać danych")
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [session])

  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSettingChange = (field: keyof NotificationSettings, value: boolean) => {
    // Nie pozwól na wyłączenie obowiązkowych pól
    if ((field === "kontaktKlienci" || field === "kluczowe") && !value) {
      toast.error("Ta opcja jest obowiązkowa i nie może być wyłączona")
      return
    }

    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    // Show cropper
    setSelectedAvatarFile(file)
    setShowAvatarCropper(true)
  }

  const handleAvatarCropComplete = async (croppedBlob: Blob) => {
    setShowAvatarCropper(false)
    setIsUploadingAvatar(true)

    try {
      const file = new File([croppedBlob], selectedAvatarFile?.name || "avatar.jpg", {
        type: croppedBlob.type,
      })

      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to upload avatar")
      }

      const data = await response.json()
      const uploadUrl = data.url

      if (!uploadUrl) {
        throw new Error("No upload URL returned")
      }

      // Zaktualizuj dane użytkownika z nowym avatarem
      const updateResponse = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          image: uploadUrl,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update avatar")
      }

      setUserData((prev) => ({ ...prev, image: uploadUrl }))

      // Zaktualizuj sesję NextAuth z triggerem "update"
      await update({
        image: uploadUrl,
      })

      toast.success("Avatar został zaktualizowany")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać avatara")
    } finally {
      setIsUploadingAvatar(false)
      setSelectedAvatarFile(null)
    }
  }

  const handleAvatarCropCancel = () => {
    setShowAvatarCropper(false)
    setSelectedAvatarFile(null)
  }

  const handleRemoveAvatar = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          image: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove avatar")
      }

      setUserData((prev) => ({ ...prev, image: null }))

      // Zaktualizuj sesję NextAuth z triggerem "update"
      await update({
        image: null,
      })

      toast.success("Avatar został usunięty")
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast.error("Nie udało się usunąć avatara")
    }
  }

  const handleSaveUserData = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingUser(true)

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          image: userData.image,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user data")
      }

      // Zaktualizuj sesję NextAuth z triggerem "update"
      await update({
        name: userData.name,
        image: userData.image,
      })

      toast.success("Dane osobowe zostały zaktualizowane")
    } catch (error) {
      console.error("Error saving user data:", error)
      toast.error("Nie udało się zapisać danych osobowych")
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)

    try {
      const response = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      toast.success("Ustawienia zostały zaktualizowane")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast.success("Konto zostało usunięte")
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Nie udało się usunąć konta")
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie ustawień...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 pb-12 overflow-hidden min-h-screen">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Ustawienia"
          subtitle="Zarządzaj swoim kontem eksperta, preferencjami komunikacji oraz bezpieczeństwem sesji."
          titleClassName="text-white text-3xl sm:text-4xl"
        />
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          USTAWIENIA KONTA EKSPERTA
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
        {/* Left Column: Personal info & Account Details */}
        <div className="space-y-6">
          {/* Dane osobowe */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <User className="h-5 w-5 text-[#0da192]" />
                Dane administratora konta
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Uaktualnij podstawowe informacje o swojej tożsamości.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveUserData} className="space-y-6">
                {/* Avatar Upload */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-zinc-300">Zdjęcie profilowe (Avatar)</Label>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    Avatar będzie wyświetlany w menu bocznym oraz w korespondencji z klientami. Zalecany rozmiar: 200x200px.
                  </p>

                  {userData.image ? (
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border/50 bg-card/50 ring-4 ring-[#0da192]/10 shrink-0">
                        <Image
                          src={userData.image}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <label
                          htmlFor="avatar-upload"
                          className={cn(
                            "inline-flex items-center justify-center rounded-xl text-sm font-semibold h-10 px-4 py-2 transition-all border border-border/50 text-white bg-background/50 hover:bg-zinc-800/30 cursor-pointer"
                          )}
                        >
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0da192]" />
                              Przesyłanie...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4 text-[#0da192]" />
                              Zmień avatar
                            </>
                          )}
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl h-10"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                        >
                          <Trash2 className="mr-2 h-4.5 w-4.5" />
                          Usuń avatar
                        </Button>
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileSelect}
                        disabled={isUploadingAvatar}
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <label
                        htmlFor="avatar-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/40 rounded-xl cursor-pointer hover:bg-[#0da192]/5 hover:border-[#0da192]/30 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="h-9 w-9 mb-2 text-[#0da192] animate-spin" />
                              <p className="text-xs text-muted-foreground">Przesyłanie...</p>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-9 w-9 mb-2 text-[#0da192]" />
                              <p className="mb-1 text-xs text-zinc-300">
                                <span className="font-semibold text-[#0da192]">Prześlij</span> avatar
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                PNG, JPG, WEBP (max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileSelect}
                        disabled={isUploadingAvatar}
                      />
                    </div>
                  )}
                </div>

                <Separator className="bg-border/20" />

                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-zinc-300">Imię i nazwisko</Label>
                  <Input
                    id="name"
                    value={userData.name || ""}
                    onChange={(e) => handleUserDataChange("name", e.target.value)}
                    placeholder="Wpisz swoje imię i nazwisko"
                    className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm"
                  />
                </div>

                {/* E-mail (Zablokowana edycja) */}
                <div className="p-4 rounded-xl bg-background/30 border border-border/30 flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Adres e-mail administratora</span>
                    <span className="text-sm font-semibold text-white truncate block">{userData.email}</span>
                  </div>
                  <div title="Edycja adresu e-mail jest zablokowana" className="ml-auto shrink-0 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingUser}
                    className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 gap-2 shrink-0 w-full sm:w-auto"
                  >
                    {isSavingUser ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Zapisz dane osobowe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Zarządzanie kontem */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0da192]" />
                Zarządzanie kontem
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Informacje o bezpieczeństwie i akcje systemowe.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Informacje o koncie */}
              {accountInfo && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Calendar className="h-4 w-4 text-[#0da192]" />
                    Bezpieczeństwo logowania
                  </Label>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-2.5 px-3.5 bg-background/25 border border-border/30 rounded-xl">
                      <span className="text-zinc-400">Data założenia konta:</span>
                      <span className="font-semibold text-white">{formatDateTime(accountInfo.createdAt)}</span>
                    </div>

                    {accountInfo.lastLogin && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 px-3.5 bg-background/25 border border-border/30 rounded-xl">
                        <span className="text-zinc-400">Ostatnie logowanie:</span>
                        <span className="font-semibold text-white text-right">
                          {formatDateTime(accountInfo.lastLogin.date)}
                          {accountInfo.lastLogin.ipAddress && (
                            <span className="text-zinc-500 font-light block sm:inline sm:ml-2">
                              (IP: {accountInfo.lastLogin.ipAddress})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {accountInfo.lastFailedLogin && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2.5 px-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl text-rose-400">
                        <span className="text-rose-400/80">Ostatnie błędne logowanie:</span>
                        <span className="font-bold text-right">
                          {formatDateTime(accountInfo.lastFailedLogin.date)}
                          {accountInfo.lastFailedLogin.ipAddress && (
                            <span className="text-rose-500/70 font-light block sm:inline sm:ml-2">
                              (IP: {accountInfo.lastFailedLogin.ipAddress})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator className="bg-border/20" />

              {/* Status konta */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-zinc-300">Status konta</Label>
                <div className="flex items-center gap-2.5">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 flex items-center gap-1 text-[10px] font-semibold tracking-wide">
                    <CheckCircle2 className="h-3 w-3" />
                    W pełni aktywne
                  </Badge>
                  <p className="text-xs text-muted-foreground font-light">
                    Kancelaria jest zweryfikowana i widoczna w katalogu.
                  </p>
                </div>
              </div>

              <Separator className="bg-border/20" />

              {/* Akcje konta */}
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-zinc-300">Akcje systemowe</Label>

                <div className="space-y-3">
                  {/* Wyloguj */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-background/20 group hover:border-[#0da192]/30 transition-all duration-200">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-sm">Wyloguj się</h4>
                      <p className="text-xs text-muted-foreground font-light mt-0.5">
                        Zakończ bieżącą sesję administratora.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="shrink-0 h-10 px-5 rounded-xl border-border/50 hover:bg-muted text-white gap-2 transition-all"
                    >
                      <LogOut className="h-4 w-4 text-zinc-400" />
                      Wyloguj
                    </Button>
                  </div>

                  {/* Usuń konto */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 group hover:border-rose-500/40 transition-all duration-200">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-rose-400 text-sm">Usuń konto</h4>
                      <p className="text-xs text-muted-foreground/80 font-light mt-0.5">
                        Bezpowrotnie usuń dane i zlikwiduj profil kancelarii.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="shrink-0 h-10 px-5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl gap-2 transition-all"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                          Usuń konto
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border border-border/40 max-w-md rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold font-playfair text-white">Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground text-sm pt-2 leading-relaxed">
                            Ta akcja jest całkowicie nieodwracalna. Wszystkie Twoje dane, profil kancelarii w katalogu,
                            złożone oferty, wiadomości oraz historia zostaną trwale usunięte z bazy danych.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-0 pt-4">
                          <AlertDialogCancel className="border-border/50 hover:bg-muted text-white rounded-xl">Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl border-t border-white/10"
                          >
                            Tak, usuń moje konto
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              <Alert className="bg-[#d7b56d]/5 border-[#d7b56d]/20 text-[#d7b56d] rounded-xl flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <AlertDescription className="text-xs leading-relaxed font-light">
                  Przed trwałym usunięciem konta upewnij się, że zrealizowałeś wszystkie opłacone punkty w portalu.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Login history wrapped in glass card */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0da192]" />
                Historia logowania
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Historia sesji oraz prób autoryzacji na tym koncie.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <LoginHistory noCard />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Powiadomienia & Ustawienia ogłoszenia */}
        <div className="space-y-6">
          {/* Ustawienia powiadomień */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white">Preferencje powiadomień</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Dostosuj formy powiadomień e-mail, SMS oraz dźwiękowych.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Powiadomienia e-mail */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Powiadomienia e-mail</h3>
                  <div className="space-y-3">
                    {/* Kontakt z klientami - obowiązkowe */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/25">
                      <div className="flex-1">
                        <Label
                          htmlFor="kontaktKlienci"
                          className="font-semibold text-zinc-300 text-xs"
                        >
                          Kontakt z klientami
                          <span className="text-rose-500 ml-1">*</span>
                        </Label>
                        <p className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          Ta opcja jest obowiązkowa i niezbędna do obsługi Twoich klientów i ich zgłoszeń.
                        </p>
                      </div>
                      <Switch
                        id="kontaktKlienci"
                        checked={notificationSettings.kontaktKlienci}
                        onCheckedChange={(checked) =>
                          handleSettingChange("kontaktKlienci", checked)
                        }
                        disabled={true}
                      />
                    </div>

                    {/* Kluczowe informacje - obowiązkowe */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/25">
                      <div className="flex-1">
                        <Label
                          htmlFor="kluczowe"
                          className="font-semibold text-zinc-300 text-xs"
                        >
                          Kluczowe informacje
                          <span className="text-rose-500 ml-1">*</span>
                        </Label>
                        <p className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">
                          Powiadomienia o Twoich ofertach, ważnych zmianach w cenniku oraz regulaminach.
                        </p>
                      </div>
                      <Switch
                        id="kluczowe"
                        checked={notificationSettings.kluczowe}
                        onCheckedChange={(checked) => handleSettingChange("kluczowe", checked)}
                        disabled={true}
                      />
                    </div>

                    {/* Wskazówki, porady */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="wskazowkiPorady"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Wskazówki, porady
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Artykuły i porady jak podnieść jakość ofert oraz zwiększyć zasięgi.
                        </p>
                      </div>
                      <Switch
                        id="wskazowkiPorady"
                        checked={notificationSettings.wskazowkiPorady}
                        onCheckedChange={(checked) =>
                          handleSettingChange("wskazowkiPorady", checked)
                        }
                      />
                    </div>

                    {/* Ciekawe oferty i promocje */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="ofertPromocje"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Ciekawe oferty i promocje
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Oferty promocyjne i pakiety punktów stworzone dla Twojej kancelarii.
                        </p>
                      </div>
                      <Switch
                        id="ofertPromocje"
                        checked={notificationSettings.ofertPromocje}
                        onCheckedChange={(checked) =>
                          handleSettingChange("ofertPromocje", checked)
                        }
                      />
                    </div>

                    {/* Przypomnienie o nowych wiadomościach */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="przypomnienieWiadomosci"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Przypomnienie o nowych wiadomościach
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Powiadomienia na skrzynkę e-mail, kiedy klient wyśle nową wiadomość.
                        </p>
                      </div>
                      <Switch
                        id="przypomnienieWiadomosci"
                        checked={notificationSettings.przypomnienieWiadomosci}
                        onCheckedChange={(checked) =>
                          handleSettingChange("przypomnienieWiadomosci", checked)
                        }
                      />
                    </div>

                    {/* Powiadomienie o nowych funkcjach */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="noweFunkcje"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Powiadomienie o nowych funkcjach
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Aktualizacje systemu, nowo wdrożone moduły i integracje.
                        </p>
                      </div>
                      <Switch
                        id="noweFunkcje"
                        checked={notificationSettings.noweFunkcje}
                        onCheckedChange={(checked) =>
                          handleSettingChange("noweFunkcje", checked)
                        }
                      />
                    </div>

                    {/* Powiadomienia o zmianach cenników */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="zmianyCenniki"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Powiadomienia o zmianach cenników
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Informacje o zmianach w cennikach lub taryfach punktów.
                        </p>
                      </div>
                      <Switch
                        id="zmianyCenniki"
                        checked={notificationSettings.zmianyCenniki}
                        onCheckedChange={(checked) =>
                          handleSettingChange("zmianyCenniki", checked)
                        }
                      />
                    </div>

                    {/* Powiadomienia o zmianach regulaminu */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="zmianyRegulamin"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Powiadomienia o zmianach regulaminu
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Zmiany w regulaminie i polityce prywatności serwisu.
                        </p>
                      </div>
                      <Switch
                        id="zmianyRegulamin"
                        checked={notificationSettings.zmianyRegulamin}
                        onCheckedChange={(checked) =>
                          handleSettingChange("zmianyRegulamin", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Kontakt telefoniczny */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Kontakt telefoniczny</h3>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="kontaktDoradca"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Kontakt z doradcą
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Ważne alerty i spersonalizowane oferty wsparcia telefonicznego dla Twojej kancelarii.
                        </p>
                      </div>
                      <Switch
                        id="kontaktDoradca"
                        checked={notificationSettings.kontaktDoradca}
                        onCheckedChange={(checked) =>
                          handleSettingChange("kontaktDoradca", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Dodatkowe */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Ustawienia dodatkowe</h3>
                  <div className="space-y-3">
                    {/* Awatar */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="wyswietlanieAwatara"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Wyświetlanie awatara w katalogu
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Zgoda na pokazywanie zdjęcia profilowego/loga kancelarii w katalogu.
                        </p>
                      </div>
                      <Switch
                        id="wyswietlanieAwatara"
                        checked={notificationSettings.wyswietlanieAwatara}
                        onCheckedChange={(checked) =>
                          handleSettingChange("wyswietlanieAwatara", checked)
                        }
                      />
                    </div>

                    {/* Automatyczne opinie */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="autoProsbOpinie"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Automatyczne prośby o opinie
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Wysyła zapytanie o opinię do klienta po zakończeniu realizacji sprawy.
                        </p>
                      </div>
                      <Switch
                        id="autoProsbOpinie"
                        checked={notificationSettings.autoProsbOpinie}
                        onCheckedChange={(checked) =>
                          handleSettingChange("autoProsbOpinie", checked)
                        }
                      />
                    </div>

                    {/* Dźwięk powiadomienia */}
                    <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                      <div className="flex-1">
                        <Label
                          htmlFor="powiadomienieDzwiekowe"
                          className="cursor-pointer font-semibold text-white text-xs"
                        >
                          Dźwięk powiadomień na czacie
                        </Label>
                        <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                          Odtwórz dźwięk ostrzegawczy po otrzymaniu nowej wiadomości.
                        </p>
                      </div>
                      <Switch
                        id="powiadomienieDzwiekowe"
                        checked={notificationSettings.powiadomienieDzwiekowe}
                        onCheckedChange={(checked) =>
                          handleSettingChange("powiadomienieDzwiekowe", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSavingSettings}
                    className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 gap-2 shrink-0 w-full sm:w-auto"
                  >
                    {isSavingSettings ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Zapisz ustawienia
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Box ustawienia ogłoszenia */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white">Ustawienia ogłoszeń & URLOP</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Skonfiguruj statusy wyświetlania ofert i powiadomień SMS.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                {/* Statusy ogłoszenia */}
                <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                  <div className="flex-1">
                    <Label
                      htmlFor="ustawieniaOgloszenia"
                      className="cursor-pointer font-semibold text-white text-xs"
                    >
                      Ustawienia widoczności
                    </Label>
                    <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                      Zezwalaj na składanie ofert bezpośrednich na profilu kancelarii.
                    </p>
                  </div>
                  <Switch
                    id="ustawieniaOgloszenia"
                    checked={notificationSettings.ustawieniaOgloszenia}
                    onCheckedChange={(checked) =>
                      handleSettingChange("ustawieniaOgloszenia", checked)
                    }
                  />
                </div>

                <Separator className="bg-border/20" />

                {/* Powiadomienia SMS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Powiadomienia SMS</h4>
                  <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                    <div className="flex-1">
                      <Label
                        htmlFor="powiadomieniaSmNowa"
                        className="cursor-pointer font-semibold text-white text-xs"
                      >
                        Powiadomienia o nowych wiadomościach (SMS)
                      </Label>
                      <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                        Wyślij SMS na numer komórkowy po otrzymaniu nowej wiadomości.
                      </p>
                    </div>
                    <Switch
                      id="powiadomieniaSmNowa"
                      checked={notificationSettings.powiadomieniaSmNowa}
                      onCheckedChange={(checked) =>
                        handleSettingChange("powiadomieniaSmNowa", checked)
                      }
                    />
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Wiadomości zbiorcze */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Wiadomości zbiorcze</h4>
                  <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                    <div className="flex-1">
                      <Label
                        htmlFor="wiadomosciZbiorcze"
                        className="cursor-pointer font-semibold text-white text-xs"
                      >
                        Otrzymywanie raportów zbiorczych
                      </Label>
                      <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                        Grupuj e-maile z powiadomieniami w jeden dobowy raport.
                      </p>
                    </div>
                    <Switch
                      id="wiadomosciZbiorcze"
                      checked={notificationSettings.wiadomosciZbiorcze}
                      onCheckedChange={(checked) =>
                        handleSettingChange("wiadomosciZbiorcze", checked)
                      }
                    />
                  </div>
                </div>

                <Separator className="bg-border/20" />

                {/* Tryb urlopowy */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Tryb urlopowy</h4>
                  <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-[#d7b56d]/30 bg-[#d7b56d]/5 hover:bg-[#d7b56d]/10 transition-all duration-200">
                    <div className="flex-1">
                      <Label
                        htmlFor="urlop"
                        className="cursor-pointer font-semibold text-[#d7b56d] text-xs"
                      >
                        Tryb urlopowy (Status zawieszony)
                      </Label>
                      <p className="text-[10px] text-[#d7b56d]/80 mt-1 font-light leading-relaxed">
                        Wyłącz widoczność w katalogu na czas nieobecności i zablokuj powiadomienia e-mail/SMS.
                      </p>
                    </div>
                    <Switch
                      id="urlop"
                      checked={notificationSettings.urlop}
                      onCheckedChange={(checked) =>
                        handleSettingChange("urlop", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedAvatarFile && (
        <ImageCropper
          image={selectedAvatarFile}
          aspectRatio={1}
          onCropComplete={handleAvatarCropComplete}
          onCancel={handleAvatarCropCancel}
          open={showAvatarCropper}
        />
      )}
    </div>
  )
}
