import "@fontsource/playfair-display/latin-ext-600.css"
import "@fontsource/playfair-display/latin-600.css"
import "@fontsource/poppins/latin-ext-400.css"
import "@fontsource/poppins/latin-400.css"
import "@fontsource/poppins/latin-ext-500.css"
import "@fontsource/poppins/latin-500.css"
import "@fontsource/poppins/latin-ext-600.css"
import "@fontsource/poppins/latin-600.css"
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { ToastProvider } from "./components/toast"
import { ApiError } from "./lib/api"
import { AuthProvider } from "./lib/auth"
import { watchAppVisibility, watchKeyboard } from "./lib/native"
import { initTheme } from "./lib/theme"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: (failureCount, error) => error instanceof ApiError && error.status === 0 && failureCount < 2,
      // W trybie domyślnym zapytanie czeka offline na sieć, a ekran wczytuje się bez końca
      networkMode: "always",
      refetchOnReconnect: true,
    },
    mutations: { networkMode: "always" },
  },
})

// Powrót z tła odświeża oglądane dane, a w tle staje odpytywanie czatu i listy rozmów.
// Stan zgłaszamy jawnie: przy „resume” WebView bywa jeszcze ukryty, a menedżer reaguje tylko
// na zmianę, stąd `false` przed `true`.
focusManager.setEventListener((setFocused) =>
  watchAppVisibility((visible) => {
    setFocused(false)
    if (visible) setFocused(true)
  })
)
initTheme()
watchKeyboard()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
