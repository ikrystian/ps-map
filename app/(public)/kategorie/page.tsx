import { Metadata } from "next"
import CategoriesClientPage from "./CategoriesClientPage"

export const metadata: Metadata = {
  title: "Kategorie Spraw Prawnych - Specjalizacje | Prosta Sprawa",
  description: "Przeglądaj wszystkie specjalizacje prawne. Znajdź ekspertów od prawa cywilnego, rodzinnego, karnego, pracy, gospodarczego i wielu innych.",
}

export default function CategoriesPage() {
  return <CategoriesClientPage />
}
