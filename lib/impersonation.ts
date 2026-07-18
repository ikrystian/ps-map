import { SignJWT, jwtVerify } from "jose"

// Krótko żyjący, podpisany token przekazujący komu admin chce się "wcielić".
// Token jest podpisywany po stronie serwera dopiero PO weryfikacji sesji administratora,
// dlatego nie da się go sfałszować z poziomu klienta.

const ISSUER = "ps-map:impersonation"
const TOKEN_TTL = "2m" // token jest jednorazowy i natychmiast wymieniany na sesję

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("Brak AUTH_SECRET/NEXTAUTH_SECRET w środowisku")
  }
  return new TextEncoder().encode(secret)
}

export interface ImpersonationTokenPayload {
  /** ID użytkownika, w którego wciela się administrator */
  targetUserId: string
  /**
   * ID administratora inicjującego impersonację. `null` oznacza powrót do
   * pierwotnego konta administratora (zakończenie impersonacji).
   */
  impersonatorId: string | null
}

export async function signImpersonationToken(
  payload: ImpersonationTokenPayload
): Promise<string> {
  return new SignJWT({ impersonatorId: payload.impersonatorId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.targetUserId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey())
}

export async function verifyImpersonationToken(
  token: string
): Promise<ImpersonationTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
    })
    if (!payload.sub) return null
    const impersonatorId =
      typeof payload.impersonatorId === "string" ? payload.impersonatorId : null
    return { targetUserId: payload.sub, impersonatorId }
  } catch {
    return null
  }
}
