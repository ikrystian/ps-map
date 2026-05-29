import PublicFooter from "@/components/PublicFooter"
import PublicHeader from "@/components/PublicHeader"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Fetch law firm data if user is a law firm
  let punktySaldo: number | undefined

  if (session?.user?.role === "LAW_FIRM") {
    try {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { punktySaldo: true },
      })
      punktySaldo = lawFirm?.punktySaldo
    } catch (error) {
      console.error("Error fetching law firm data:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary-foreground">
      <PublicHeader
        isAuthenticated={!!session}
        userRole={session?.user?.role as "CLIENT" | "LAW_FIRM" | "ADMIN" | null}
        userName={session?.user?.name}
        userImage={session?.user?.image}
        punktySaldo={punktySaldo}
      />
      <main className="flex-1 pt-[65px]">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
