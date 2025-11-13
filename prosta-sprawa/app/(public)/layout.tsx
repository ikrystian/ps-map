import PublicHeader from "@/components/PublicHeader"
import PublicFooter from "@/components/PublicFooter"
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
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />
      <main className="flex-1 pt-[65px]">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
