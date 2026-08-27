import { redirect } from "next/navigation"

// Dodawanie sprawy przeniosło się pod publiczny /dodaj-sprawe (dostępny też bez
// logowania — konto zakłada się na ostatnim kroku). Ta trasa zostaje jako
// przekierowanie ze względu na stare zakładki/linki (m.in. w mailu powitalnym
// i na linkach polecających), z zachowaniem query stringa (np. ?referral=).
export default async function ClientAddCaseRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value)
    } else if (Array.isArray(value) && value.length > 0) {
      query.set(key, value[0])
    }
  }

  const queryString = query.toString()
  redirect(`/dodaj-sprawe${queryString ? `?${queryString}` : ""}`)
}
