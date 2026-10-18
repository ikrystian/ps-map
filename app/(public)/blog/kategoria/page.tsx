import { permanentRedirect } from "next/navigation"

// Sam prefiks bez kategorii nie ma własnej treści
export default function BlogCategoryIndexPage() {
  permanentRedirect("/blog")
}
