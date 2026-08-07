"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryPicker } from "@/components/sprawy/CategoryPicker";
import { CityCombobox } from "@/components/sprawy/CityCombobox";
import { Textarea } from "@/components/ui/textarea";
import { BorderBeam } from "@/components/ui/border-beam";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Search,
  Upload,
  X,
  Plus,
  Share2,
  Sparkles,
  Loader2,
  User,
  Building2,
  Landmark,
  Mail,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CaseType = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA";
type PreferredContact = "EMAIL" | "TELEFON" | "OBA";

interface FileAttachment {
  url: string;
  originalName: string;
}

interface FormData {
  // Krok 1: Typ sprawy
  typSprawy: CaseType | "";

  // Krok 3: Kategoria i lokalizacja (sprawa może mieć wiele kategorii)
  categoryIds: string[];
  voivodeshipId: string;
  cityId: string;

  // Krok 2: Opis
  nazwaSprawy: string;
  opisSprawy: string;
  zalaczniki: string[];

  // Krok 4: Termin i budżet
  oczekiwanyTerminRealizacji: string;
  trybPilny: boolean;
  budzetOd: string;
  budzetDo: string;
  doNegocjacji: boolean;

  // Krok 5: Dane kontaktowe
  imieNazwisko: string;
  telefonKontakt: string;
  preferowanyKontakt: PreferredContact | "";
  akceptujeKlauzule: boolean;
}

const stepContainerVariants = {
  hidden: { opacity: 0, x: 15 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    x: -15,
    transition: {
      duration: 0.25,
      ease: "easeIn" as const,
    },
  },
};

export default function ClientAddCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sprawa dodawana z linku polecającego eksperta (/polecenie/[token])
  const referralToken = searchParams.get("referral");
  const [referralInfo, setReferralInfo] = useState<{
    ekspert: string;
    wiadomosc: string | null;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Automatyczny dobór kategorii przez AI na podstawie opisu sprawy
  const [isSuggestingCategories, setIsSuggestingCategories] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    uzasadnienie: string;
    categories: { id: string; nazwa: string; path: string }[];
  } | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [voivodeships, setVoivodeships] = useState<any[]>([]);
  const [isLoadingVoivodeships, setIsLoadingVoivodeships] = useState(true);
  const [selectedCityName, setSelectedCityName] = useState("");
  const [showMoreGDPR, setShowMoreGDPR] = useState(false);

  // Komunikaty walidacyjne przy polach - pokazywane dopiero po kliknięciu "Dalej"
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    typSprawy: "",
    categoryIds: [],
    voivodeshipId: "",
    cityId: "",
    nazwaSprawy: "",
    opisSprawy: "",
    zalaczniki: [],
    oczekiwanyTerminRealizacji: "",
    trybPilny: false,
    budzetOd: "",
    budzetDo: "",
    doNegocjacji: true,
    imieNazwisko: "",
    telefonKontakt: "",
    preferowanyKontakt: "EMAIL",
    akceptujeKlauzule: false,
  });

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const response = await fetch("/api/voivodeships");
        if (response.ok) {
          const data = await response.json();
          setVoivodeships(data);
        }
      } catch (error) {
        console.error("Error fetching voivodeships:", error);
      } finally {
        setIsLoadingVoivodeships(false);
      }
    };
    fetchVoivodeships();
  }, []);





  // AI (deepseek przez OpenRouter) analizuje opis sprawy i dobiera kategorie za klienta
  const handleSuggestCategories = async () => {
    setIsSuggestingCategories(true);
    try {
      const response = await fetch("/api/cases/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opisSprawy: formData.opisSprawy,
          nazwaSprawy: formData.nazwaSprawy,
          typSprawy: formData.typSprawy,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.error || "Nie udało się automatycznie dobrać kategorii",
        );
        return;
      }
      updateFormData(
        "categoryIds",
        data.categories.map((cat: { id: string }) => cat.id),
      );
      setAiSuggestion(data);
      toast.success(
        "Kategorie zostały dobrane automatycznie na podstawie opisu sprawy",
      );
    } catch (error) {
      console.error("Error suggesting categories:", error);
      toast.error("Nie udało się automatycznie dobrać kategorii");
    } finally {
      setIsSuggestingCategories(false);
    }
  };


  // Obsługa uploadu plików
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Sprawdź czy nie przekroczono limitu 5 plików
    if (uploadedFiles.length + files.length > 5) {
      toast.error("Możesz dodać maksymalnie 5 plików");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/document", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        return {
          url: data.url,
          originalName: data.originalName,
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      updateFormData("zalaczniki", [
        ...formData.zalaczniki,
        ...newFiles.map((f) => f.url),
      ]);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Błąd podczas uploadu plików. Spróbuj ponownie.");
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  // Usuń plik z listy
  const handleRemoveFile = (index: number) => {
    const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newUploadedFiles);
    updateFormData(
      "zalaczniki",
      newUploadedFiles.map((f) => f.url),
    );
  };

  // Pobierz dane użytkownika i uzupełnij dane kontaktowe oraz domyślne miasto
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/clients/me");
        if (response.ok) {
          const userData = await response.json();

          // Uzupełnij dane kontaktowe danymi użytkownika
          setFormData((prev) => ({
            ...prev,
            imieNazwisko:
              `${userData.imie || ""} ${userData.nazwisko || ""}`.trim(),
            telefonKontakt: userData.telefon || "",
          }));

          // Domyślnie ustaw miasto podane przez użytkownika podczas rejestracji.
          // Przy sprawie z polecenia lokalizację narzuca ekspert — nie nadpisujemy jej.
          const userCity = referralToken ? null : userData.miasto?.trim();
          if (userCity) {
            try {
              const citiesRes = await fetch(
                `/api/cities?search=${encodeURIComponent(userCity)}`
              );
              if (citiesRes.ok) {
                const citiesData = await citiesRes.json();
                if (Array.isArray(citiesData) && citiesData.length > 0) {
                  const matchedCity =
                    citiesData.find(
                      (c: any) =>
                        c.nazwa.toLowerCase() === userCity.toLowerCase()
                    ) || citiesData[0];

                  if (matchedCity) {
                    setFormData((prev) => ({
                      ...prev,
                      cityId: matchedCity.id,
                      voivodeshipId:
                        matchedCity.voivodeship?.slug ||
                        matchedCity.voivodeshipId ||
                        prev.voivodeshipId,
                    }));
                    setSelectedCityName(matchedCity.nazwa);
                  }
                }
              }
            } catch (cityError) {
              console.error("Error fetching default city for client:", cityError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill z linku polecającego: typ sprawy, kategorie, lokalizacja i propozycja nazwy.
  // Pola pozostają edytowalne — propozycja eksperta to tylko punkt wyjścia.
  useEffect(() => {
    if (!referralToken) return;

    const fetchReferral = async () => {
      try {
        const response = await fetch(`/api/case-referrals/token/${referralToken}`);
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "Link polecający jest nieaktywny");
          return;
        }

        if (!data.prefill) {
          toast.error(
            "Ten link polecający został wysłany na inny adres e-mail niż Twoje konto.",
          );
          return;
        }

        setReferralInfo({
          ekspert: data.ekspert?.nazwa || "",
          wiadomosc: data.wiadomosc || null,
        });

        setFormData((prev) => ({
          ...prev,
          typSprawy: data.prefill.typSprawy,
          categoryIds: data.prefill.categoryIds,
          cityId: data.prefill.cityId,
          voivodeshipId: data.prefill.voivodeshipSlug,
          nazwaSprawy: prev.nazwaSprawy || data.prefill.nazwaSprawy || "",
        }));
        setSelectedCityName(data.prefill.cityName || "");
      } catch (error) {
        console.error("Error fetching referral:", error);
      }
    };

    fetchReferral();
  }, [referralToken]);

  // Kolejność pól w krokach - używana do przewinięcia do pierwszego błędu
  const stepFieldOrder: Record<number, string[]> = {
    1: ["typSprawy"],
    2: ["nazwaSprawy", "opisSprawy"],
    3: ["categoryIds", "cityId"],
    4: [],
    5: [
      "imieNazwisko",
      "telefonKontakt",
      "preferowanyKontakt",
      "akceptujeKlauzule",
    ],
  };

  const getStepErrors = (step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.typSprawy) {
          stepErrors.typSprawy =
            "Wybierz typ sprawy, aby przejść do następnego kroku";
        }
        break;
      case 2:
        if (!formData.nazwaSprawy.trim()) {
          stepErrors.nazwaSprawy = "Podaj nazwę sprawy";
        }
        if (!formData.opisSprawy.trim()) {
          stepErrors.opisSprawy = "Opisz swoją sprawę (minimum 50 znaków)";
        } else if (formData.opisSprawy.length < 50) {
          stepErrors.opisSprawy = `Opis musi mieć co najmniej 50 znaków - brakuje jeszcze ${50 - formData.opisSprawy.length
            }`;
        }
        break;
      case 3:
        if (formData.categoryIds.length === 0) {
          stepErrors.categoryIds = "Wybierz co najmniej jedną kategorię sprawy";
        }
        if (!formData.cityId || !formData.voivodeshipId) {
          stepErrors.cityId = "Wybierz miasto, którego dotyczy sprawa";
        }
        break;
      case 4:
        // Termin i budżet są opcjonalne
        break;
      case 5:
        if (!formData.imieNazwisko.trim()) {
          stepErrors.imieNazwisko = "Podaj imię i nazwisko lub nazwę podmiotu";
        }
        if (!formData.telefonKontakt.trim()) {
          stepErrors.telefonKontakt = "Podaj numer telefonu kontaktowego";
        }
        if (!formData.preferowanyKontakt) {
          stepErrors.preferowanyKontakt = "Wybierz preferowaną formę kontaktu";
        }
        if (!formData.akceptujeKlauzule) {
          stepErrors.akceptujeKlauzule =
            "Zaakceptuj klauzulę informacyjną i regulamin, aby dodać sprawę";
        }
        break;
    }

    return stepErrors;
  };

  // Waliduje krok i pokazuje komunikaty przy polach, jeśli czegoś brakuje
  const validateStepWithFeedback = (step: number): boolean => {
    const stepErrors = getStepErrors(step);
    setErrors(stepErrors);

    const errorFields = Object.keys(stepErrors);
    if (errorFields.length === 0) return true;

    toast.error(
      errorFields.length === 1
        ? stepErrors[errorFields[0]]
        : "Uzupełnij zaznaczone pola, aby przejść dalej",
    );

    // Przewiń do pierwszego pola z błędem
    const firstErrorField = (stepFieldOrder[step] || errorFields).find(
      (field) => stepErrors[field],
    );
    if (firstErrorField) {
      requestAnimationFrame(() => {
        document
          .getElementById(`field-${firstErrorField}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    return false;
  };

  const handleNext = () => {
    if (validateStepWithFeedback(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitCase = (otpCodeValue?: string) =>
    fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        oczekiwanyTerminRealizacji:
          formData.oczekiwanyTerminRealizacji || null,
        budzetOd: !formData.doNegocjacji && formData.budzetOd ? parseFloat(formData.budzetOd) : null,
        budzetDo: !formData.doNegocjacji && formData.budzetDo ? parseFloat(formData.budzetDo) : null,
        ...(referralToken ? { referralToken } : {}),
        ...(otpCodeValue ? { otpCode: otpCodeValue } : {}),
      }),
    });

  const handleSubmit = async () => {
    if (!validateStepWithFeedback(5)) return;

    setIsSubmitting(true);
    try {
      const response = await submitCase();
      const data = await response.json().catch(() => null);

      if (response.ok && data?.requiresOtp) {
        setOtpCode("");
        setOtpError(null);
        setShowOtpDialog(true);
        toast.success("Wysłaliśmy kod weryfikacyjny na Twój adres email.");
        return;
      }

      if (response.ok) {
        setCreatedCaseId(data.id);
        setShowSuccessDialog(true);
      } else {
        toast.error(data?.error || "Błąd podczas dodawania sprawy");
      }
    } catch (error) {
      console.error("Error submitting case:", error);
      toast.error("Wystąpił błąd podczas dodawania sprawy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) return;

    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const response = await submitCase(otpCode.trim());
      const data = await response.json().catch(() => null);

      if (response.ok && !data?.requiresOtp) {
        setShowOtpDialog(false);
        setCreatedCaseId(data.id);
        setShowSuccessDialog(true);
        return;
      }

      if (data?.otpExpired) {
        setOtpError("Kod wygasł. Wyślij nowy kod.");
      } else if (data?.invalidOtp) {
        setOtpError("Nieprawidłowy kod weryfikacyjny.");
      } else {
        setOtpError(data?.error || "Nie udało się zweryfikować kodu.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Wystąpił błąd podczas weryfikacji kodu.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setOtpError(null);
    try {
      const response = await submitCase();
      const data = await response.json().catch(() => null);

      if (response.ok && data?.requiresOtp) {
        setOtpCode("");
        toast.success("Wysłaliśmy nowy kod weryfikacyjny.");
      } else {
        setOtpError(data?.error || "Nie udało się wysłać nowego kodu.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setOtpError("Nie udało się wysłać nowego kodu.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {[1, 2, 3, 4, 5].map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
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
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  step
                )}
              </div>
              {step < 5 && (
                <div
                  className={cn(
                    "mx-1 sm:mx-2 h-0.5 flex-1 rounded-full transition-all duration-300",
                    step < currentStep ? "bg-primary" : "bg-border/30",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-primary">
          {currentStep === 1 && "Krok 1: Typ sprawy"}
          {currentStep === 2 && "Krok 2: Opis i Szczegóły"}
          {currentStep === 3 && "Krok 3: Kategoria i Lokalizacja"}
          {currentStep === 4 && "Krok 4: Harmonogram i Budżet"}
          {currentStep === 5 && "Krok 5: Kontakt i Weryfikacja"}
        </h3>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div id="field-typSprawy">
        <Label
          className={cn(
            "text-muted-foreground text-sm font-semibold mb-4 block",
            errors.typSprawy && "text-destructive",
          )}
        >
          Wybierz typ sprawy *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: "OSOBA_PRYWATNA",
              label: "Osoba prywatna",
              icon: User,
              description:
                "Sprawa dotyczy osoby fizycznej, np. prawo pracy, rozwód, spadek.",
            },
            {
              value: "FIRMA",
              label: "Firma / JDG",
              icon: Building2,
              description:
                "Sprawa dotyczy przedsiębiorstwa, spółek handlowych, kontraktów biznesowych.",
            },
            {
              value: "ORGANIZACJA",
              label: "Organizacja / NGO",
              icon: Landmark,
              description:
                "Sprawa dotyczy stowarzyszeń, fundacji lub innych organizacji pożytku publicznego.",
            },
          ].map((option) => {
            const isSelected = formData.typSprawy === option.value;
            const OptionIcon = option.icon;
            return (
              <Card
                key={option.value}
                className={cn(
                  "cursor-pointer border transition-all duration-300 rounded-lg relative overflow-hidden p-6 group hover:bg-background-sec/20 flex flex-col justify-between h-full min-h-[160px]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                    : errors.typSprawy
                      ? "border-destructive/60 bg-background-sec/10 hover:border-destructive"
                      : "border-border/30 bg-background-sec/10 hover:border-border/60",
                )}
                onClick={() => {
                  updateFormData("typSprawy", option.value);
                  updateFormData("categoryIds", []); // Reset selected categories
                  setAiSuggestion(null); // Reset AI suggestion
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-md flex items-center justify-center border transition-all duration-300",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background-sec border-border/10 text-muted-foreground group-hover:text-white",
                      )}
                    >
                      <OptionIcon className="h-5 w-5" />
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? "border-primary"
                          : "border-border/30 group-hover:border-border/60",
                      )}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-semibold text-white">
                      {option.label}
                    </h4>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {errors.typSprawy && (
          <p className="text-xs text-destructive mt-2">{errors.typSprawy}</p>
        )}
      </div>
    </div>
  );

  const renderCategoryStep = () => {
    return (
      <div className="space-y-5">
        <div id="field-categoryIds">
          <Label
            className={cn(
              "text-muted-foreground text-xs font-semibold mb-2 block",
              errors.categoryIds && "text-destructive",
            )}
          >
            Kategorie sprawy * (możesz wybrać więcej niż jedną)
          </Label>
          <CategoryPicker
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            typSprawy={formData.typSprawy}
            value={formData.categoryIds}
            onChange={(categoryIds) => updateFormData("categoryIds", categoryIds)}
            hasError={!!errors.categoryIds}
          />

          {errors.categoryIds && (
            <p className="text-xs text-destructive mt-2 font-medium">
              {errors.categoryIds}
            </p>
          )}

          {/* Automatyczny dobór kategorii przez AI na podstawie opisu z kroku 2 */}
          <button
            type="button"
            onClick={handleSuggestCategories}
            disabled={isSuggestingCategories}
            className="mt-3.5 w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border border-dashed border-primary/40 bg-primary/[0.05] hover:bg-primary/[0.12] hover:border-primary transition-all text-center cursor-pointer group shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSuggestingCategories ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-primary shrink-0" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-bold text-primary group-hover:text-primary-foreground group-hover:underline transition-colors">
              {isSuggestingCategories
                ? "Analizujemy opis sprawy i dobieramy kategorie..."
                : "Nie wiem, do jakiej kategorii przyporządkować sprawę — dobierz za mnie (AI)"}
            </span>
          </button>

          {aiSuggestion && (
            <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-4 flex items-start gap-3 shadow-xs">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Kategorie dobrane automatycznie
                </h5>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  Na podstawie opisu Twojej sprawy dobraliśmy kategorie
                  automatycznie.
                  {aiSuggestion.uzasadnienie &&
                    ` ${aiSuggestion.uzasadnienie}`}{" "}
                  Jeśli się z nimi nie zgadzasz, możesz je w każdej chwili
                  zmienić lub usunąć.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2" id="field-cityId">
          <Label
            htmlFor="cityId"
            className={cn(
              "text-muted-foreground text-xs font-semibold",
              errors.cityId && "text-destructive",
            )}
          >
            Miasto *
          </Label>
          <CityCombobox
            value={formData.cityId}
            cityName={selectedCityName}
            hasError={!!errors.cityId}
            onSelect={(city) => {
              setFormData((prev) => ({
                ...prev,
                cityId: city.id,
                voivodeshipId: city.voivodeshipSlug,
              }));
              clearError("cityId");
              setSelectedCityName(city.nazwa);
            }}
          />
          {errors.cityId && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.cityId}</p>
          )}
        </div>
      </div>
    );
  };

  const renderDescriptionStep = () => (
    <div className="space-y-5">
      <div id="field-nazwaSprawy">
        <Label
          htmlFor="nazwaSprawy"
          className={cn(
            "text-muted-foreground text-xs font-semibold mb-1.5",
            errors.nazwaSprawy && "text-destructive",
          )}
        >
          Nazwa sprawy *
        </Label>
        <Input
          id="nazwaSprawy"
          value={formData.nazwaSprawy}
          onChange={(e) => updateFormData("nazwaSprawy", e.target.value)}
          placeholder="np. Sporządzenie umowy najmu lokalu komercyjnego"
          className={cn(
            "",
            errors.nazwaSprawy &&
            "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.nazwaSprawy && (
          <p className="text-xs text-destructive mt-1">{errors.nazwaSprawy}</p>
        )}
      </div>

      <div id="field-opisSprawy">
        <Label
          htmlFor="opisSprawy"
          className={cn(
            "text-muted-foreground text-xs font-semibold mb-1.5",
            errors.opisSprawy && "text-destructive",
          )}
        >
          Opis sprawy * (minimum 50 znaków)
        </Label>
        <Textarea
          id="opisSprawy"
          value={formData.opisSprawy}
          onChange={(e) => updateFormData("opisSprawy", e.target.value)}
          placeholder="Opisz szczegółowo stan faktyczny, kluczowe okoliczności, cele oraz pytania prawne, na które szukasz odpowiedzi..."
          rows={8}
          className={cn(
            "resize-none",
            errors.opisSprawy &&
            "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.opisSprawy && (
          <p className="text-xs text-destructive mt-1.5">{errors.opisSprawy}</p>
        )}
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-sm text-muted-foreground/70 font-light">
            Opisz problem prawny jak najdokładniej.
          </span>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-lg border",
              formData.opisSprawy.length >= 50
                ? "bg-success/10 text-success border-success/20"
                : "bg-background-sec/20 text-muted-foreground border-border/20",
            )}
          >
            Znaki: {formData.opisSprawy.length} / 50
          </span>
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs font-semibold">
          Załączniki (opcjonalnie, maks. 5 plików)
        </Label>
        <div className="mt-2 space-y-2.5">
          {uploadedFiles.length < 5 && (
            <div>
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              />
              <div
                className={cn(
                  "border border-dashed border-border/30 rounded-lg transition-all text-center p-6 mt-1",
                  isUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-primary/40 hover:bg-background-sec/15 cursor-pointer group",
                )}
                onClick={() => {
                  if (!isUploading) {
                    document.getElementById("file-upload")?.click();
                  }
                }}
              >
                <div
                  className={cn(
                    "mx-auto h-9 w-9 rounded-lg bg-background-sec border border-border/10 flex items-center justify-center text-muted-foreground transition-all mb-2.5",
                    !isUploading &&
                    "group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-4.5 w-4.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-semibold text-xs text-white transition-colors block",
                    !isUploading && "group-hover:text-primary",
                  )}
                >
                  {isUploading
                    ? "Przesyłanie plików..."
                    : "Wybierz dokumenty do dodania"}
                </span>
                <span className="text-sm text-muted-foreground/70 mt-1 block font-light">
                  Kliknij, aby wybrać pliki z dysku
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground/70 font-light">
            Obsługiwane pliki: PDF, DOC, DOCX, XLS, XLSX, TXT oraz grafiki
            (maksymalnie 10MB na plik).
          </p>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border/10 bg-background-sec/20 p-3.5 mt-2"
            >
              <span className="text-xs text-muted-foreground truncate flex-1 min-w-0 mr-2">
                {file.originalName}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                disabled={isUploading}
                className="h-8 w-8 rounded-lg hover:text-error hover:bg-error/5 transition-colors p-0 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div>
        <Label
          htmlFor="oczekiwanyTerminRealizacji"
          className="text-muted-foreground text-xs font-semibold mb-1.5 block"
        >
          Oczekiwany termin realizacji (opcjonalnie)
        </Label>
        <DatePicker
          id="oczekiwanyTerminRealizacji"
          value={formData.oczekiwanyTerminRealizacji}
          onChange={(val) =>
            updateFormData("oczekiwanyTerminRealizacji", val)
          }
          placeholder="Wybierz oczekiwany termin..."
          minDate={new Date()}
        />
      </div>

      <div className="flex items-center space-x-3 py-1.5">
        <Checkbox
          id="trybPilny"
          checked={formData.trybPilny}
          onCheckedChange={(checked) => updateFormData("trybPilny", checked)}
          className="h-5 w-5 border-border/50 text-primary focus:ring-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-transparent rounded"
        />
        <Label
          htmlFor="trybPilny"
          className="cursor-pointer text-sm text-muted-foreground font-medium"
        >
          Sprawa pilna - wymaga natychmiastowej interwencji
        </Label>
      </div>

      <div className="rounded-lg border border-border/20 bg-background-sec/10 p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="doNegocjacji"
              className="cursor-pointer text-sm font-semibold text-white block"
            >
              Budżet pozostawiam do negocjacji z ekspertem
            </Label>
            <p className="text-xs text-muted-foreground font-light">
              Włącz tę opcję, jeśli chcesz otrzymać propozycje wyceny bezpośrednio od ekspertów.
            </p>
          </div>
          <Switch
            id="doNegocjacji"
            checked={formData.doNegocjacji}
            onCheckedChange={(checked) => {
              updateFormData("doNegocjacji", checked);
              if (checked) {
                updateFormData("budzetOd", "");
                updateFormData("budzetDo", "");
              }
            }}
          />
        </div>

        <AnimatePresence>
          {!formData.doNegocjacji && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden pt-3 border-t border-border/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="budzetOd"
                    className="text-muted-foreground text-xs font-semibold block mb-1.5"
                  >
                    Szacowany budżet od (PLN)
                  </Label>
                  <Input
                    id="budzetOd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budzetOd}
                    onChange={(e) => updateFormData("budzetOd", e.target.value)}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="budzetDo"
                    className="text-muted-foreground text-xs font-semibold block mb-1.5"
                  >
                    Szacowany budżet do (PLN)
                  </Label>
                  <Input
                    id="budzetDo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budzetDo}
                    onChange={(e) => updateFormData("budzetDo", e.target.value)}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Wskazówka
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            Określenie zakresu finansowego pozwala ekspertom dopasować wycenę do
            Twoich możliwości. Jeśli nie znasz szacowanego kosztu, zostaw opcję
            budżetu do negocjacji włączoną.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-5">
      <div>
        <Label
          htmlFor="imieNazwisko"
          className="text-muted-foreground text-xs font-semibold"
        >
          Imię i nazwisko / Nazwa podmiotu *
        </Label>
        <Input
          id="imieNazwisko"
          value={formData.imieNazwisko}
          onChange={(e) => updateFormData("imieNazwisko", e.target.value)}
          placeholder="Jan Kowalski"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="telefonKontakt"
            className="text-muted-foreground text-xs font-semibold"
          >
            Numer telefonu *
          </Label>
          <Input
            id="telefonKontakt"
            type="tel"
            value={formData.telefonKontakt}
            onChange={(e) => updateFormData("telefonKontakt", e.target.value)}
            placeholder="+48 123 456 789"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="preferowanyKontakt"
          className="text-muted-foreground text-xs font-semibold"
        >
          Preferowana forma kontaktu *
        </Label>
        <Select
          value={formData.preferowanyKontakt}
          onValueChange={(value) => updateFormData("preferowanyKontakt", value)}
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
      </div>

      <div className="flex items-start space-x-3 rounded-lg border border-border/30 p-4 bg-background-sec/20 mt-6">
        <Checkbox
          id="akceptujeKlauzule"
          checked={formData.akceptujeKlauzule}
          onCheckedChange={(checked) =>
            updateFormData("akceptujeKlauzule", checked)
          }
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
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMoreGDPR(true);
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
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMoreGDPR(false);
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
  );

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <Heading
          level="h1"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
        >
          Dodaj nową sprawę
        </Heading>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">
          Wypełnij poniższy formularz krok po kroku. Umożliwi to prawnikom
          dokładną analizę i rzetelną wycenę Twojej sprawy.
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

      {/* Main Form Area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative z-10"
      >
        <Card variant="glass" className="relative overflow-hidden">
          <BorderBeam
            lightColor="var(--primary)"
            lightWidth={400}
            duration={8}
            borderWidth={1}
          />
          <CardContent className="p-4 sm:p-6">
            {renderStepIndicator()}

            <div className="min-h-[300px] py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={stepContainerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderDescriptionStep()}
                  {currentStep === 3 && renderCategoryStep()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between pt-6 border-t border-border/20 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="h-11 px-5 gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Wstecz
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="h-11 px-6 shadow-md shadow-primary/20 group gap-1.5"
                >
                  Dalej
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-11 px-6 shadow-md shadow-primary/20 group gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5 text-white" />
                      Dodawanie...
                    </>
                  ) : (
                    <>
                      Utwórz sprawę
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Popup potwierdzający dodanie sprawy */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          // Po zamknięciu popupu przenosimy klienta do dodanej sprawy
          if (!open && createdCaseId) {
            router.push(`/panel-klienta/sprawy/${createdCaseId}`);
          }
          setShowSuccessDialog(open);
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
            <DialogTitle className="text-xl font-bold font-playfair text-white">
              Sprawa została dodana!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed mt-1">
              Twoja sprawa jest już w systemie! Prawnicy specjalizujący się w
              tej dziedzinie wkrótce zapoznają się z jej szczegółami i złożą
              swoje oferty. Otrzymasz powiadomienie, gdy tylko pojawią się nowe
              propozycje. Dziękujemy za zaufanie!
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/panel-klienta/sprawy");
              }}
              className="h-11 px-5"
            >
              Przejdź do listy spraw
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setShowSuccessDialog(false);
                if (createdCaseId) {
                  router.push(`/panel-klienta/sprawy/${createdCaseId}`);
                }
              }}
              className="h-11 px-5 shadow-md shadow-primary/20 gap-1.5"
            >
              Zobacz sprawę
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup weryfikacji kodem email (OTP) przed utworzeniem sprawy */}
      <Dialog
        open={showOtpDialog}
        onOpenChange={(open) => {
          setShowOtpDialog(open);
          if (!open) {
            setOtpCode("");
            setOtpError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md p-6 text-center">
          <DialogHeader className="items-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold font-playfair text-white">
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
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyOtp();
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] h-14 font-semibold"
              autoFocus
            />
            {otpError && (
              <p className="text-sm text-destructive">{otpError}</p>
            )}
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
    </div>
  );
}
