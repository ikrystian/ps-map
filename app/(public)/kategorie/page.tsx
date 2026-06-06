import { Metadata } from "next"
import CategoriesClientPage from "./CategoriesClientPage"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Kategorie Spraw Prawnych - Specjalizacje",
  description: "Przeglądaj wszystkie specjalizacje prawne. Znajdź ekspertów od prawa cywilnego, rodzinnego, karnego, pracy, gospodarczego i wielu innych.",
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground animate-pulse font-medium">Przygotowujemy kategorie dla Ciebie...</p>
        </div>
      </div>
    }>
      <CategoriesClientPage />
    </Suspense>
  )
}
