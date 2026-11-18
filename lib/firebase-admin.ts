import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getMessaging, type Messaging, type MulticastMessage } from "firebase-admin/messaging"
import { prisma } from "@/lib/prisma"

let firebaseApp: App | null = null
let messagingInstance: Messaging | null = null
let hasLoggedConfigWarning = false

/**
 * Inicjalizuje lub pobiera instancję Firebase Admin App.
 * Obsługuje konfigurację przez:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (pełny JSON)
 * 2. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 * 3. GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_PATH (ścieżka do pliku)
 *
 * Gdy brak konfiguracji (np. w środowisku developerskim przed dodaniem kluczy),
 * funkcja zwraca null i loguje ostrzeżenie zamiast rzucać błędem.
 */
export function getFirebaseAdminApp(): App | null {
  if (firebaseApp) return firebaseApp

  const existingApps = getApps()
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0]
    return firebaseApp
  }

  // 1. Sprawdź FIREBASE_SERVICE_ACCOUNT_KEY (jako string JSON)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson)
      firebaseApp = initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || process.env.FIREBASE_PROJECT_ID,
      })
      return firebaseApp
    } catch (err) {
      console.error("[FCM] Błąd parsowania FIREBASE_SERVICE_ACCOUNT_KEY:", err)
    }
  }

  // 2. Sprawdź pojedyncze zmienne
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (projectId && clientEmail && privateKey) {
    // Klucz prywatny w zmiennej środowiskowej często ma znaki \n zamiast rzeczywistych nowolinii
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n")
    }

    try {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      })
      return firebaseApp
    } catch (err) {
      console.error("[FCM] Błąd inicjalizacji Firebase z klucza prywatnego:", err)
    }
  }

  // 3. Sprawdź ścieżkę do pliku z poświadczeniami
  const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credentialsPath) {
    try {
      firebaseApp = initializeApp({
        projectId: projectId || undefined,
      })
      return firebaseApp
    } catch (err) {
      console.error("[FCM] Błąd inicjalizacji Firebase ze ścieżki poświadczeń:", err)
    }
  }

  if (!hasLoggedConfigWarning) {
    console.warn(
      "[FCM] Firebase Admin nie został skonfigurowany. Ustaw zmienne FIREBASE_PROJECT_ID, " +
      "FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY lub FIREBASE_SERVICE_ACCOUNT_KEY w .env, " +
      "aby powiadomienia push działały."
    )
    hasLoggedConfigWarning = true
  }

  return null
}

export function getFirebaseMessaging(): Messaging | null {
  if (messagingInstance) return messagingInstance
  const app = getFirebaseAdminApp()
  if (!app) return null
  messagingInstance = getMessaging(app)
  return messagingInstance
}

export interface PushNotificationPayload {
  title: string
  body: string
  linkUrl?: string | null
  typ?: string
  data?: Record<string, string>
}

export interface SendPushResult {
  success: boolean
  sentCount: number
  failedCount: number
  error?: string
}

/**
 * Wysyła powiadomienie push do zarejestrowanych tokenów FCM konkretnego użytkownika.
 * Usuwa z bazy przeterminowane / nieprawidłowe tokeny zgłoszone przez FCM.
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<SendPushResult> {
  // Pobierz aktywne tokeny urządzenia dla tego usera
  const deviceTokens = await prisma.pushDeviceToken.findMany({
    where: { userId },
    select: { id: true, token: true, platform: true },
  })

  if (!deviceTokens.length) {
    return { success: true, sentCount: 0, failedCount: 0 }
  }

  const tokens = deviceTokens.map((d) => d.token)
  return sendPushNotificationToTokens(tokens, payload)
}

/**
 * Wysyła powiadomienie push do listy tokenów FCM.
 */
export async function sendPushNotificationToTokens(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<SendPushResult> {
  const messaging = getFirebaseMessaging()
  if (!messaging) {
    return {
      success: false,
      sentCount: 0,
      failedCount: tokens.length,
      error: "Firebase messaging nie jest skonfigurowany",
    }
  }

  if (!tokens.length) {
    return { success: true, sentCount: 0, failedCount: 0 }
  }

  const dataPayload: Record<string, string> = {
    title: payload.title,
    body: payload.body,
    linkUrl: payload.linkUrl || "",
    typ: payload.typ || "",
    ...(payload.data || {}),
  }

  const message: MulticastMessage = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: dataPayload,
    android: {
      priority: "high",
      notification: {
        channelId: "default",
        sound: "default",
        defaultSound: true,
        defaultVibrateTimings: true,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
          contentAvailable: true,
        },
      },
    },
  }

  try {
    const response = await messaging.sendEachForMulticast(message)

    // Wykrywanie nieaktywnych / odinstalowanych tokenów i ich automatyczne usuwanie
    const invalidTokens: string[] = []
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        const code = resp.error.code
        // Tokeny nieprawidłowe lub wyrejestrowane po usunięciu aplikacji
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[idx])
        } else {
          console.warn(`[FCM] Błąd wysyłania do tokenu ${tokens[idx].slice(0, 10)}...:`, resp.error.message)
        }
      }
    })

    if (invalidTokens.length > 0) {
      await prisma.pushDeviceToken
        .deleteMany({
          where: { token: { in: invalidTokens } },
        })
        .catch((err) => {
          console.error("[FCM] Błąd czyszczenia nieprawidłowych tokenów:", err)
        })
    }

    return {
      success: response.successCount > 0,
      sentCount: response.successCount,
      failedCount: response.failureCount,
    }
  } catch (error) {
    console.error("[FCM] Błąd podczas wysyłania powiadomień push:", error)
    return {
      success: false,
      sentCount: 0,
      failedCount: tokens.length,
      error: error instanceof Error ? error.message : "Nieznany błąd wysyłania",
    }
  }
}
