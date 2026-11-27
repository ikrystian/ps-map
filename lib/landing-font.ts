import { Inter } from "next/font/google"

// Landingi (dla-prawnika, dla-eksperta) korzystają z Intera — reszta aplikacji z Poppinsa.
// Jedna wspólna instancja zamiast dwóch identycznych wywołań Inter() w różnych modułach.
export const inter = Inter({
    subsets: ["latin", "latin-ext"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
})
