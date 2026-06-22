import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context"

// Funkcja pomocnicza do pobierania lokalizacji z IP
async function getLocation(ip: string): Promise<string | null> {
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("::ffff:127.0.0.1")
  ) {
    return "Lokalny (Localhost)"
  }
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 1000) // 1s timeout
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal })
    clearTimeout(id)
    if (res.ok) {
      const data = await res.json()
      if (data.city && data.country_name) {
        return `${data.city}, ${data.country_name}`
      }
    }
  } catch (e) {
    // try fallback
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 1000)
      const res = await fetch(`https://freeipapi.com/api/json/${ip}`, { signal: controller.signal })
      clearTimeout(id)
      if (res.ok) {
        const data = await res.json()
        if (data.cityName && data.countryName) {
          return `${data.cityName}, ${data.countryName}`
        }
      }
    } catch (err) {
      console.error("Error fetching location from fallback IP API:", err)
    }
    console.error("Error fetching location from IP API:", e)
  }
  return null
}

export async function logLoginAttempt({
  userId,
  success,
}: {
  userId: string
  success: boolean
}) {
  try {
    let userAgent = null
    let ipAddress = null

    try {
      const reqHeaders = await headers()
      userAgent = reqHeaders.get("user-agent") || null
      ipAddress = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || null
    } catch (e) {
      if (isDynamicServerError(e)) {
        throw e
      }
      console.warn("Could not retrieve headers in logLoginAttempt:", e)
    }

    let location = null
    if (ipAddress) {
      location = await getLocation(ipAddress)
    }

    await prisma.loginHistory.create({
      data: {
        userId,
        success,
        ipAddress,
        userAgent,
        location,
      },
    })
  } catch (error) {
    console.error("Error writing to login history:", error)
  }
}
