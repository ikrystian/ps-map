export { handlers, signIn, signOut, auth, authOptions } from "@/auth"

import { auth } from "@/auth"

export const getCurrentUser = async () => {
  const session = await auth()
  return session?.user
}
