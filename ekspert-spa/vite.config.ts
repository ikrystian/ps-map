import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Czysta logika współdzielona z głównym projektem (formatowanie, etykiety, cennik punktów)
      "@shared": fileURLToPath(new URL("../lib", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: { allow: [".."] },
  },
})
