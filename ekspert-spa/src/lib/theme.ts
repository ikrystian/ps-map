import { SystemBars, SystemBarsStyle } from "@capacitor/core"
import { useSyncExternalStore } from "react"
import { isNative } from "./native"

export type ThemeMode = "system" | "light" | "dark"

const STORAGE_KEY = "ps-ekspert-theme"
const DEFAULT_MODE: ThemeMode = "dark"
const THEME_COLOR = { light: "#f5f7f6", dark: "#20201d" }

const darkScheme = window.matchMedia("(prefers-color-scheme: dark)")
const listeners = new Set<() => void>()

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "light" || stored === "dark" || stored === "system" ? stored : DEFAULT_MODE
  } catch {
    return DEFAULT_MODE
  }
}

let mode = readMode()

function resolved(): "light" | "dark" {
  if (mode !== "system") return mode
  return darkScheme.matches ? "dark" : "light"
}

/** Ikony paska stanu; ekrany na ciemnym tle marki wymuszają jasne także w jasnym motywie. */
export function setStatusBarStyle(style: "light" | "dark") {
  if (!isNative) return
  void SystemBars.setStyle({ style: style === "dark" ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => undefined)
}

export function syncStatusBar() {
  setStatusBarStyle(resolved())
}

function apply() {
  const theme = resolved()
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme])
  syncStatusBar()
}

export function initTheme() {
  apply()
  darkScheme.addEventListener("change", () => {
    if (mode === "system") apply()
  })
}

function setThemeMode(next: ThemeMode) {
  mode = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Prywatny tryb bez localStorage: motyw obowiązuje do końca sesji
  }
  apply()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function useThemeMode() {
  return [useSyncExternalStore(subscribe, () => mode), setThemeMode] as const
}
