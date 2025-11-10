import PublicHeader from "@/components/PublicHeader"
import { auth } from "@/lib/auth"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader
        isAuthenticated={!!session}
        userRole={session?.user?.role as "CLIENT" | "LAW_FIRM" | "ADMIN" | null}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
