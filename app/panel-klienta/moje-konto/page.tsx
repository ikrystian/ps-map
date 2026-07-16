"use client"

import { NOTIFICATION_SETTINGS_CHANGED_EVENT } from "@/components/MessageNotificationSound"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Bell, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function ClientAccountPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Pobierz ustawienia powiadomień
  useEffect(() => {
    if (!session?.user?.id) return
    let active = true
    fetch("/api/notification-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (active && settings) {
          setSoundEnabled(!!settings.powiadomienieDzwiekowe)
        }
      })
      .catch((error) => {
        console.error("Error fetching notification settings:", error)
        if (active) toast.error("Nie udało się pobrać ustawień powiadomień")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [session?.user?.id])

  const handleSoundToggle = async (checked: boolean) => {
    const previous = soundEnabled
    setSoundEnabled(checked)
    setIsSaving(true)

    try {
      const response = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ powiadomienieDzwiekowe: checked }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      // Powiadom globalny odtwarzacz dźwięku o zmianie ustawień (bez przeładowania)
      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_SETTINGS_CHANGED_EVENT, {
          detail: { powiadomienieDzwiekowe: checked },
        })
      )

      toast.success(
        checked
          ? "Dźwięk powiadomień został włączony"
          : "Dźwięk powiadomień został wyłączony"
      )
    } catch (error) {
      console.error("Error saving notification settings:", error)
      setSoundEnabled(previous)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Moje Konto"
          subtitle="Zarządzaj ustawieniami swojego konta oraz preferencjami bezpieczeństwa."
          titleClassName="text-white text-3xl sm:text-4xl"
        />
      </motion.div>

      {/* Powiadomienia */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10"
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="font-playfair text-white text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Powiadomienia
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Ustaw sposób, w jaki chcesz być informowany o nowych zdarzeniach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ładowanie ustawień...
              </div>
            ) : (
              <div className="flex items-start justify-between space-x-4 p-3.5 rounded-xl border border-border/30 bg-background/10 hover:bg-background/20 transition-all duration-200">
                <div className="flex-1">
                  <Label
                    htmlFor="powiadomienieDzwiekowe"
                    className="cursor-pointer font-semibold text-white text-xs"
                  >
                    Dźwięk powiadomień na czacie
                  </Label>
                  <p className="text-sm text-zinc-400 mt-1 font-light leading-relaxed">
                    Odtwórz dźwięk ostrzegawczy po otrzymaniu nowej wiadomości.
                  </p>
                </div>
                <Switch
                  id="powiadomienieDzwiekowe"
                  checked={soundEnabled}
                  disabled={isSaving}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
