import { Metadata } from "next"
import CategoriesClientPage from "./CategoriesClientPage"
import { getCategoriesList } from "@/lib/categories"

export const metadata: Metadata = {
  title: "Kategorie Spraw Prawnych - Specjalizacje",
  description: "Przeglądaj wszystkie specjalizacje prawne. Znajdź ekspertów od prawa cywilnego, rodzinnego, karnego, pracy, gospodarczego i wielu innych.",
}

export default async function CategoriesPage() {
  const categories = await getCategoriesList()

  return <CategoriesClientPage initialCategories={categories} />
}
