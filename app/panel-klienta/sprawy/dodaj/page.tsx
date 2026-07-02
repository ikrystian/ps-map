"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Sparkles,
  Loader2,
  User,
  Building2,
  Landmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {};

type CaseType = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA";
type PreferredContact = "EMAIL" | "TELEFON" | "OBA";

interface FileAttachment {
  url: string;
  originalName: string;
}

interface FormData {
  // Krok 1: Typ sprawy
  typSprawy: CaseType | "";

  // Krok 2: Kategoria
  categoryId: string;
  voivodeshipId: string;
  cityId: string;

  // Krok 3: Opis
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [selectedParentIdForModal, setSelectedParentIdForModal] = useState<
    string | null
  >(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [voivodeships, setVoivodeships] = useState<any[]>([]);
  const [isLoadingVoivodeships, setIsLoadingVoivodeships] = useState(true);
  const [cities, setCities] = useState<any[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [showMoreGDPR, setShowMoreGDPR] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    typSprawy: "",
    categoryId: "",
    voivodeshipId: "",
    cityId: "",
    nazwaSprawy: "",
    opisSprawy: "",
    zalaczniki: [],
    oczekiwanyTerminRealizacji: "",
    trybPilny: false,
    budzetOd: "",
    budzetDo: "",
    doNegocjacji: false,
    imieNazwisko: "",
    telefonKontakt: "",
    preferowanyKontakt: "EMAIL",
    akceptujeKlauzule: false,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  // Dynamic fetch and caching for cities
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase();
    if (query.length < 2) {
      setCities([]);
      setIsLoadingCities(false);
      return;
    }

    if (clientCitiesCache[query]) {
      setCities(clientCitiesCache[query]);
      setIsLoadingCities(false);
      return;
    }

    setIsLoadingCities(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/cities?search=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            clientCitiesCache[query] = data;
            setCities(data);
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cities:", error);
        }
      } finally {
        setIsLoadingCities(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [locationSearch]);

  // Reset location search when popover closes
  useEffect(() => {
    if (!locationOpen) {
      setLocationSearch("");
      setCities([]);
    }
  }, [locationOpen]);

  const getFilteredCategories = () => {
    const isPrivate = formData.typSprawy === "OSOBA_PRYWATNA";
    const targetType = isPrivate ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE";

    // Filter active categories of targetType
    const activeCats = categories.filter(
      (cat: any) => cat.aktywna && cat.typ === targetType,
    );

    // Build root categories (those without parentId)
    const rootCats = activeCats.filter((cat: any) => !cat.parentId);

    return rootCats.map((root: any) => {
      // Find children belonging to this root
      const children = activeCats.filter(
        (cat: any) => cat.parentId === root.id,
      );
      return {
        ...root,
        children,
      };
    });
  };

  const getSelectedCategoryPath = () => {
    if (!formData.categoryId) return null;
    const selected = categories.find(
      (cat: any) => cat.id === formData.categoryId,
    );
    if (!selected) return null;
    if (selected.parentId) {
      const parent = categories.find(
        (cat: any) => cat.id === selected.parentId,
      );
      if (parent) {
        return `${parent.nazwa} → ${selected.nazwa}`;
      }
    }
    return selected.nazwa;
  };

  const getSearchResults = () => {
    const isPrivate = formData.typSprawy === "OSOBA_PRYWATNA";
    const targetType = isPrivate ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE";
    const query = categorySearchQuery.toLowerCase().trim();
    if (!query) return [];

    const activeCats = categories.filter(
      (cat: any) => cat.aktywna && cat.typ === targetType,
    );

    return activeCats
      .filter((cat: any) => cat.nazwa.toLowerCase().includes(query))
      .map((cat: any) => {
        let parentName = "";
        if (cat.parentId) {
          const parent = activeCats.find((p: any) => p.id === cat.parentId);
          if (parent) {
            parentName = parent.nazwa;
          }
        }
        return {
          ...cat,
          parentName,
        };
      });
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

  // Pobierz dane użytkownika i uzupełnij dane kontaktowe
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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.typSprawy;
      case 2:
        return (
          !!formData.categoryId && !!formData.voivodeshipId && !!formData.cityId
        );
      case 3:
        return !!formData.nazwaSprawy && formData.opisSprawy.length >= 50;
      case 4:
        return true; // Termin i budżet są opcjonalne
      case 5:
        return (
          !!formData.imieNazwisko &&
          !!formData.telefonKontakt &&
          !!formData.preferowanyKontakt &&
          formData.akceptujeKlauzule
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          oczekiwanyTerminRealizacji:
            formData.oczekiwanyTerminRealizacji || null,
          budzetOd: formData.budzetOd ? parseFloat(formData.budzetOd) : null,
          budzetDo: formData.budzetDo ? parseFloat(formData.budzetDo) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedCaseId(data.id);
        setShowSuccessDialog(true);
      } else {
        toast.error("Błąd podczas dodawania sprawy");
      }
    } catch (error) {
      console.error("Error submitting case:", error);
      toast.error("Wystąpił błąd podczas dodawania sprawy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {[1, 2, 3, 4, 5].map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-300 relative",
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
                    "mx-2 h-0.5 w-12 sm:w-16 rounded-full transition-all duration-300",
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
          {currentStep === 2 && "Krok 2: Kategoria i Lokalizacja"}
          {currentStep === 3 && "Krok 3: Opis i Szczegóły"}
          {currentStep === 4 && "Krok 4: Harmonogram i Budżet"}
          {currentStep === 5 && "Krok 5: Kontakt i Weryfikacja"}
        </h3>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-muted-foreground text-sm font-semibold mb-4 block">
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
                    : "border-border/30 bg-background-sec/10 hover:border-border/60",
                )}
                onClick={() => {
                  updateFormData("typSprawy", option.value);
                  updateFormData("categoryId", ""); // Reset selected category
                  setSelectedParentIdForModal(null); // Reset selected parent category in modal
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
      </div>
    </div>
  );

  const renderStep2 = () => {
    const filteredCats = getFilteredCategories();
    const selectedPath = getSelectedCategoryPath();
    const activeParentId =
      selectedParentIdForModal ||
      (filteredCats.length > 0 ? filteredCats[0].id : null);
    const activeParent = filteredCats.find(
      (cat: any) => cat.id === activeParentId,
    );
    const activeChildren = activeParent?.children || [];

    return (
      <div className="space-y-5">
        <div>
          <Label className="text-muted-foreground text-xs font-semibold mb-2 block">
            Kategoria sprawy *
          </Label>
          <Dialog
            open={isCategoryModalOpen}
            onOpenChange={(open) => {
              setIsCategoryModalOpen(open);
              if (!open) {
                setCategorySearchQuery("");
              }
            }}
          >
            {selectedPath ? (
              <Card className="border border-primary/30 bg-primary/5 rounded-lg shadow-md overflow-hidden relative">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground/70 uppercase tracking-wider font-semibold">
                        Wybrana kategoria
                      </p>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {selectedPath}
                      </h4>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-md border-border/50 text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-semibold shrink-0"
                    >
                      Zmień kategorię
                    </Button>
                  </DialogTrigger>
                </CardHeader>
              </Card>
            ) : (
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-border/20 hover:border-primary/40 rounded-lg hover:bg-background-sec/20 transition-all text-center group"
                >
                  <div className="h-11 w-11 rounded-md bg-background-sec border border-border/10 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 flex items-center justify-center text-muted-foreground transition-all mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-sm text-white group-hover:text-primary transition-colors">
                    Wybierz kategorię sprawy
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 font-light">
                    Kliknij, aby otworzyć wyszukiwarkę i spis dziedzin prawa
                  </span>
                </button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-3xl w-full p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[70px] rounded-full pointer-events-none" />
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-playfair text-white">
                  Wybierz kategorię sprawy
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Wyszukaj odpowiednią kategorię prawną lub wybierz ją ręcznie z
                  podziału tematycznego.
                </DialogDescription>
              </DialogHeader>

              {/* Wyszukiwarka */}
              <div className="relative my-3 group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Wpisz np. rozwód, praca, spółka..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-11 text-sm"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {categorySearchQuery ? (
                /* Wyniki wyszukiwania */
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 my-2">
                  {getSearchResults().length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm font-light">
                      Nie znaleziono kategorii dla frazy &quot;
                      {categorySearchQuery}&quot;
                    </div>
                  ) : (
                    getSearchResults().map((cat: any) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          updateFormData("categoryId", cat.id);
                          setIsCategoryModalOpen(false);
                          setCategorySearchQuery("");
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all",
                          formData.categoryId === cat.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/10 hover:border-primary/50 hover:bg-primary/10 hover:text-white",
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-zinc-200">
                            {cat.nazwa}
                          </span>
                          {cat.parentName && (
                            <span className="text-sm text-muted-foreground font-light mt-0.5">
                              Dziedzina nadrzędna: {cat.parentName}
                            </span>
                          )}
                        </div>
                        {formData.categoryId === cat.id && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                /* Układ dwukolumnowy */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[320px] my-2">
                  {/* Lewa kolumna: Kategorie główne (2/5) */}
                  <div className="md:col-span-2 border border-border/10 rounded-lg p-2 overflow-y-auto bg-background-sec/10 space-y-1">
                    <div className="text-sm font-semibold text-muted-foreground px-2.5 py-1 uppercase tracking-wider mb-1">
                      Działy prawa
                    </div>
                    {isLoadingCategories ? (
                      <div className="text-xs text-muted-foreground px-2 py-2 flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />{" "}
                        Ładowanie...
                      </div>
                    ) : filteredCats.length === 0 ? (
                      <div className="text-xs text-muted-foreground px-2 py-2">
                        Brak dostępnych kategorii
                      </div>
                    ) : (
                      // Grupowanie: kategorie prawne vs usługi ekspertów (flaga `ekspercka`)
                      [
                        {
                          label: "Sprawy prawne",
                          items: filteredCats.filter((c: any) => !c.ekspercka),
                        },
                        {
                          label: "Usługi ekspertów",
                          items: filteredCats.filter((c: any) => c.ekspercka),
                        },
                      ]
                        .filter((group) => group.items.length > 0)
                        .map((group, _, groups) => (
                          <div key={group.label} className="space-y-1">
                            {groups.length > 1 && (
                              <div className="text-[10px] font-semibold text-muted-foreground/70 px-2.5 pt-2 uppercase tracking-wider">
                                {group.label}
                              </div>
                            )}
                            {group.items.map((parent: any) => (
                              <button
                                key={parent.id}
                                type="button"
                                onClick={() => setSelectedParentIdForModal(parent.id)}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all",
                                  activeParentId === parent.id
                                    ? "bg-primary text-primary-foreground font-semibold shadow-md"
                                    : "text-muted-foreground hover:text-white hover:bg-primary/15",
                                )}
                              >
                                <span className="truncate">{parent.nazwa}</span>
                                <ChevronRight
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0 opacity-70",
                                    activeParentId === parent.id
                                      ? "text-white"
                                      : "text-muted-foreground",
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        ))
                    )}
                  </div>

                  {/* Prawa kolumna: Podkategorie (3/5) */}
                  <div className="md:col-span-3 border border-border/10 rounded-lg p-2 overflow-y-auto space-y-2">
                    {activeParent ? (
                      <>
                        <div className="text-sm font-semibold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
                          Specjalizacje: {activeParent.nazwa}
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {/* Opcja wyboru samej kategorii głównej */}
                          <button
                            type="button"
                            onClick={() => {
                              updateFormData("categoryId", activeParent.id);
                              setIsCategoryModalOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                              formData.categoryId === activeParent.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-dashed border-border/20 hover:border-primary hover:bg-primary/10",
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-white">
                                Ogólny zakres: {activeParent.nazwa}
                              </span>
                              <span className="text-sm text-muted-foreground font-light mt-0.5 leading-normal">
                                Wybierz, jeśli sprawa dotyczy całego zakresu tej
                                dziedziny
                              </span>
                            </div>
                            {formData.categoryId === activeParent.id && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </button>

                          {/* Separator */}
                          {activeChildren.length > 0 && (
                            <div className="h-px bg-zinc-800/60 my-2" />
                          )}

                          {/* Lista podkategorii */}
                          {activeChildren.map((child: any) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => {
                                updateFormData("categoryId", child.id);
                                setIsCategoryModalOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-lg border border-border/10 text-left transition-all text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-white",
                                formData.categoryId === child.id &&
                                  "border-primary bg-primary/5 text-primary hover:border-primary",
                              )}
                            >
                              <span>{child.nazwa}</span>
                              {formData.categoryId === child.id && (
                                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground text-xs font-light">
                        Wybierz dziedzinę główną z panelu po lewej stronie.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="cityId"
            className="text-muted-foreground text-xs font-semibold"
          >
            Miasto *
          </Label>
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="h-11 w-full bg-background-sec/20 border-border/30 rounded-lg text-muted-foreground text-sm font-normal text-left justify-between mt-1.5"
              >
                <span className="truncate">
                  {selectedCityName || "Wybierz miasto..."}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Wyszukaj miasto..."
                  value={locationSearch}
                  onValueChange={setLocationSearch}
                />
                <CommandList className="max-h-60 overflow-y-auto">
                  {isLoadingCities && (
                    <div className="text-neutral-400 py-3 text-center text-xs">
                      Wyszukiwanie...
                    </div>
                  )}
                  {!isLoadingCities && locationSearch.trim().length < 2 && (
                    <div className="text-neutral-400 py-3 text-center text-xs px-3">
                      Wpisz co najmniej 2 znaki...
                    </div>
                  )}
                  {!isLoadingCities &&
                    locationSearch.trim().length >= 2 &&
                    cities.length === 0 && (
                      <div className="text-neutral-400 py-3 text-center text-xs">
                        Nie znaleziono miasta.
                      </div>
                    )}
                  <CommandGroup>
                    {cities.map((city: any) => {
                      const matchedPostal = city.postalCodes?.find((p: any) =>
                        p.code
                          .toLowerCase()
                          .includes(locationSearch.trim().toLowerCase()),
                      );
                      const displayValue = matchedPostal
                        ? `${city.nazwa} (${matchedPostal.code})`
                        : city.nazwa;

                      return (
                        <CommandItem
                          key={city.id}
                          value={city.nazwa}
                          onSelect={() => {
                            setFormData((prev: any) => ({
                              ...prev,
                              cityId: city.id,
                              voivodeshipId: city.voivodeship?.slug || "",
                            }));
                            setSelectedCityName(city.nazwa);
                            setLocationOpen(false);
                          }}
                          className="cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-lg data-[selected=true]:bg-background-sec text-white"
                        >
                          <div className="flex items-center gap-2">
                            <Check
                              className={cn(
                                "h-4 w-4 text-primary",
                                formData.cityId === city.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span>{displayValue}</span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2 text-right">
                            {city.voivodeship?.nazwa}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <Label
          htmlFor="nazwaSprawy"
          className="text-muted-foreground text-xs font-semibold"
        >
          Nazwa sprawy *
        </Label>
        <Input
          id="nazwaSprawy"
          value={formData.nazwaSprawy}
          onChange={(e) => updateFormData("nazwaSprawy", e.target.value)}
          placeholder="np. Sporządzenie umowy najmu lokalu komercyjnego"
          className="h-11 mt-1.5"
        />
      </div>

      <div>
        <Label
          htmlFor="opisSprawy"
          className="text-muted-foreground text-xs font-semibold"
        >
          Opis sprawy * (minimum 50 znaków)
        </Label>
        <Textarea
          id="opisSprawy"
          value={formData.opisSprawy}
          onChange={(e) => updateFormData("opisSprawy", e.target.value)}
          placeholder="Opisz szczegółowo stan faktyczny, kluczowe okoliczności, cele oraz pytania prawne, na które szukasz odpowiedzi..."
          rows={8}
          className="mt-1.5 resize-none"
        />
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
              <span className="text-xs text-muted-foreground truncate max-w-md">
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
          className="text-muted-foreground text-xs font-semibold"
        >
          Oczekiwany termin realizacji (opcjonalnie)
        </Label>
        <Input
          id="oczekiwanyTerminRealizacji"
          type="date"
          value={formData.oczekiwanyTerminRealizacji}
          className="h-11 mt-1.5"
          onChange={(e) =>
            updateFormData("oczekiwanyTerminRealizacji", e.target.value)
          }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="budzetOd"
            className="text-muted-foreground text-xs font-semibold"
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
            className="h-11 mt-1.5"
          />
        </div>
        <div>
          <Label
            htmlFor="budzetDo"
            className="text-muted-foreground text-xs font-semibold"
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
            className="h-11 mt-1.5"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 py-1.5">
        <Checkbox
          id="doNegocjacji"
          checked={formData.doNegocjacji}
          onCheckedChange={(checked) => updateFormData("doNegocjacji", checked)}
          className="h-5 w-5 border-border/50 text-primary focus:ring-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-transparent rounded"
        />
        <Label
          htmlFor="doNegocjacji"
          className="cursor-pointer text-sm text-muted-foreground font-medium"
        >
          Budżet pozostawiam do negocjacji z ekspertem
        </Label>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Wskazówka
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            Określenie zakresu finansowego pozwala ekspertom dopasować wycenę do
            Twoich możliwości. Jeśli nie znasz szacowanego kosztu, zostaw pola
            puste i zaznacz opcję budżetu do negocjacji.
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
          className="h-11 mt-1.5"
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
            className="h-11 mt-1.5"
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
          <SelectTrigger id="preferowanyKontakt" className="h-11 mt-1.5">
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
          <CardContent className="p-6">
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
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
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
                  disabled={!validateStep(currentStep)}
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
                  disabled={!validateStep(5) || isSubmitting}
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
    </div>
  );
}
