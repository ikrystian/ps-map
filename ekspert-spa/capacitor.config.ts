import type { CapacitorConfig } from "@capacitor/cli"

// Live reload na urządzeniu: CAP_SERVER_URL=http://<ip-komputera>:5173 bunx cap run android
const serverUrl = process.env.CAP_SERVER_URL

const config: CapacitorConfig = {
  appId: "pl.prostasprawa.ekspert",
  appName: "Prosta Sprawa Ekspert",
  webDir: "dist",
  // Kolor ekranu startowego — bez niego WebView mignie na biało przed pierwszym malowaniem
  backgroundColor: "#20201d",
  // Układ przewijają własne kontenery; przewijany dokument przesuwałby nagłówek przy klawiaturze
  ios: { scrollEnabled: false },
  plugins: {
    Keyboard: { resize: "native" },
    SystemBars: { initialViewportFitValueHint: "cover" },
  },
  ...(serverUrl && { server: { url: serverUrl, cleartext: true } }),
}

export default config
