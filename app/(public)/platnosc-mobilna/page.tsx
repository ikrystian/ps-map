import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Płatność | Prosta Sprawa",
  robots: { index: false, follow: false },
}

// Strona powrotu z płatności zainicjowanej w aplikacji mobilnej eksperta
export default async function MobilePaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const isFailure = status === "blad"

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-playfair text-2xl font-bold text-foreground">
        {isFailure ? "Płatność nie powiodła się" : "Dziękujemy za płatność"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Zamknij to okno, aby wrócić do aplikacji Prosta Sprawa
        {isFailure ? " i spróbować ponownie." : " — status zamówienia odświeży się automatycznie."}
      </p>
    </div>
  )
}
