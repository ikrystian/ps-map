"use client"

import { useCallback, useEffect } from "react"

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_RECAPCHA_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY ||
  process.env.GOOGLE_RECAPCHA_KEY ||
  "6LciQGMtAAAAAJi1UM1J6DMg4a4KOJl4fgKL3R0a"

export function loadRecaptchaScript(): void {
  if (typeof window === "undefined") return
  const siteKey = RECAPTCHA_SITE_KEY
  if (!siteKey) return

  const scriptId = "google-recaptcha-v3-script"
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script")
    script.id = scriptId
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    document.head.appendChild(script)
  }
}

export async function executeRecaptchaToken(action: string): Promise<string | null> {
  if (typeof window === "undefined") return null
  const siteKey = RECAPTCHA_SITE_KEY
  if (!siteKey) {
    console.warn("reCAPTCHA site key is missing")
    return null
  }

  loadRecaptchaScript()

  return new Promise((resolve) => {
    let attempts = 0
    const checkAndExecute = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action })
            resolve(token)
          } catch (err) {
            console.error("reCAPTCHA execution error:", err)
            resolve(null)
          }
        })
      } else {
        attempts++
        if (attempts > 30) {
          console.warn("reCAPTCHA script failed to load within timeout")
          resolve(null)
        } else {
          setTimeout(checkAndExecute, 100)
        }
      }
    }

    checkAndExecute()
  })
}

export function useRecaptcha() {
  useEffect(() => {
    loadRecaptchaScript()
  }, [])

  const execute = useCallback((action: string) => {
    return executeRecaptchaToken(action)
  }, [])

  return { executeRecaptcha: execute, siteKey: RECAPTCHA_SITE_KEY }
}
