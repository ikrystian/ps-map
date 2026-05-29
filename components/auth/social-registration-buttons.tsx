"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa"

interface SocialRegistrationButtonsProps {
    role: "CLIENT" | "LAW_FIRM"
    disabled?: boolean
}

export function SocialRegistrationButtons({ role, disabled }: SocialRegistrationButtonsProps) {
    const handleSocialLogin = (provider: string) => {
        // Save the intended role to localStorage so we can redirect correctly after login
        if (typeof window !== "undefined") {
            localStorage.setItem("registration_role", role)
        }

        // Redirect to verification page which will route back to registration
        signIn(provider, { callbackUrl: "/rejestracja/weryfikacja" })
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Lub zarejestruj się przez
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => handleSocialLogin("google")}
                    disabled={disabled}
                >
                    <FaGoogle className="h-5 w-5" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => handleSocialLogin("facebook")}
                    disabled={disabled}
                >
                    <FaFacebook className="h-5 w-5" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => handleSocialLogin("apple")}
                    disabled={disabled}
                >
                    <FaApple className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
