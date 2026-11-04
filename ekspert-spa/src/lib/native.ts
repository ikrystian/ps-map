import { App } from "@capacitor/app"
import { Browser } from "@capacitor/browser"
import { Capacitor } from "@capacitor/core"
import { Directory, Filesystem } from "@capacitor/filesystem"
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics"
import { Share } from "@capacitor/share"
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin"

export const isNative = Capacitor.isNativePlatform()
export const isAndroid = Capacitor.getPlatform() === "android"

/** Sekret w Keychain/Keystore na urządzeniu; w przeglądarce (praca nad UI) w localStorage. */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    if (!isNative) return localStorage.getItem(key)
    // Wtyczka odrzuca obietnicę, gdy klucza nie ma
    return SecureStoragePlugin.get({ key })
      .then(({ value }) => value)
      .catch(() => null)
  },
  async set(key: string, value: string) {
    if (!isNative) return localStorage.setItem(key, value)
    await SecureStoragePlugin.set({ key, value })
  },
  async remove(key: string) {
    if (!isNative) return localStorage.removeItem(key)
    await SecureStoragePlugin.remove({ key }).catch(() => undefined)
  },
}

export function openExternal(url: string) {
  return Browser.open({ url, toolbarColor: "#20201d" })
}

/** Wywołuje `callback` po powrocie z przeglądarki płatności lub z tła aplikacji. */
export function onReturnToApp(callback: () => void): () => void {
  if (!isNative) {
    window.addEventListener("focus", callback)
    return () => window.removeEventListener("focus", callback)
  }

  const listeners = [
    Browser.addListener("browserFinished", callback),
    App.addListener("resume", callback),
  ]
  return () => listeners.forEach((listener) => listener.then((handle) => handle.remove()))
}

/** Zgłasza przejście aplikacji do tła (`false`) i powrót na pierwszy plan (`true`). */
export function watchAppVisibility(callback: (visible: boolean) => void): () => void {
  if (!isNative) {
    const notify = () => callback(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", notify)
    return () => document.removeEventListener("visibilitychange", notify)
  }

  const listeners = [
    App.addListener("pause", () => callback(false)),
    App.addListener("resume", () => callback(true)),
    // Na iOS przeglądarka płatności nie usypia aplikacji, więc nie będzie zdarzenia „resume”
    Browser.addListener("browserFinished", () => callback(true)),
  ]
  return () => listeners.forEach((listener) => listener.then((handle) => handle.remove()))
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve((reader.result as string).split(",")[1])
    reader.readAsDataURL(blob)
  })
}

/** Zapisuje plik: w aplikacji przez systemowy arkusz udostępniania, w przeglądarce jako pobranie. */
export async function saveFile(blob: Blob, filename: string) {
  if (!isNative) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    return
  }

  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: await toBase64(blob),
    directory: Directory.Cache,
  })
  await Share.share({ files: [uri], title: filename }).catch(ignoreShareCancel)
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

// Zamknięcie arkusza udostępniania bez wyboru odrzuca obietnicę, ale nie jest błędem
function ignoreShareCancel(error: unknown) {
  if (!(error instanceof Error && /cancel/i.test(error.message))) throw error
}

/** Systemowy arkusz udostępniania; gdy go nie ma, kopiuje adres do schowka. */
export async function shareLink(options: { title: string; text?: string; url: string }): Promise<"shared" | "copied"> {
  const { value: canShare } = await Share.canShare()
  if (!canShare) {
    await copyText(options.url)
    return "copied"
  }
  await Share.share(options).catch(ignoreShareCancel)
  return "shared"
}

type HapticKind = "light" | "medium" | "success" | "warning" | "error"

const NOTIFICATION_TYPE = {
  success: NotificationType.Success,
  warning: NotificationType.Warning,
  error: NotificationType.Error,
}

/** Delikatna odpowiedź dotykowa; poza urządzeniem nic nie robi. */
export function haptic(kind: HapticKind = "light") {
  if (!isNative) return
  const feedback =
    kind === "light" || kind === "medium"
      ? Haptics.impact({ style: kind === "light" ? ImpactStyle.Light : ImpactStyle.Medium })
      : Haptics.notification({ type: NOTIFICATION_TYPE[kind] })
  void feedback.catch(() => undefined)
}

const backHandlers: (() => void)[] = []

/** Otwarty arkusz przechwytuje sprzętowy przycisk „wstecz”, zanim cofnie się ekran. */
export function pushBackHandler(handler: () => void): () => void {
  backHandlers.push(handler)
  return () => {
    const index = backHandlers.lastIndexOf(handler)
    if (index !== -1) backHandlers.splice(index, 1)
  }
}

export function runBackHandler(): boolean {
  const handler = backHandlers.at(-1)
  handler?.()
  return !!handler
}

export function onAndroidBack(callback: () => void): () => void {
  if (!isAndroid) return () => undefined
  const listener = App.addListener("backButton", callback)
  return () => void listener.then((handle) => handle.remove())
}

export function minimizeApp() {
  return App.minimizeApp()
}

export async function getAppVersion(): Promise<string | null> {
  if (!isNative) return null
  const { version, build } = await App.getInfo()
  return `${version} (${build})`
}

const KEYBOARD_MIN_HEIGHT = 140

/**
 * Oznacza <html data-keyboard="open">, gdy klawiatura ekranowa zabiera część widoku. Działa bez
 * wtyczki, bo i Android, i iOS (resize: native) zmniejszają wtedy visualViewport.
 */
export function watchKeyboard() {
  const viewport = window.visualViewport
  if (!viewport) return

  let fullHeight = viewport.height
  let width = viewport.width

  viewport.addEventListener("resize", () => {
    // Obrót ekranu też zmienia wysokość, ale razem z szerokością
    if (viewport.width !== width) {
      width = viewport.width
      fullHeight = viewport.height
    }
    fullHeight = Math.max(fullHeight, viewport.height)
    const open = fullHeight - viewport.height > KEYBOARD_MIN_HEIGHT
    if (open) document.documentElement.dataset.keyboard = "open"
    else delete document.documentElement.dataset.keyboard
  })

  // Pole przykryte klawiaturą przewijamy w środek widocznej części ekranu
  document.addEventListener("focusin", (event) => {
    const field = event.target
    if (!(field instanceof HTMLElement) || !field.matches("input, select, textarea")) return
    if (!field.closest("[data-screen-scroll]")) return
    setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), 320)
  })
}
