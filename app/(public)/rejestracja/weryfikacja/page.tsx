"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function VerificationPage() {
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === "loading") return

        if (status === "unauthenticated") {
            router.push("/logowanie")
            return
        }

        if (status === "authenticated") {
            // Check for stored registration intent
            const role = localStorage.getItem("registration_role")

            if (role === "CLIENT") {
                router.push("/rejestracja/klient")
            } else if (role === "LAW_FIRM") {
                router.push("/rejestracja/kancelaria")
            } else {
                // Default fallback if no specific registration flow was started
                // Check user role to decide where to go
                if (session.user?.role === "CLIENT") {
                    router.push("/panel-klienta")
                } else if (session.user?.role === "LAW_FIRM") {
                    router.push("/panel-kancelarii")
                } else {
                    router.push("/")
                }
            }
        }
    }, [status, router, session])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Weryfikacja...</p>
            </div>
        </div>
    )
}
