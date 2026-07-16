"use client"

// Pomocnicze funkcje dla natywnych powiadomień przeglądarkowych (Web Notifications API)

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

/** Poproś o zgodę na powiadomienia, jeśli użytkownik jeszcze nie zdecydował. */
export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isNotificationSupported()) return null
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission()
    } catch {
      return null
    }
  }
  return Notification.permission
}

interface BrowserNotificationOptions {
  title: string
  body: string
  /** Adres, na który przenosi kliknięcie w powiadomienie */
  url?: string | null
  /** Powiadomienia z tym samym tagiem nadpisują się zamiast piętrzyć */
  tag?: string
}

/** Wyświetl powiadomienie przeglądarkowe (tylko jeśli użytkownik zezwolił). */
export function showBrowserNotification({ title, body, url, tag }: BrowserNotificationOptions) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return

  try {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag,
    })

    notification.onclick = () => {
      window.focus()
      if (url) {
        window.location.href = url
      }
      notification.close()
    }
  } catch (error) {
    console.error("Błąd wyświetlania powiadomienia przeglądarkowego:", error)
  }
}
