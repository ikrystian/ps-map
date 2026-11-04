import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Copy, MapPin, Share2, X } from "lucide-react"
import { useDeferredValue, useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import { Button, Card, Chips, Field, PageHeader, Section } from "@/components/ui"
import { api } from "@/lib/api"
import { matchesPhrase } from "@/lib/format"
import { CASE_TYPE_LABEL } from "@/lib/labels"
import { copyText, shareLink } from "@/lib/native"
import { useCategories } from "@/lib/queries"
import type { Category, City } from "@/lib/types"

const MAX_MESSAGE_LENGTH = 500
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type CaseType = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA"
type FormErrors = Partial<Record<"categories" | "city" | "email", string>>

export function NewReferralPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()

  const [caseType, setCaseType] = useState<CaseType>("OSOBA_PRYWATNA")
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [categorySearch, setCategorySearch] = useState("")
  const [city, setCity] = useState<City | null>(null)
  const [citySearch, setCitySearch] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  const deferredCitySearch = useDeferredValue(citySearch.trim())
  const { data: cities } = useQuery({
    queryKey: ["cities", deferredCitySearch],
    queryFn: () => api<City[]>(`/api/cities?search=${encodeURIComponent(deferredCitySearch)}`),
    enabled: !city && deferredCitySearch.length >= 2,
  })

  // Kategorie są rozdzielone na prywatne i firmowe — typ sprawy wybiera gałąź
  const available = useMemo(() => {
    const target = caseType === "OSOBA_PRYWATNA" ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE"
    return (categories ?? []).filter((category) => category.aktywna && category.typ === target)
  }, [categories, caseType])

  const categoryMatches = useMemo(() => {
    if (categorySearch.trim().length < 2) return []
    const chosen = new Set(selectedCategories.map((category) => category.id))
    return available
      .filter((category) => !chosen.has(category.id) && matchesPhrase(category.nazwa, categorySearch))
      .slice(0, 8)
  }, [available, categorySearch, selectedCategories])

  const submit = useMutation({
    mutationFn: () =>
      api<{ link: string }>("/api/case-referrals", {
        method: "POST",
        body: {
          email: email.trim(),
          typSprawy: caseType,
          categoryIds: selectedCategories.map((category) => category.id),
          cityId: city!.id,
          nazwaSprawy: name.trim() || undefined,
          wiadomosc: message.trim() || undefined,
        },
      }),
    onSuccess: ({ link }) => {
      void queryClient.invalidateQueries({ queryKey: ["referrals"] })
      setCreatedLink(link)
    },
    onError: toast.error,
  })

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const found: FormErrors = {}
    if (selectedCategories.length === 0) found.categories = "Wybierz przynajmniej jedną kategorię"
    if (!city) found.city = "Wybierz miasto z listy"
    if (!EMAIL_REGEX.test(email.trim())) found.email = "Podaj poprawny adres e-mail klienta"
    setErrors(found)
    if (Object.keys(found).length === 0) submit.mutate()
    else toast.error("Uzupełnij zaznaczone pola")
  }

  if (createdLink) return <ReferralSent link={createdLink} />

  return (
    <Screen
      refreshable={false}
      header={<PageHeader title="Poleć sprawę" back="/sprawy/polecenia" />}
      footer={
        <Button className="w-full" loading={submit.isPending} onClick={() => handleSubmit()}>
          Wyślij polecenie
        </Button>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Section title="Zakres sprawy">
          <Card className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Typ sprawy</p>
              <Chips
                wrap
                label="Typ sprawy"
                value={caseType}
                onChange={(value) => {
                  setCaseType(value)
                  setSelectedCategories([])
                }}
                options={Object.entries(CASE_TYPE_LABEL).map(([value, label]) => ({ value: value as CaseType, label }))}
              />
            </div>

            <Field label="Kategorie" error={errors.categories}>
              {(props) => (
                <input
                  {...props}
                  type="search"
                  enterKeyHint="search"
                  placeholder="Wpisz nazwę kategorii…"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              )}
            </Field>
            {categoryMatches.length > 0 && (
              <ul className="-mt-1 divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
                {categoryMatches.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategories((chosen) => [...chosen, category])
                        setCategorySearch("")
                        setErrors((prev) => ({ ...prev, categories: undefined }))
                      }}
                      className="flex min-h-11 w-full items-center px-3.5 py-2 text-left text-sm transition-colors active:bg-muted"
                    >
                      {category.nazwa}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {selectedCategories.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      aria-label={`Usuń kategorię ${category.nazwa}`}
                      onClick={() => setSelectedCategories((chosen) => chosen.filter((other) => other.id !== category.id))}
                      className="flex min-h-9 items-center gap-1.5 rounded-full bg-accent px-3 text-[13px] font-medium text-accent-foreground active:opacity-70"
                    >
                      {category.nazwa}
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Field label="Miasto" error={errors.city}>
              {(props) => (
                <input
                  {...props}
                  type="search"
                  enterKeyHint="search"
                  placeholder="Wpisz nazwę miasta…"
                  value={city ? city.nazwa : citySearch}
                  onChange={(e) => {
                    setCity(null)
                    setCitySearch(e.target.value)
                  }}
                />
              )}
            </Field>
            {!city && !!cities?.length && (
              <ul className="-mt-1 max-h-64 divide-y divide-border/70 overflow-y-auto overscroll-contain rounded-xl border border-border">
                {cities.slice(0, 12).map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCity(option)
                        setErrors((prev) => ({ ...prev, city: undefined }))
                      }}
                      className="flex min-h-11 w-full items-center gap-2 px-3.5 py-1.5 text-left text-sm transition-colors active:bg-muted"
                    >
                      <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{option.nazwa}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {option.county?.nazwa ?? option.voivodeship?.nazwa}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Section>

        <Section title="Klient">
          <Card className="space-y-3">
            <Field label="E-mail klienta" error={errors.email}>
              {(props) => (
                <input
                  {...props}
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                />
              )}
            </Field>
            <Field label="Nazwa sprawy (opcjonalnie)">
              {(props) => <input {...props} enterKeyHint="next" value={name} onChange={(e) => setName(e.target.value)} />}
            </Field>
            <Field label="Wiadomość do klienta (opcjonalnie)" hint={`${message.length} / ${MAX_MESSAGE_LENGTH} znaków`}>
              {(props) => (
                <textarea
                  {...props}
                  rows={4}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              )}
            </Field>
          </Card>
        </Section>
      </form>
    </Screen>
  )
}

function ReferralSent({ link }: { link: string }) {
  const toast = useToast()
  const navigate = useNavigate()

  const copy = () => copyText(link).then(() => toast.success("Link skopiowany do schowka"), toast.error)
  const share = async () => {
    try {
      const result = await shareLink({ title: "Dokończ zgłoszenie sprawy", url: link })
      if (result === "copied") toast.success("Link skopiowany do schowka")
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <Screen
      refreshable={false}
      header={<PageHeader title="Polecenie wysłane" back="/sprawy/polecenia" />}
      footer={
        <Button className="w-full" onClick={() => navigate("/sprawy/polecenia", { replace: true })}>
          Wróć do poleceń
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-8 text-success" aria-hidden />
        </span>
        <h2 className="font-serif text-xl font-semibold">Link jest już u klienta</h2>
        <p className="text-sm text-muted-foreground">Wysłaliśmy klientowi link do założenia konta i dokończenia zgłoszenia.</p>
      </div>
      <Card className="space-y-3">
        <p className="break-all rounded-lg bg-muted p-3 font-mono text-xs">{link}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="soft" size="sm" onClick={() => void share()}>
            <Share2 className="size-4" aria-hidden />
            Udostępnij
          </Button>
          <Button variant="outline" size="sm" onClick={() => void copy()}>
            <Copy className="size-4" aria-hidden />
            Kopiuj
          </Button>
        </div>
      </Card>
    </Screen>
  )
}
