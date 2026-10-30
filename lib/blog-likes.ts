import { createHmac } from "crypto"
import { Prisma } from "@prisma/client"
import { getClientIp } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

// Polecenia wpisów bloga. Czytelnik jest identyfikowany kontem (gdy zalogowany) albo — gdy nie —
// zahashowanym adresem IP. Surowego IP nie zapisujemy; HMAC z sekretem aplikacji nie pozwala
// odtworzyć adresu z bazy (przestrzeń IPv4 jest zbyt mała na zwykły skrót SHA).

/** Czytelnik, który poleca wpis: dokładnie jedno z pól jest ustawione. */
export type LikeViewer = { userId: string; ipHash: null } | { userId: null; ipHash: string }

/** Doliczanie poleceń do zapytań o listy wpisów — wynik mapuje `withLikeCount`. */
export const BLOG_LIKE_COUNT_INCLUDE = { _count: { select: { likes: true } } } as const

/** Zamienia `_count.likes` na płaskie pole `polecenia` używane przez panele. */
export function withLikeCount<T extends { _count: { likes: number } }>(post: T) {
  const { _count, ...rest } = post
  return { ...rest, polecenia: _count.likes }
}

function hashIp(ip: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("Brak AUTH_SECRET — nie można zahashować adresu IP")
  // IPv4 zmapowane do IPv6 (::ffff:1.2.3.4) to ten sam czytelnik co 1.2.3.4
  return createHmac("sha256", secret).update(ip.replace(/^::ffff:/i, "")).digest("hex")
}

/**
 * Ustala, kim jest czytelnik. Zalogowany — po koncie; niezalogowany — po IP.
 * Zwraca null, gdy IP nie da się ustalić (brak nagłówków proxy), bo wszyscy
 * anonimowi czytelnicy współdzieliliby wtedy jedno polecenie.
 */
export function resolveLikeViewer(request: Request, userId?: string | null): LikeViewer | null {
  if (userId) return { userId, ipHash: null }
  const ip = getClientIp(request)
  if (ip === "unknown") return null
  return { userId: null, ipHash: hashIp(ip) }
}

function viewerWhere(postId: string, viewer: LikeViewer) {
  return viewer.userId ? { postId, userId: viewer.userId } : { postId, ipHash: viewer.ipHash }
}

export async function getLikeState(postId: string, viewer: LikeViewer | null) {
  const [count, own] = await Promise.all([
    prisma.blogPostLike.count({ where: { postId } }),
    viewer ? prisma.blogPostLike.findFirst({ where: viewerWhere(postId, viewer), select: { id: true } }) : null,
  ])
  return { count, liked: Boolean(own) }
}

/** Dodaje polecenie; powtórne polecenie przez tego samego czytelnika jest ignorowane (idempotentne). */
export async function addLike(postId: string, viewer: LikeViewer) {
  const where =
    viewer.userId !== null
      ? { postId_userId: { postId, userId: viewer.userId } }
      : { postId_ipHash: { postId, ipHash: viewer.ipHash } }

  try {
    // upsert zamiast create — zwykłe powtórne polecenie nie kończy się błędem (i wpisem w logu Prismy)
    await prisma.blogPostLike.upsert({
      where,
      create: { postId, userId: viewer.userId, ipHash: viewer.ipHash },
      update: {},
    })
  } catch (error) {
    // Wyścig dwóch równoczesnych żądań — unikalny indeks i tak chroni przed duplikatem
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error
  }
}

export async function removeLike(postId: string, viewer: LikeViewer) {
  await prisma.blogPostLike.deleteMany({ where: viewerWhere(postId, viewer) })
}
