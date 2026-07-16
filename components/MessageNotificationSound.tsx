"use client"

import { getSocket } from "@/lib/socket-client"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

/**
 * Zdarzenie rozgłaszane po zapisie ustawień powiadomień — pozwala zaktualizować
 * stan dźwięku bez przeładowania strony (layouty paneli nie remontują się przy nawigacji).
 */
export const NOTIFICATION_SETTINGS_CHANGED_EVENT = "notification-settings:changed"

/**
 * Globalny odtwarzacz dźwięku powiadomień o nowych wiadomościach.
 * Montowany w layoutach panelu klienta i eksperta, dzięki czemu dźwięk działa
 * na każdej podstronie panelu, nie tylko na stronie wiadomości.
 *
 * Odtwarza /sounds/notification.mp3 po zdarzeniu "message:notify" (Socket.IO),
 * o ile użytkownik włączył opcję "powiadomienieDzwiekowe".
 */
export function MessageNotificationSound() {
  const { data: session, status } = useSession()
  const enabledRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const unlockedRef = useRef(false)

  // Pobierz ustawienie dźwięku i nasłuchuj jego zmian (zapis w ustawieniach)
  useEffect(() => {
    if (status !== "authenticated") return
    let active = true

    const loadSetting = () => {
      fetch("/api/notification-settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((settings) => {
          if (active && settings) {
            enabledRef.current = !!settings.powiadomienieDzwiekowe
          }
        })
        .catch(() => {
          // W razie błędu zostaw wartość domyślną (wyłączony)
        })
    }

    const handleSettingsChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (typeof detail?.powiadomienieDzwiekowe === "boolean") {
        enabledRef.current = detail.powiadomienieDzwiekowe
      } else {
        loadSetting()
      }
    }

    loadSetting()
    window.addEventListener(NOTIFICATION_SETTINGS_CHANGED_EVENT, handleSettingsChanged)
    return () => {
      active = false
      window.removeEventListener(NOTIFICATION_SETTINGS_CHANGED_EVENT, handleSettingsChanged)
    }
  }, [status])

  // Przygotuj element audio i odblokuj odtwarzanie przy pierwszym geście użytkownika.
  // Przeglądarki blokują autoplay do czasu interakcji — ciche play/pause po pierwszym
  // kliknięciu/klawiszu zdejmuje tę blokadę dla późniejszych powiadomień.
  useEffect(() => {
    const audio = new Audio("/sounds/notification.mp3")
    audio.preload = "auto"
    audioRef.current = audio

    const unlock = () => {
      if (unlockedRef.current) return
      audio.muted = true
      audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.muted = false
          unlockedRef.current = true
          window.removeEventListener("pointerdown", unlock)
          window.removeEventListener("keydown", unlock)
        })
        .catch(() => {
          audio.muted = false
        })
    }

    window.addEventListener("pointerdown", unlock)
    window.addEventListener("keydown", unlock)
    return () => {
      window.removeEventListener("pointerdown", unlock)
      window.removeEventListener("keydown", unlock)
      audioRef.current = null
    }
  }, [])

  // Nasłuchuj nowych wiadomości na współdzielonym sockecie
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return

    const socket = getSocket()
    const handleMessageNotify = () => {
      const audio = audioRef.current
      if (!enabledRef.current || !audio) return
      audio.currentTime = 0
      audio.play().catch((error) => {
        console.warn("Nie udało się odtworzyć dźwięku powiadomienia:", error)
      })
    }

    socket.on("message:notify", handleMessageNotify)
    return () => {
      socket.off("message:notify", handleMessageNotify)
    }
  }, [status, session?.user?.id])

  return null
}
