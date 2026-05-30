import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationSettings } from "../types"

interface AdminNotificationSettingsCardProps {
  notificationSettings: NotificationSettings | null
}

export function AdminNotificationSettingsCard({
  notificationSettings,
}: AdminNotificationSettingsCardProps) {
  if (!notificationSettings) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia powiadomień użytkownika</CardTitle>
        <CardDescription>Dane tylko do odczytu - użytkownik zarządza nimi w swoim panelu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Powiadomienia e-mail</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.kontaktKlienci ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Kontakt z klientami</span>
                {notificationSettings.kontaktKlienci && <span className="text-xs text-muted-foreground">(obowiązkowe)</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.kluczowe ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Informacje kluczowe</span>
                {notificationSettings.kluczowe && <span className="text-xs text-muted-foreground">(obowiązkowe)</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.wskazowkiPorady ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Wskazówki i porady</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.ofertPromocje ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Oferty i promocje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.przypomnienieWiadomosci ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Przypomnienia o wiadomościach</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.noweFunkcje ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Nowe funkcje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.zmianyCenniki ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Zmiany cenników</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.zmianyRegulamin ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Zmiany regulaminu</span>
              </div>
            </div>
          </div>

          {/* Phone Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Kontakt telefoniczny</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.kontaktDoradca ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Kontakt z doradcą</span>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Ustawienia dodatkowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.wyswietlanieAwatara ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Wyświetlanie awatara</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.autoProsbOpinie ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Automatyczna prośba o opinie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.powiadomienieDzwiekowe ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Powiadomienia dźwiękowe</span>
              </div>
            </div>
          </div>

          {/* Announcement Settings */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Ustawienia ogłoszeń</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.ustawieniaOgloszenia ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Ustawienia ogłoszenia aktywne</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.powiadomieniaSmNowa ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Powiadomienia SMS o nowych sprawach</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${notificationSettings.wiadomosciZbiorcze ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Wiadomości zbiorcze</span>
              </div>
            </div>
          </div>

          {/* Vacation Mode */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Tryb urlopowy</h3>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${notificationSettings.urlop ? "bg-amber-500" : "bg-gray-300"}`} />
              <span className="text-sm font-medium">{notificationSettings.urlop ? "Tryb urlopowy AKTYWNY" : "Tryb urlopowy nieaktywny"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
