import dotenv from "dotenv"
import { google } from "googleapis"
import http from "http"
import { URL } from "url"

dotenv.config()

const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET
const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google"

if (!clientId || !clientSecret) {
  console.error("❌ Error: AUTH_GOOGLE_ID (lub GOOGLE_CLIENT_ID) i AUTH_GOOGLE_SECRET (lub GOOGLE_CLIENT_SECRET) muszą być ustawione w .env")
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
)

// Pełny dostęp do Drive (upload, listowanie, usuwanie starych backupów przy retencji).
const SCOPES = ["https://www.googleapis.com/auth/drive"]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
})

console.log("\n==========================================================")
console.log("🔑 Google Drive OAuth2 Refresh Token Generator (backupy)")
console.log("==========================================================\n")
console.log(`Używany Redirect URI: ${redirectUri}`)
console.log("\n1. Otwórz poniższy link w przeglądarce i zaloguj się na konto Google,")
console.log("   którego 15GB miejsca na Dysku ma być używane do backupów:\n")
console.log(`👉 ${authUrl}\n`)
console.log("----------------------------------------------------------")
console.log("ℹ️ Jeśli widzisz błąd 'redirect_uri_mismatch':")
console.log("   W Google Cloud Console (APIs & Services > Credentials > Twoje OAuth 2.0 Client ID):")
console.log(`   Upewnij się, że w sekcji 'Authorized redirect URIs' dodany jest adres:`)
console.log(`   ${redirectUri}`)
console.log("----------------------------------------------------------\n")
console.log("Czekam na autoryzację z przeglądarki na porcie 3000...")

const port = 3000
const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || "", `http://localhost:${port}`)
    const code = reqUrl.searchParams.get("code")

    if (code) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      res.end("<h1>✅ Autoryzacja udana! Możesz zamknąć tę kartę i wrócić do terminala.</h1>")

      console.log("\nOtrzymano kod autoryzacji z Google!")
      const { tokens } = await oauth2Client.getToken(code)

      console.log("\n==========================================================")
      console.log("✅ SUKCES! Otrzymano Refresh Token:")
      console.log("==========================================================\n")
      console.log(`GOOGLE_DRIVE_REFRESH_TOKEN="${tokens.refresh_token}"\n`)
      console.log("Dodaj powyższy wiersz do .env na serwerze i zrestartuj aplikację (pm2 reload --update-env).")
      console.log("==========================================================\n")

      server.close()
      process.exit(0)
    } else {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" })
      res.end("<h1>Brak kodu autoryzacji w żądaniu.</h1>")
    }
  } catch (err: any) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" })
    res.end(`<h1>Błąd: ${err.message}</h1>`)
    console.error("❌ Błąd pobierania tokenu:", err.message || err)
    server.close()
    process.exit(1)
  }
})

server.listen(port, () => {
  // Server ready
}).on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.log(`\n⚠️ Port ${port} jest obecnie zajęty przez inną aplikację (np. dev server).`)
    console.log("Zatrzymaj ją na chwilę (Ctrl+C) i uruchom ten skrypt ponownie.")
    process.exit(1)
  }
})
