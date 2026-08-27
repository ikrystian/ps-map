"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BorderBeam } from "@/components/ui/border-beam"
import { PhoneVerificationDialog } from "@/components/auth"
import { CaseTypeStep } from "@/components/sprawy/steps/CaseTypeStep"
import { CaseDescriptionStep } from "@/components/sprawy/steps/CaseDescriptionStep"
import { CaseCategoryLocationStep } from "@/components/sprawy/steps/CaseCategoryLocationStep"
import { CaseScheduleBudgetStep } from "@/components/sprawy/steps/CaseScheduleBudgetStep"
import {
  type CaseDraftData,
  type CaseType,
  type FileAttachment,
  caseDraftStepFieldOrder,
  getCaseDraftStepErrors,
  initialCaseDraftData,
} from "@/components/sprawy/case-draft-types"
import { getBrowserTelemetry } from "@/lib/rodo-audit"
import { useRecaptcha } from "@/lib/recaptcha-client"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Share2,
  Sparkles,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type PreferredContact = "EMAIL" | "TELEFON" | "OBA"

interface ContactState {
  imieNazwiskoSession: string
  imie: string
  nazwisko: string
  nazwaFirmy: string
  telefonKontakt: string
  preferowanyKontakt: PreferredContact | ""
  akceptujeKlauzule: boolean
}

interface AccountState {
  email: string
  adres: string
  kodPocztowy: string
  password: string
  confirmPassword: string
  zgodaRegulamin: boolean
  zgodaNewsletter: boolean
  zgodaMarketing: boolean
}

const initialContact: ContactState = {
  imieNazwiskoSession: "",
  imie: "",
  nazwisko: "",
  nazwaFirmy: "",
  telefonKontakt: "",
  preferowanyKontakt: "EMAIL",
  akceptujeKlauzule: false,
}

const initialAccount: AccountState = {
  email: "",
  adres: "",
  kodPocztowy: "",
  password: "",
  confirmPassword: "",
  zgodaRegulamin: false,
  zgodaNewsletter: false,
  zgodaMarketing: false,
}

const DRAFT_DATA_KEY = "dodaj_sprawe_draft_data"
const DRAFT_STEP_KEY = "dodaj_sprawe_draft_step"

const stepContainerVariants = {
  hidden: { opacity: 0, x: 15 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.25, ease: "easeIn" as const } },
}

export default function DodajSprawaClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const { executeRecaptcha } = useRecaptcha()

  const isAuthed = sessionStatus === "authenticated" && session?.user?.role === "CLIENT"
  const totalSteps = isAuthed ? 5 : 6

  const [ignoreReferral, setIgnoreReferral] = useState(false)
  const referralTokenParam = searchParams.get("referral")
  const referralToken = ignoreReferral ? null : referralTokenParam
  const [referralInfo, setReferralInfo] = useState<{ ekspert: string; wiadomosc: string | null } | null>(null)
  const [referralAccountExists, setReferralAccountExists] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const hasAppliedSessionClamp = useRef(false)

  const [caseData, setCaseData] = useState<CaseDraftData>(initialCaseDraftData)
  const [contact, setContact] = useState<ContactState>(initialContact)
  const [account, setAccount] = useState<AccountState>(initialAccount)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [selectedCityName, setSelectedCityName] = useState("")
  const [accountCityOptions, setAccountCityOptions] = useState<{ id: string; nazwa: string }[]>([])
  const [accountCityId, setAccountCityId] = useState("")
  const [isLoadingAccountCities, setIsLoadingAccountCities] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSuggestingCategories, setIsSuggestingCategories] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{
    uzasadnienie: string
    categories: { id: string; nazwa: string; path: string }[]
  } | null>(null)

  const [showMoreGDPR, setShowMoreGDPR] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  // Konto z tego kreatora nie może się zalogować przed potwierdzeniem e-maila —
  // ten bilet z /api/auth/register pozwala mimo to utworzyć sprawę bez sesji.
  const [caseCreationToken, setCaseCreationToken] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const updateCaseField = <K extends keyof CaseDraftData>(field: K, value: CaseDraftData[K]) => {
    setCaseData((prev) => ({ ...prev, [field]: value }))
    clearError(field as string)
  }

  const updateContactField = <K extends keyof ContactState>(field: K, value: ContactState[K]) => {
    setContact((prev) => ({ ...prev, [field]: value }))
    clearError(field as string)
  }

  const updateAccountField = <K extends keyof AccountState>(field: K, value: AccountState[K]) => {
    setAccount((prev) => ({ ...prev, [field]: value }))
    clearError(field as string)
  }

  const handleAccountPostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, "")
    if (val.length > 5) val = val.slice(0, 5)
    const formatted = val.length > 2 ? `${val.slice(0, 2)}-${val.slice(2)}` : val
    updateAccountField("kodPocztowy", formatted)
  }

  // --- Podpowiedź miasta na podstawie kodu pocztowego wpisanego w Kroku 6 ---
  useEffect(() => {
    const kod = account.kodPocztowy
    if (!/^\d{2}-\d{3}$/.test(kod)) {
      setAccountCityOptions([])
      setAccountCityId("")
      return
    }

    const controller = new AbortController()
    setIsLoadingAccountCities(true)
    fetch(`/api/cities?search=${encodeURIComponent(kod)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const options = Array.isArray(data) ? data.map((c: any) => ({ id: c.id, nazwa: c.nazwa })) : []
        setAccountCityOptions(options)
        setAccountCityId(options.length === 1 ? options[0].id : "")
        clearError("accountMiasto")
      })
      .catch((error) => {
        if (!(error instanceof Error) || error.name !== "AbortError") {
          console.error("Error fetching cities for postal code:", error)
        }
      })
      .finally(() => setIsLoadingAccountCities(false))

    return () => controller.abort()
  }, [account.kodPocztowy])

  const handleSelectCaseType = (value: CaseType) => {
    setCaseData((prev) => ({ ...prev, typSprawy: value, categoryIds: [] }))
    setAiSuggestion(null)
    clearError("typSprawy")
  }

  // --- Persystencja draftu: URL (?step=) + localStorage, żeby przetrwał odświeżenie ---
  useEffect(() => {
    const stepParam = searchParams.get("step")
    const savedStep = localStorage.getItem(DRAFT_STEP_KEY)
    const savedData = localStorage.getItem(DRAFT_DATA_KEY)

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.caseData) setCaseData((prev) => ({ ...prev, ...parsed.caseData }))
        if (parsed.contact) setContact((prev) => ({ ...prev, ...parsed.contact }))
        if (parsed.account) {
          setAccount((prev) => ({ ...prev, ...parsed.account, password: "", confirmPassword: "" }))
        }
        if (parsed.selectedCityName) setSelectedCityName(parsed.selectedCityName)
        if (Array.isArray(parsed.uploadedFiles)) setUploadedFiles(parsed.uploadedFiles)
      } catch (e) {
        console.error("Error loading dodaj-sprawe draft:", e)
      }
    }

    const initialStep = stepParam ? parseInt(stepParam, 10) : savedStep ? parseInt(savedStep, 10) : 1
    if (!Number.isNaN(initialStep) && initialStep >= 1) {
      setCurrentStep(initialStep)
    }

    setIsInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    const { password: _password, confirmPassword: _confirmPassword, ...accountToSave } = account
    localStorage.setItem(
      DRAFT_DATA_KEY,
      JSON.stringify({ caseData, contact, account: accountToSave, selectedCityName, uploadedFiles })
    )
  }, [caseData, contact, account, selectedCityName, uploadedFiles, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    localStorage.setItem(DRAFT_STEP_KEY, String(currentStep))
  }, [currentStep, isInitialized])

  const clearDraftStorage = () => {
    localStorage.removeItem(DRAFT_DATA_KEY)
    localStorage.removeItem(DRAFT_STEP_KEY)
  }

  // Po pomyślnym utworzeniu sprawy: czyścimy zarówno localStorage, jak i stan formularza
  // w pamięci — nawigacja po sukcesie zwykle odmontowuje ten komponent, ale w ścieżce
  // anonimowej (bilet rejestracji) użytkownik może zamknąć dialog sukcesu i zostać na
  // /dodaj-sprawe, więc bez tego zobaczyłby z powrotem wypełniony formularz.
  const resetFormState = () => {
    setCaseData(initialCaseDraftData)
    setContact(initialContact)
    setAccount(initialAccount)
    setUploadedFiles([])
    setSelectedCityName("")
    setAccountCityOptions([])
    setAccountCityId("")
    setAiSuggestion(null)
    setErrors({})
    setCurrentStep(1)
  }

  // Jeśli okaże się, że wchodzimy tu z aktywną sesją CLIENT i zapisanym krokiem 6
  // ("Załóż konto"), pomijamy go — tylko raz, przy pierwszym rozstrzygnięciu sesji,
  // żeby nie cofać użytkownika w trakcie dalszej pracy z formularzem.
  useEffect(() => {
    if (sessionStatus === "loading" || hasAppliedSessionClamp.current) return
    hasAppliedSessionClamp.current = true
    if (isAuthed) {
      setCurrentStep((prev) => Math.min(prev, 5))
    }
  }, [sessionStatus, isAuthed])

  // --- Dane słownikowe ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) setCategories(await response.json())
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // --- Prefill danych kontaktowych i miasta dla już zalogowanego klienta ---
  useEffect(() => {
    if (!isAuthed) return
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/clients/me")
        if (!response.ok) return
        const userData = await response.json()

        setContact((prev) => ({
          ...prev,
          imieNazwiskoSession:
            prev.imieNazwiskoSession || `${userData.imie || ""} ${userData.nazwisko || ""}`.trim(),
          telefonKontakt: prev.telefonKontakt || userData.telefon || "",
        }))

        const userCity = referralToken ? null : userData.miasto?.trim()
        if (!userCity) return

        try {
          const citiesRes = await fetch(`/api/cities?search=${encodeURIComponent(userCity)}`)
          if (!citiesRes.ok) return
          const citiesData = await citiesRes.json()
          if (!Array.isArray(citiesData) || citiesData.length === 0) return

          const matchedCity =
            citiesData.find((c: any) => c.nazwa.toLowerCase() === userCity.toLowerCase()) || citiesData[0]

          setCaseData((prev) => ({
            ...prev,
            cityId: prev.cityId || matchedCity.id,
            voivodeshipId: prev.voivodeshipId || matchedCity.voivodeship?.slug || matchedCity.voivodeshipId || prev.voivodeshipId,
          }))
          setSelectedCityName((prev) => prev || matchedCity.nazwa)
        } catch (cityError) {
          console.error("Error fetching default city for client:", cityError)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed])

  // --- Prefill z linku polecającego (działa bez sesji — patrz GET /api/case-referrals/token/[token]) ---
  useEffect(() => {
    if (!referralToken) return
    const fetchReferral = async () => {
      try {
        const response = await fetch(`/api/case-referrals/token/${referralToken}`)
        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || "Link polecający jest nieaktywny")
          return
        }

        setReferralInfo({ ekspert: data.ekspert?.nazwa || "", wiadomosc: data.wiadomosc || null })
        setReferralAccountExists(Boolean(data.emailZarejestrowany))

        setCaseData((prev) => ({
          ...prev,
          typSprawy: prev.typSprawy || data.typSprawy || "",
          categoryIds:
            prev.categoryIds.length > 0
              ? prev.categoryIds
              : Array.isArray(data.kategorie)
                ? data.kategorie.map((k: any) => k.id)
                : [],
          cityId: prev.cityId || data.miasto?.id || "",
          voivodeshipId: prev.voivodeshipId || data.wojewodztwo?.slug || "",
          nazwaSprawy: prev.nazwaSprawy || data.nazwaSprawy || "",
        }))
        if (data.miasto?.nazwa) setSelectedCityName((prev) => prev || data.miasto.nazwa)

        // `email` (nieukryty) wychodzi tylko zalogowanemu klientowi z pasującym adresem —
        // dla anonimowego wejścia korzystamy z tego wyłącznie do prefillu, nie do walidacji.
        if (data.email && !isAuthed) {
          setAccount((prev) => ({ ...prev, email: prev.email || data.email }))
        }
      } catch (error) {
        console.error("Error fetching referral:", error)
      }
    }
    fetchReferral()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralToken])

  const stepFieldOrder: Record<number, string[]> = {
    ...caseDraftStepFieldOrder,
    5: isAuthed
      ? ["imieNazwiskoSession", "telefonKontakt", "preferowanyKontakt", "akceptujeKlauzule"]
      : ["imie", "nazwisko", "telefonKontakt", "preferowanyKontakt", "akceptujeKlauzule"],
    6: ["email", "adres", "kodPocztowy", "accountMiasto", "password", "confirmPassword", "zgodaRegulamin"],
  }

  const getStepErrors = (step: number): Record<string, string> => {
    if (step >= 1 && step <= 4) {
      return getCaseDraftStepErrors(step as 1 | 2 | 3 | 4, caseData)
    }

    if (step === 5) {
      const stepErrors: Record<string, string> = {}
      if (isAuthed) {
        if (!contact.imieNazwiskoSession.trim()) {
          stepErrors.imieNazwiskoSession = "Podaj imię i nazwisko lub nazwę podmiotu"
        }
      } else {
        if (!contact.imie.trim()) stepErrors.imie = "Podaj imię"
        if (!contact.nazwisko.trim()) stepErrors.nazwisko = "Podaj nazwisko"
      }
      if (!contact.telefonKontakt.trim()) {
        stepErrors.telefonKontakt = "Podaj numer telefonu kontaktowego"
      }
      if (!contact.preferowanyKontakt) {
        stepErrors.preferowanyKontakt = "Wybierz preferowaną formę kontaktu"
      }
      if (!contact.akceptujeKlauzule) {
        stepErrors.akceptujeKlauzule = "Zaakceptuj klauzulę informacyjną i regulamin, aby dodać sprawę"
      }
      return stepErrors
    }

    // Krok 6 — tylko gałąź anonimowa
    const stepErrors: Record<string, string> = {}
    if (!account.email.trim()) {
      stepErrors.email = "Adres email jest wymagany"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      stepErrors.email = "Podaj poprawny adres email"
    }
    if (!account.adres.trim()) {
      stepErrors.adres = "Adres jest wymagany"
    } else if (account.adres.trim().length < 3) {
      stepErrors.adres = "Adres musi mieć co najmniej 3 znaki"
    }
    if (!account.kodPocztowy) {
      stepErrors.kodPocztowy = "Kod pocztowy jest wymagany"
    } else if (!/^\d{2}-\d{3}$/.test(account.kodPocztowy)) {
      stepErrors.kodPocztowy = "Wpisz poprawny kod pocztowy (np. 00-000)"
    } else if (accountCityOptions.length > 1 && !accountCityId) {
      stepErrors.accountMiasto = "Wybierz miasto pasujące do kodu pocztowego"
    }
    if (!account.password) {
      stepErrors.password = "Hasło jest wymagane"
    } else if (account.password.length < 8) {
      stepErrors.password = "Hasło musi mieć co najmniej 8 znaków"
    }
    if (!account.confirmPassword) {
      stepErrors.confirmPassword = "Potwierdzenie hasła jest wymagane"
    } else if (account.password !== account.confirmPassword) {
      stepErrors.confirmPassword = "Hasła nie są identyczne"
    }
    if (!account.zgodaRegulamin) {
      stepErrors.zgodaRegulamin = "Musisz zaakceptować regulamin i politykę prywatności"
    }
    return stepErrors
  }

  const validateStepWithFeedback = (step: number): boolean => {
    const stepErrors = getStepErrors(step)
    setErrors(stepErrors)

    const errorFields = Object.keys(stepErrors)
    if (errorFields.length === 0) return true

    toast.error(
      errorFields.length === 1 ? stepErrors[errorFields[0]] : "Uzupełnij zaznaczone pola, aby przejść dalej"
    )

    const firstErrorField = (stepFieldOrder[step] || errorFields).find((field) => stepErrors[field])
    if (firstErrorField) {
      requestAnimationFrame(() => {
        document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }

    return false
  }

  const handleNext = () => {
    if (validateStepWithFeedback(currentStep)) {
      setErrors({})
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setErrors({})
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // --- Upload załączników (krok 2) — zawsze przez endpoint bez wymogu sesji, żeby
  // wizard zachowywał się identycznie niezależnie od tego, czy user jest zalogowany ---
  const handleFilesSelected = async (files: FileList) => {
    if (uploadedFiles.length + files.length > 5) {
      toast.error("Możesz dodać maksymalnie 5 plików")
      return
    }

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fd = new FormData()
        fd.append("file", file)
        const response = await fetch("/api/cases/draft-attachments", { method: "POST", body: fd })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }
        const data = await response.json()
        return { url: data.url, originalName: data.originalName }
      })

      const newFiles = await Promise.all(uploadPromises)
      setUploadedFiles((prev) => [...prev, ...newFiles])
      updateCaseField("zalaczniki", [...caseData.zalaczniki, ...newFiles.map((f) => f.url)])
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error("Błąd podczas uploadu plików. Spróbuj ponownie.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    const next = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(next)
    updateCaseField("zalaczniki", next.map((f) => f.url))
  }

  // --- AI dobór kategorii (krok 3) ---
  const handleSuggestCategories = async () => {
    setIsSuggestingCategories(true)
    try {
      const response = await fetch("/api/cases/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opisSprawy: caseData.opisSprawy,
          nazwaSprawy: caseData.nazwaSprawy,
          typSprawy: caseData.typSprawy,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Nie udało się automatycznie dobrać kategorii")
        return
      }
      updateCaseField("categoryIds", data.categories.map((cat: { id: string }) => cat.id))
      setAiSuggestion(data)
      toast.success("Kategorie zostały dobrane automatycznie na podstawie opisu sprawy")
    } catch (error) {
      console.error("Error suggesting categories:", error)
      toast.error("Nie udało się automatycznie dobrać kategorii")
    } finally {
      setIsSuggestingCategories(false)
    }
  }

  // --- Utworzenie sprawy (wymaga aktywnej sesji CLIENT — już istniejącej albo
  // świeżo powstałej po rejestracji, patrz submitAnonymousRegistrationAndCase) ---
  const resolveImieNazwisko = () => {
    if (isAuthed) return contact.imieNazwiskoSession
    if (caseData.typSprawy === "OSOBA_PRYWATNA") {
      return `${contact.imie} ${contact.nazwisko}`.trim()
    }
    return contact.nazwaFirmy.trim() || `${contact.imie} ${contact.nazwisko}`.trim()
  }

  const submitCase = (otpCodeValue?: string, tokenOverride?: string | null) => {
    const effectiveToken = tokenOverride ?? caseCreationToken
    return fetch("/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(effectiveToken ? { "x-case-creation-token": effectiveToken } : {}),
      },
      body: JSON.stringify({
        ...caseData,
        oczekiwanyTerminRealizacji: caseData.oczekiwanyTerminRealizacji || null,
        budzetOd: !caseData.doNegocjacji && caseData.budzetOd ? parseFloat(caseData.budzetOd) : null,
        budzetDo: !caseData.doNegocjacji && caseData.budzetDo ? parseFloat(caseData.budzetDo) : null,
        imieNazwisko: resolveImieNazwisko(),
        telefonKontakt: contact.telefonKontakt,
        preferowanyKontakt: contact.preferowanyKontakt,
        akceptujeKlauzule: contact.akceptujeKlauzule,
        ...(referralToken ? { referralToken } : {}),
        ...(otpCodeValue ? { otpCode: otpCodeValue } : {}),
      }),
    })
  }

  const createCaseAfterAuth = async (tokenOverride?: string) => {
    setIsSubmitting(true)
    try {
      const response = await submitCase(undefined, tokenOverride)
      const data = await response.json().catch(() => null)

      if (response.ok && data?.requiresOtp) {
        setOtpCode("")
        setOtpError(null)
        setShowOtpDialog(true)
        toast.success("Wysłaliśmy kod weryfikacyjny na Twój adres email.")
        return
      }

      if (response.ok) {
        clearDraftStorage()
        resetFormState()
        setCreatedCaseId(data.id)
        setShowSuccessDialog(true)
      } else {
        toast.error(data?.error || "Błąd podczas dodawania sprawy")
      }
    } catch (error) {
      console.error("Error submitting case:", error)
      toast.error("Wystąpił błąd podczas dodawania sprawy")
    } finally {
      setIsSubmitting(false)
      setIsSubmittingAccount(false)
    }
  }

  // --- Krok 6 (anonimowo): rejestracja → utworzenie sprawy biletem z rejestracji,
  // bez dodatkowej interakcji użytkownika. Konto NIE loguje się tutaj — dopóki
  // klient nie potwierdzi e-maila, logowanie jest zablokowane (auth.ts), więc
  // sprawa powstaje przy pomocy jednorazowego biletu (caseCreationToken). ---
  const submitAnonymousRegistrationAndCase = async (phoneVerificationToken: string) => {
    setShowPhoneVerification(false)
    setAccountError(null)
    setIsSubmittingAccount(true)

    try {
      const recaptchaToken = await executeRecaptcha("register_client")
      const isBusinessCase = caseData.typSprawy !== "OSOBA_PRYWATNA"

      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          recaptchaToken,
          phoneVerificationToken,
          role: "CLIENT",
          issueCaseCreationTicket: true,
          referralToken: referralToken || undefined,
          telemetry: getBrowserTelemetry(),
          name: contact.nazwaFirmy.trim() || `${contact.imie} ${contact.nazwisko}`.trim(),
          client: {
            clientType: isBusinessCase ? "BUSINESS" : "INDIVIDUAL",
            imie: contact.imie,
            nazwisko: contact.nazwisko,
            telefon: contact.telefonKontakt,
            adres: account.adres,
            kodPocztowy: account.kodPocztowy,
            miasto:
              accountCityOptions.find((c) => c.id === accountCityId)?.nazwa || selectedCityName || null,
            voivodeshipId: caseData.voivodeshipId || null,
            nazwa: isBusinessCase ? contact.nazwaFirmy.trim() || null : null,
            zgodaRegulamin: account.zgodaRegulamin,
            zgodaNewsletter: account.zgodaNewsletter,
            zgodaMarketing: account.zgodaMarketing,
          },
        }),
      })

      const registerData = await registerResponse.json().catch(() => null)

      if (!registerResponse.ok) {
        if (registerData?.error?.includes("inny adres e-mail") && referralToken) {
          setAccountError(
            `${registerData.error} Możesz też kontynuować bez wcześniejszego polecenia.`
          )
        } else {
          setAccountError(registerData?.error || "Wystąpił błąd podczas rejestracji")
        }
        setIsSubmittingAccount(false)
        return
      }

      if (!registerData?.caseCreationToken) {
        setAccountError(
          "Konto zostało utworzone, ale nie udało się dokończyć dodawania sprawy. Potwierdź adres e-mail i zaloguj się, aby dodać sprawę ponownie."
        )
        setIsSubmittingAccount(false)
        return
      }

      setCaseCreationToken(registerData.caseCreationToken)
      await createCaseAfterAuth(registerData.caseCreationToken)
    } catch (error) {
      console.error("Error during registration + case creation:", error)
      setAccountError("Wystąpił błąd podczas rejestracji")
      setIsSubmittingAccount(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStepWithFeedback(currentStep)) return

    if (isAuthed) {
      await createCaseAfterAuth()
      return
    }

    setShowPhoneVerification(true)
  }

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) return

    setIsVerifyingOtp(true)
    setOtpError(null)
    try {
      const response = await submitCase(otpCode.trim())
      const data = await response.json().catch(() => null)

      if (response.ok && !data?.requiresOtp) {
        setShowOtpDialog(false)
        clearDraftStorage()
        resetFormState()
        setCreatedCaseId(data.id)
        setShowSuccessDialog(true)
        return
      }

      if (data?.otpExpired) {
        setOtpError("Kod wygasł. Wyślij nowy kod.")
      } else if (data?.invalidOtp) {
        setOtpError("Nieprawidłowy kod weryfikacyjny.")
      } else {
        setOtpError(data?.error || "Nie udało się zweryfikować kodu.")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setOtpError("Wystąpił błąd podczas weryfikacji kodu.")
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResendingOtp(true)
    setOtpError(null)
    try {
      const response = await submitCase()
      const data = await response.json().catch(() => null)

      if (response.ok && data?.requiresOtp) {
        setOtpCode("")
        toast.success("Wysłaliśmy nowy kod weryfikacyjny.")
      } else {
        setOtpError(data?.error || "Nie udało się wysłać nowego kodu.")
      }
    } catch (error) {
      console.error("Error resending OTP:", error)
      setOtpError("Nie udało się wysłać nowego kodu.")
    } finally {
      setIsResendingOtp(false)
    }
  }

  const stepTitles: Record<number, string> = {
    1: "Krok 1: Typ sprawy",
    2: "Krok 2: Opis i szczegóły",
    3: "Krok 3: Kategoria i lokalizacja",
    4: "Krok 4: Harmonogram i budżet",
    5: "Krok 5: Kontakt",
    6: "Krok 6: Załóż konto",
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div key={step} className="flex items-center flex-1 last:flex-initial">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-300 relative shrink-0",
                  isCompleted
                    ? "border-transparent bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-primary/10 text-white shadow-md shadow-primary/30 animate-pulse"
                      : "border-border/40 bg-background-sec/20 text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : step}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "mx-1 sm:mx-2 h-0.5 flex-1 rounded-full transition-all duration-300",
                    step < currentStep ? "bg-primary" : "bg-border/30",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-primary">
          {stepTitles[currentStep]}
        </h3>
      </div>
    </div>
  )

  const renderContactStep = () => (
    <div className="space-y-5">
      {isAuthed ? (
        <div id="field-imieNazwiskoSession">
          <Label htmlFor="imieNazwiskoSession" className="text-muted-foreground text-xs font-semibold">
            Imię i nazwisko / Nazwa podmiotu *
          </Label>
          <Input
            id="imieNazwiskoSession"
            value={contact.imieNazwiskoSession}
            onChange={(e) => updateContactField("imieNazwiskoSession", e.target.value)}
            placeholder="Jan Kowalski"
          />
          {errors.imieNazwiskoSession && (
            <p className="text-xs text-destructive mt-1">{errors.imieNazwiskoSession}</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-imie">
              <Label htmlFor="imie" className="text-muted-foreground text-xs font-semibold">
                Imię *
              </Label>
              <Input
                id="imie"
                value={contact.imie}
                onChange={(e) => updateContactField("imie", e.target.value)}
                placeholder="Jan"
              />
              {errors.imie && <p className="text-xs text-destructive mt-1">{errors.imie}</p>}
            </div>
            <div id="field-nazwisko">
              <Label htmlFor="nazwisko" className="text-muted-foreground text-xs font-semibold">
                Nazwisko *
              </Label>
              <Input
                id="nazwisko"
                value={contact.nazwisko}
                onChange={(e) => updateContactField("nazwisko", e.target.value)}
                placeholder="Kowalski"
              />
              {errors.nazwisko && <p className="text-xs text-destructive mt-1">{errors.nazwisko}</p>}
            </div>
          </div>

          {caseData.typSprawy !== "OSOBA_PRYWATNA" && (
            <div>
              <Label htmlFor="nazwaFirmy" className="text-muted-foreground text-xs font-semibold">
                Nazwa firmy / organizacji (opcjonalnie)
              </Label>
              <Input
                id="nazwaFirmy"
                value={contact.nazwaFirmy}
                onChange={(e) => updateContactField("nazwaFirmy", e.target.value)}
                placeholder="Nazwa Sp. z o.o."
              />
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div id="field-telefonKontakt">
          <Label htmlFor="telefonKontakt" className="text-muted-foreground text-xs font-semibold">
            Numer telefonu *
          </Label>
          <Input
            id="telefonKontakt"
            type="tel"
            value={contact.telefonKontakt}
            onChange={(e) => updateContactField("telefonKontakt", e.target.value)}
            placeholder="+48 123 456 789"
          />
          {errors.telefonKontakt && (
            <p className="text-xs text-destructive mt-1">{errors.telefonKontakt}</p>
          )}
        </div>
      </div>

      <div id="field-preferowanyKontakt">
        <Label htmlFor="preferowanyKontakt" className="text-muted-foreground text-xs font-semibold">
          Preferowana forma kontaktu *
        </Label>
        <Select
          value={contact.preferowanyKontakt}
          onValueChange={(value) => updateContactField("preferowanyKontakt", value as PreferredContact)}
        >
          <SelectTrigger id="preferowanyKontakt">
            <SelectValue placeholder="Wybierz sposób kontaktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMAIL">E-mail</SelectItem>
            <SelectItem value="TELEFON">Telefon komórkowy</SelectItem>
            <SelectItem value="OBA">Zarówno e-mail, jak i telefon</SelectItem>
          </SelectContent>
        </Select>
        {errors.preferowanyKontakt && (
          <p className="text-xs text-destructive mt-1">{errors.preferowanyKontakt}</p>
        )}
      </div>

      <div
        id="field-akceptujeKlauzule"
        className="flex items-start space-x-3 rounded-lg border border-border/30 p-4 bg-background-sec/20 mt-6"
      >
        <Checkbox
          id="akceptujeKlauzule"
          checked={contact.akceptujeKlauzule}
          onCheckedChange={(checked) => updateContactField("akceptujeKlauzule", checked === true)}
          className="mt-1 h-5 w-5 border-border/50 text-primary focus:ring-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-transparent rounded shrink-0"
        />
        <div className="space-y-1.5 flex-1">
          <Label
            htmlFor="akceptujeKlauzule"
            className="cursor-pointer text-xs text-muted-foreground leading-relaxed font-light block"
          >
            Oświadczam, że zapoznałem się i akceptuję klauzulę informacyjną oraz
            regulamin portalu odnośnie przetwarzania danych osobowych w celu
            realizacji zlecenia. *
          </Label>
          <div className="text-muted-foreground/70 text-xs leading-relaxed font-light">
            Administratorem Twoich danych osobowych jest Polska Grupa
            Identyfikacji Firm Sp. z o.o. z siedzibą w Kielcach: Generała
            Mariana Langiewicza 16/3,{" "}
            {!showMoreGDPR ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowMoreGDPR(true)
                }}
                className="text-primary hover:underline font-normal inline-flex items-center"
              >
                Wiecej
              </button>
            ) : (
              <>
                Twoje dane osobowe będą przetwarzane głównie w celu realizacji
                zawartej umowy, co obejmuje świadczenie usług drogą
                elektroniczną oraz korzystanie z naszego serwisu. Oznacza to, że
                na Twoje zlecenie będziemy poszukiwać dostawców interesujących
                Cię produktów i usług oraz umożliwiać nawiązanie z nimi
                kontaktu. Dążymy również do dostarczania Ci spersonalizowanych
                informacji, takich jak rekomendacje, porady oraz ankiety, a
                także informowania o nowościach. Nasz zespół może się z Tobą
                kontaktować w celu obsługi Twoich zapytań. Zapewniamy realizację
                Twoich praw wynikających z RODO, w tym prawa dostępu do danych,
                ich sprostowania, usunięcia, ograniczenia przetwarzania,
                przenoszenia, wniesienia sprzeciwu oraz prawa do tego, aby nie
                podlegać automatycznemu podejmowaniu decyzji, w tym
                profilowaniu. Podanie danych osobowych jest dobrowolne, lecz
                konieczne do realizacji umowy. Szczegółowe informacje o
                sposobach przetwarzania danych, czasie ich przechowywania oraz
                możliwości składania skarg znajdują się w naszej Polityce
                Prywatności.{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMoreGDPR(false)
                  }}
                  className="text-primary hover:underline font-normal inline-flex items-center"
                >
                  Mniej
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccountStep = () => (
    <div className="space-y-5">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Ostatni krok
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            Załóż konto, aby zapisać sprawę i zacząć otrzymywać oferty od
            prawników — zajmie mniej niż minutę. Twój opis sprawy z
            poprzednich kroków zostanie zachowany.
          </p>
        </div>
      </div>

      {referralAccountExists && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Pod adresem z tego polecenia istnieje już konto.{" "}
          <Link
            href={`/logowanie?callbackUrl=${encodeURIComponent(
              referralToken ? `/dodaj-sprawe?referral=${referralToken}` : "/dodaj-sprawe"
            )}`}
            className="text-primary hover:underline font-medium"
          >
            Zaloguj się
          </Link>
          , aby dokończyć — dane Twojej sprawy zostaną zachowane.
        </div>
      )}

      <div id="field-email">
        <Label htmlFor="email" className="text-muted-foreground text-xs font-semibold">
          Adres e-mail *
        </Label>
        <Input
          id="email"
          type="email"
          value={account.email}
          onChange={(e) => updateAccountField("email", e.target.value)}
          placeholder="twoj@email.com"
          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      <div id="field-adres">
        <Label htmlFor="adres" className="text-muted-foreground text-xs font-semibold">
          Adres (ulica i numer) *
        </Label>
        <Input
          id="adres"
          value={account.adres}
          onChange={(e) => updateAccountField("adres", e.target.value)}
          placeholder="Np. ul. Warszawska 1/2"
          className={cn(errors.adres && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.adres && <p className="text-xs text-destructive mt-1">{errors.adres}</p>}
      </div>

      <div className="flex gap-3">
        <div id="field-kodPocztowy" className="w-[140px] shrink-0">
          <Label htmlFor="kodPocztowy" className="text-muted-foreground text-xs font-semibold">
            Kod pocztowy *
          </Label>
          <Input
            id="kodPocztowy"
            value={account.kodPocztowy}
            onChange={handleAccountPostalCodeChange}
            placeholder="00-000"
            className={cn(errors.kodPocztowy && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.kodPocztowy && <p className="text-xs text-destructive mt-1">{errors.kodPocztowy}</p>}
        </div>

        <div id="field-accountMiasto" className="flex-1 min-w-0">
          <Label htmlFor="accountMiasto" className="text-muted-foreground text-xs font-semibold">
            Miasto {accountCityOptions.length > 1 && "*"}
          </Label>
          <Select
            value={accountCityId}
            onValueChange={(value) => {
              setAccountCityId(value)
              clearError("accountMiasto")
            }}
            disabled={isLoadingAccountCities || accountCityOptions.length === 0}
          >
            <SelectTrigger
              id="accountMiasto"
              className={cn(errors.accountMiasto && "border-destructive focus-visible:ring-destructive")}
            >
              <SelectValue
                placeholder={
                  isLoadingAccountCities
                    ? "Wyszukiwanie miasta..."
                    : !/^\d{2}-\d{3}$/.test(account.kodPocztowy)
                      ? "Najpierw podaj kod pocztowy"
                      : accountCityOptions.length === 0
                        ? "Nie znaleziono miasta dla tego kodu"
                        : "Wybierz miasto"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {accountCityOptions.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.nazwa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountMiasto && <p className="text-xs text-destructive mt-1">{errors.accountMiasto}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div id="field-password">
          <Label htmlFor="password" className="text-muted-foreground text-xs font-semibold">
            Hasło *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={account.password}
              onChange={(e) => updateAccountField("password", e.target.value)}
              placeholder="••••••••"
              className={cn("pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        <div id="field-confirmPassword">
          <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs font-semibold">
            Potwierdź hasło *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={account.confirmPassword}
              onChange={(e) => updateAccountField("confirmPassword", e.target.value)}
              placeholder="••••••••"
              className={cn("pr-10", errors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="space-y-1" id="field-zgodaRegulamin">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="zgodaRegulamin"
            checked={account.zgodaRegulamin}
            onCheckedChange={(checked) => updateAccountField("zgodaRegulamin", checked === true)}
            className={cn(errors.zgodaRegulamin && "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive")}
          />
          <label
            htmlFor="zgodaRegulamin"
            className={cn("relative top-[1px] text-sm leading-none cursor-pointer", errors.zgodaRegulamin && "text-destructive")}
          >
            Akceptuję <Link href="/regulamin" className="text-primary hover:underline">regulamin</Link> i{" "}
            <Link href="/polityka-prywatnosci" className="text-primary hover:underline">politykę prywatności</Link> *
          </label>
        </div>
        {errors.zgodaRegulamin && <p className="text-xs text-destructive mt-1 ml-7">{errors.zgodaRegulamin}</p>}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="zgodaNewsletter"
          checked={account.zgodaNewsletter}
          onCheckedChange={(checked) => updateAccountField("zgodaNewsletter", checked === true)}
        />
        <label htmlFor="zgodaNewsletter" className="relative top-[1px] text-sm leading-none">
          Chcę otrzymywać newsletter
        </label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="zgodaMarketing"
          checked={account.zgodaMarketing}
          onCheckedChange={(checked) => updateAccountField("zgodaMarketing", checked === true)}
        />
        <label htmlFor="zgodaMarketing" className="relative top-[1px] text-sm leading-none">
          Chcę otrzymywać informacje marketingowe
        </label>
      </div>

      {accountError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive space-y-2">
          <p>{accountError}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href={`/logowanie?callbackUrl=${encodeURIComponent("/dodaj-sprawe")}`}
              className="text-primary hover:underline font-medium"
            >
              Przejdź do logowania
            </Link>
            {referralToken && accountError.includes("polecenia") && (
              <button
                type="button"
                onClick={() => setIgnoreReferral(true)}
                className="text-primary hover:underline font-medium"
              >
                Kontynuuj bez polecenia
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const isBusy = isSubmitting || isSubmittingAccount

  // Krótki moment, zanim useSession() rozstrzygnie, czy mamy sesję CLIENT — unika
  // migotania 6 kroków, które zaraz zamieniłyby się w 5.
  if (sessionStatus === "loading") {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="relative space-y-8">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <Heading level="h1" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Dodaj nową sprawę
          </Heading>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">
            {isAuthed
              ? "Wypełnij poniższy formularz krok po kroku. Umożliwi to prawnikom dokładną analizę i rzetelną wycenę Twojej sprawy."
              : "Opisz swoją sprawę krok po kroku — konto zakładasz dopiero na końcu, gdy Twoje zgłoszenie będzie już gotowe."}
          </p>
        </motion.div>

        {referralInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="relative z-10 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-100">
                  Sprawa z polecenia{referralInfo.ekspert ? ` — ${referralInfo.ekspert}` : ""}
                </p>
                <p className="text-xs font-light leading-relaxed text-amber-200/90">
                  Typ sprawy, kategorie i lokalizację wybrał już ekspert — możesz je zmienić.
                  Uzupełnij pozostałe pola, aby wysłać zgłoszenie.
                </p>
                {referralInfo.wiadomosc && (
                  <p className="mt-2 border-l-2 border-amber-500/50 pl-3 text-xs font-light italic leading-relaxed text-amber-100/90">
                    {referralInfo.wiadomosc}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative z-10"
        >
          <Card variant="glass" className="relative overflow-hidden">
            <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
            <CardContent className="p-4 sm:p-6">
              {renderStepIndicator()}

              <div className="min-h-[300px] py-4">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} variants={stepContainerVariants} initial="hidden" animate="show" exit="exit">
                    {currentStep === 1 && (
                      <CaseTypeStep value={caseData.typSprawy} error={errors.typSprawy} onSelect={handleSelectCaseType} />
                    )}
                    {currentStep === 2 && (
                      <CaseDescriptionStep
                        nazwaSprawy={caseData.nazwaSprawy}
                        opisSprawy={caseData.opisSprawy}
                        errors={{ nazwaSprawy: errors.nazwaSprawy, opisSprawy: errors.opisSprawy }}
                        onNazwaChange={(v) => updateCaseField("nazwaSprawy", v)}
                        onOpisChange={(v) => updateCaseField("opisSprawy", v)}
                        uploadedFiles={uploadedFiles}
                        isUploading={isUploading}
                        onFilesSelected={handleFilesSelected}
                        onRemoveFile={handleRemoveFile}
                      />
                    )}
                    {currentStep === 3 && (
                      <CaseCategoryLocationStep
                        categories={categories}
                        isLoadingCategories={isLoadingCategories}
                        typSprawy={caseData.typSprawy}
                        categoryIds={caseData.categoryIds}
                        onCategoryIdsChange={(ids) => updateCaseField("categoryIds", ids)}
                        categoryError={errors.categoryIds}
                        cityId={caseData.cityId}
                        selectedCityName={selectedCityName}
                        cityError={errors.cityId}
                        onCitySelect={(city) => {
                          setCaseData((prev) => ({ ...prev, cityId: city.id, voivodeshipId: city.voivodeshipSlug }))
                          clearError("cityId")
                          setSelectedCityName(city.nazwa)
                        }}
                        onSuggestCategories={handleSuggestCategories}
                        isSuggestingCategories={isSuggestingCategories}
                        aiSuggestion={aiSuggestion}
                      />
                    )}
                    {currentStep === 4 && (
                      <CaseScheduleBudgetStep
                        oczekiwanyTerminRealizacji={caseData.oczekiwanyTerminRealizacji}
                        trybPilny={caseData.trybPilny}
                        budzetOd={caseData.budzetOd}
                        budzetDo={caseData.budzetDo}
                        doNegocjacji={caseData.doNegocjacji}
                        onChange={(field, value) => updateCaseField(field, value as never)}
                      />
                    )}
                    {currentStep === 5 && renderContactStep()}
                    {currentStep === 6 && !isAuthed && renderAccountStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-between pt-6 border-t border-border/20 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isBusy}
                  className="h-11 px-5 gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Wstecz
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" variant="primary" onClick={handleNext} className="h-11 px-6 shadow-md shadow-primary/20 group gap-1.5">
                    Dalej
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isBusy}
                    className="h-11 px-6 shadow-md shadow-primary/20 group gap-1.5"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5 text-foreground" />
                        {isAuthed ? "Dodawanie..." : "Rejestracja..."}
                      </>
                    ) : (
                      <>
                        {isAuthed ? "Utwórz sprawę" : "Utwórz konto i wyślij sprawę"}
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog
          open={showSuccessDialog}
          onOpenChange={(open) => {
            if (!open && createdCaseId && !caseCreationToken) {
              router.push(`/panel-klienta/sprawy/${createdCaseId}`)
            }
            setShowSuccessDialog(open)
          }}
        >
          <DialogContent className="sm:max-w-md p-6 overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[180px] bg-success/10 blur-[70px] rounded-full pointer-events-none" />
            <DialogHeader className="items-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border border-success/20"
              >
                <CheckCircle2 className="h-9 w-9 text-success" />
              </motion.div>
              <DialogTitle className="text-xl font-bold font-playfair text-foreground">
                Sprawa została dodana!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
                {caseCreationToken
                  ? "Twoja sprawa jest już w systemie! Zanim eksperci zobaczą jej szczegóły, potwierdź adres e-mail — kliknij link, który właśnie wysłaliśmy na Twoją skrzynkę. Dopiero wtedy będziesz też mógł się zalogować do panelu klienta."
                  : "Twoja sprawa jest już w systemie! Prawnicy specjalizujący się w tej dziedzinie wkrótce zapoznają się z jej szczegółami i złożą swoje oferty. Otrzymasz powiadomienie, gdy tylko pojawią się nowe propozycje. Dziękujemy za zaufanie!"}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-2.5">
              {caseCreationToken ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setShowSuccessDialog(false)
                    router.push("/")
                  }}
                  className="h-11 px-5 shadow-md shadow-primary/20"
                >
                  Rozumiem
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSuccessDialog(false)
                      router.push("/panel-klienta/sprawy")
                    }}
                    className="h-11 px-5"
                  >
                    Przejdź do listy spraw
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setShowSuccessDialog(false)
                      if (createdCaseId) router.push(`/panel-klienta/sprawy/${createdCaseId}`)
                    }}
                    className="h-11 px-5 shadow-md shadow-primary/20 gap-1.5"
                  >
                    Zobacz sprawę
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showOtpDialog}
          onOpenChange={(open) => {
            setShowOtpDialog(open)
            if (!open) {
              setOtpCode("")
              setOtpError(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-md p-6 text-center">
            <DialogHeader className="items-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold font-playfair text-foreground">
                Podaj kod weryfikacyjny
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
                Wysłaliśmy 6-cyfrowy kod na Twój adres email. Wpisz go poniżej, aby dokończyć dodawanie sprawy. Kod jest ważny przez 10 minut.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <Input
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  setOtpError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyOtp()
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] h-14 font-semibold"
                autoFocus
              />
              {otpError && <p className="text-sm text-destructive">{otpError}</p>}
            </div>

            <DialogFooter className="mt-4 flex flex-col gap-2.5">
              <Button
                type="button"
                variant="primary"
                onClick={handleVerifyOtp}
                disabled={otpCode.trim().length !== 6 || isVerifyingOtp}
                className="h-11 px-5 shadow-md shadow-primary/20 w-full"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Weryfikacja...
                  </>
                ) : (
                  "Potwierdź i utwórz sprawę"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isResendingOtp}
                className="h-9 text-sm text-muted-foreground"
              >
                {isResendingOtp ? "Wysyłanie..." : "Wyślij kod ponownie"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <PhoneVerificationDialog
          open={showPhoneVerification}
          phone={contact.telefonKontakt}
          onOpenChange={setShowPhoneVerification}
          onVerified={submitAnonymousRegistrationAndCase}
        />
      </div>
    </div>
  )
}
