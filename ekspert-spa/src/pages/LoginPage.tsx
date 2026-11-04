import { useRef, useState, type FormEvent } from "react"
import { BrandBackdrop } from "@/components/BrandBackdrop"
import { Button, Field, PasswordInput } from "@/components/ui"
import { API_URL } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { haptic, openExternal } from "@/lib/native"

const SHAKE_FRAMES = ["0", "-6px", "5px", "-3px", "0"].map((x) => ({ transform: `translateX(${x})` }))

export function LoginPage() {
  const { login } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas logowania")
      setSubmitting(false)
      haptic("error")
      formRef.current?.animate(SHAKE_FRAMES, { duration: 320 })
    }
  }

  return (
    <BrandBackdrop>
      <div className="pt-safe relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className="hide-on-keyboard flex flex-1 flex-col justify-end px-7 pb-7 pt-8">
          <img src="/logo-dark.svg" alt="Prosta Sprawa" className="mb-auto h-8 self-start" />
          <h1 className="mt-8 font-serif text-[32px] font-semibold leading-tight">Panel eksperta</h1>
          <p className="mt-1.5 text-[15px] text-white/75">Sprawy, konsultacje i rozmowy z klientami zawsze pod ręką.</p>
        </div>

        <div className="pb-safe-5 rounded-t-[28px] bg-surface px-6 pt-7 text-foreground [[data-keyboard=open]_&]:flex-1">
          <div className="mx-auto w-full max-w-sm">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Field label="E-mail">
                {(props) => (
                  <input
                    {...props}
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Hasło">
                {(props) => (
                  <PasswordInput
                    {...props}
                    autoComplete="current-password"
                    enterKeyHint="go"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                )}
              </Field>
              <Button type="submit" loading={submitting} className="w-full">
                Zaloguj się
              </Button>
            </form>

            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={() => void openExternal(`${API_URL}/moje-konto/lost-password`)}
                className="min-h-11 font-medium text-primary"
              >
                Nie pamiętasz hasła?
              </button>
              <button
                type="button"
                onClick={() => void openExternal(`${API_URL}/rejestracja/ekspert`)}
                className="min-h-11 text-muted-foreground"
              >
                Załóż konto
              </button>
            </div>
          </div>
        </div>
      </div>
    </BrandBackdrop>
  )
}
