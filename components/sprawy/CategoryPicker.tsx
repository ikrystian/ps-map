"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

export type CaseTypeValue = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA" | "";

/** Kategoria zwracana przez `GET /api/categories` (pola istotne dla wyboru). */
export interface CategoryOption {
  id: string;
  nazwa: string;
  parentId?: string | null;
  typ?: string;
  aktywna?: boolean;
  /** Usługi ekspertów — osobna grupa w lewej kolumnie modala */
  ekspercka?: boolean;
  children?: CategoryOption[];
  /** Nazwa dziedziny nadrzędnej — dokładana przy wynikach wyszukiwania */
  parentName?: string;
}

/** Kategorie prywatne vs firmowe — typ sprawy decyduje, którą gałąź drzewa pokazujemy. */
export function getCategoryTypeFor(typSprawy: CaseTypeValue) {
  return typSprawy === "OSOBA_PRYWATNA" ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE";
}

/** Buduje dwupoziomowe drzewo (dziedziny → specjalizacje) dla wybranego typu sprawy. */
export function buildCategoryTree(categories: CategoryOption[], typSprawy: CaseTypeValue): CategoryOption[] {
  const targetType = getCategoryTypeFor(typSprawy);
  const activeCats = categories.filter((cat) => cat.aktywna && cat.typ === targetType);
  const rootCats = activeCats.filter((cat) => !cat.parentId);

  return rootCats.map((root) => ({
    ...root,
    children: activeCats.filter((cat) => cat.parentId === root.id),
  }));
}

/** „Prawo rodzinne → Rozwody" — etykieta chipa wybranej kategorii. */
export function getCategoryPath(categories: CategoryOption[], categoryId: string): string | null {
  const selected = categories.find((cat) => cat.id === categoryId);
  if (!selected) return null;
  if (selected.parentId) {
    const parent = categories.find((cat) => cat.id === selected.parentId);
    if (parent) return `${parent.nazwa} → ${selected.nazwa}`;
  }
  return selected.nazwa;
}

interface CategoryPickerProps {
  /** Pełna lista kategorii z `GET /api/categories` */
  categories: CategoryOption[];
  isLoadingCategories?: boolean;
  typSprawy: CaseTypeValue;
  value: string[];
  onChange: (categoryIds: string[]) => void;
  hasError?: boolean;
}

/**
 * Wybór kategorii sprawy: modal z wyszukiwarką i dwukolumnowym drzewem
 * (Działy prawa / Specjalizacje). Używany w kreatorze sprawy klienta
 * oraz w formularzu polecenia sprawy w panelu eksperta.
 */
export function CategoryPicker({
  categories,
  isLoadingCategories = false,
  typSprawy,
  value,
  onChange,
  hasError,
}: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const filteredCats = buildCategoryTree(categories, typSprawy);

  // Przy otwieraniu modala ustaw dziedzinę odpowiadającą pierwszej wybranej kategorii
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setSearchQuery("");
      return;
    }

    const firstCategoryId = value[0];
    if (!firstCategoryId) return;

    const parent =
      filteredCats.find((c) => c.id === firstCategoryId) ??
      filteredCats.find((c) => c.children?.some((child) => child.id === firstCategoryId));

    if (parent) setSelectedParentId(parent.id);
  };

  const toggleCategory = (categoryId: string) => {
    const isCurrentlySelected = value.includes(categoryId);
    onChange(
      isCurrentlySelected ? value.filter((id) => id !== categoryId) : [...value, categoryId],
    );

    // Po zaznaczeniu kategorii automatycznie wybierz jej dziedzinę nadrzędną
    if (!isCurrentlySelected) {
      const selectedCat = categories.find((cat) => cat.id === categoryId);
      if (selectedCat) {
        setSelectedParentId(selectedCat.parentId || selectedCat.id);
      }
    }
  };

  const getSearchResults = () => {
    const targetType = getCategoryTypeFor(typSprawy);
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const activeCats = categories.filter((cat) => cat.aktywna && cat.typ === targetType);

    return activeCats
      .filter((cat) => cat.nazwa.toLowerCase().includes(query))
      .map((cat) => {
        let parentName = "";
        if (cat.parentId) {
          const parent = activeCats.find((p) => p.id === cat.parentId);
          if (parent) parentName = parent.nazwa;
        }
        return { ...cat, parentName };
      });
  };

  const selectedCategories = value
    .map((id) => ({ id, path: getCategoryPath(categories, id) }))
    .filter((cat) => !!cat.path);
  const activeParentId = selectedParentId || (filteredCats.length > 0 ? filteredCats[0].id : null);
  const activeParent = filteredCats.find((cat) => cat.id === activeParentId);
  const activeChildren = activeParent?.children || [];
  const searchResults = getSearchResults();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {selectedCategories.length > 0 ? (
        <Card className="border border-primary/40 bg-primary/10 rounded-xl shadow-md overflow-hidden relative">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-xs">
                <FolderOpen className="h-5 w-5" />
              </div>
              <p className="text-xs text-white uppercase tracking-wider font-bold">
                Wybrane kategorie ({selectedCategories.length})
              </p>
            </div>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3.5 rounded-lg border-primary/40 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Zmień kategorie
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent className="p-4 flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-xs font-semibold text-white shadow-xs hover:bg-primary/30 transition-colors"
              >
                {cat.path}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="h-5 w-5 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-destructive/80 transition-colors cursor-pointer"
                  aria-label={`Usuń kategorię ${cat.path}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </CardContent>
        </Card>
      ) : (
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex flex-col items-center justify-center py-7 px-5 border-2 border-dashed rounded-xl transition-all duration-200 text-center group cursor-pointer shadow-sm relative overflow-hidden",
              hasError
                ? "border-destructive/80 bg-destructive/5 hover:border-destructive"
                : "border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.09] hover:border-primary hover:shadow-md hover:shadow-primary/5",
            )}
          >
            <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all mb-3 shadow-xs">
              <Search className="h-5 w-5" />
            </div>
            <span className="font-bold text-base text-white group-hover:text-primary transition-colors flex items-center gap-2">
              Wybierz kategorie sprawy
              <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-normal group-hover:text-zinc-300">
              Kliknij, aby otworzyć wyszukiwarkę i pełny spis dziedzin prawa
            </span>
            <span className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Otwórz listę kategorii <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col p-5 sm:p-6 overflow-hidden border-border/40">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 blur-[70px] rounded-full pointer-events-none" />
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-playfair text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Wybierz kategorie sprawy
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Wyszukaj odpowiednie kategorie prawne lub wybierz je z podziału tematycznego. Możesz
            zaznaczyć więcej niż jedną.
          </DialogDescription>
        </DialogHeader>

        {/* Wyszukiwarka */}
        <div className="relative my-3 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Wpisz np. rozwód, praca, spółka..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-11 text-sm bg-background-sec/40 border-border/40 focus:border-primary rounded-xl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchQuery ? (
          /* Wyniki wyszukiwania */
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 my-2">
            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm font-light">
                Nie znaleziono kategorii dla frazy &quot;{searchQuery}&quot;
              </div>
            ) : (
              searchResults.map((cat) => {
                const isSelected = value.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer group my-1",
                      isSelected
                        ? "border-primary bg-primary/15 text-white shadow-sm ring-1 ring-primary/30"
                        : "border-border/30 bg-background-sec/30 text-zinc-200 hover:border-primary/60 hover:bg-primary/10 hover:text-white shadow-xs",
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-white">{cat.nazwa}</span>
                      {cat.parentName && (
                        <span className="text-xs text-muted-foreground font-normal mt-0.5">
                          Dziedzina nadrzędna: {cat.parentName}
                        </span>
                      )}
                    </div>
                    {isSelected ? (
                      <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-md border border-border/50 group-hover:border-primary group-hover:bg-primary/20 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Układ dwukolumnowy */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[350px] md:h-[400px] flex-1 min-h-0 my-2 overflow-hidden">
            {/* Lewa kolumna: Kategorie główne (2/5) */}
            <div
              className={cn(
                "md:col-span-2 border border-border/20 rounded-xl p-2 overflow-y-auto bg-background-sec/20 space-y-1 h-full",
                selectedParentId !== null ? "hidden md:block" : "block",
              )}
            >
              <div className="text-xs font-bold text-muted-foreground/80 px-2.5 py-1.5 uppercase tracking-wider mb-1">
                Działy prawa
              </div>
              {isLoadingCategories ? (
                <div className="text-xs text-muted-foreground px-2 py-2 flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Ładowanie...
                </div>
              ) : filteredCats.length === 0 ? (
                <div className="text-xs text-muted-foreground px-2 py-2">
                  Brak dostępnych kategorii
                </div>
              ) : (
                // Grupowanie: kategorie prawne vs usługi ekspertów
                [
                  { label: "Sprawy prawne", items: filteredCats.filter((c) => !c.ekspercka) },
                  { label: "Usługi ekspertów", items: filteredCats.filter((c) => c.ekspercka) },
                ]
                  .filter((group) => group.items.length > 0)
                  .map((group, _, groups) => (
                    <div key={group.label} className="space-y-1">
                      {groups.length > 1 && (
                        <div className="text-[10px] font-bold text-muted-foreground/70 px-2.5 pt-2 uppercase tracking-wider">
                          {group.label}
                        </div>
                      )}
                      {group.items.map((parent) => {
                        const isActive = activeParentId === parent.id;
                        const selectedCountInParent = [
                          parent.id,
                          ...(parent.children?.map((c) => c.id) || []),
                        ].filter((id) => value.includes(id)).length;

                        return (
                          <button
                            key={parent.id}
                            type="button"
                            onClick={() => setSelectedParentId(parent.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-all cursor-pointer group my-0.5 border",
                              isActive
                                ? "bg-primary text-primary-foreground font-bold border-primary shadow-md"
                                : "bg-background-sec/30 text-zinc-300 border-border/20 hover:border-primary/40 hover:bg-primary/15 hover:text-white",
                            )}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              {parent.nazwa}
                              {selectedCountInParent > 0 && (
                                <span
                                  className={cn(
                                    "h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0",
                                    isActive
                                      ? "bg-white text-primary"
                                      : "bg-primary text-primary-foreground",
                                  )}
                                >
                                  {selectedCountInParent}
                                </span>
                              )}
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
                                isActive
                                  ? "text-primary-foreground opacity-100"
                                  : "text-muted-foreground group-hover:text-primary opacity-70",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ))
              )}
            </div>

            {/* Prawa kolumna: Podkategorie (3/5) */}
            <div
              className={cn(
                "md:col-span-3 border border-border/20 rounded-xl p-2.5 overflow-y-auto space-y-2 h-full bg-background-sec/10",
                selectedParentId === null ? "hidden md:block" : "block",
              )}
            >
              {activeParent ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedParentId(null)}
                    className="md:hidden mb-2.5 w-full flex items-center justify-start gap-2 h-9 text-xs text-primary font-semibold hover:bg-primary/10 border border-primary/20 rounded-lg cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Wróć do kategorii
                  </Button>
                  <div className="text-xs font-bold text-white px-2.5 py-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Specjalizacje: {activeParent.nazwa}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {/* Opcja wyboru samej kategorii głównej */}
                    {(() => {
                      const isParentSelected = value.includes(activeParent.id);
                      return (
                        <button
                          type="button"
                          onClick={() => toggleCategory(activeParent.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer group my-1",
                            isParentSelected
                              ? "border-primary bg-primary/15 text-white ring-1 ring-primary/30 shadow-xs"
                              : "border-dashed border-border/40 bg-background-sec/30 text-zinc-200 hover:border-primary/60 hover:bg-primary/15 hover:text-white shadow-xs",
                          )}
                        >
                          <div className="flex flex-col pr-2">
                            <span className="font-bold text-xs text-white group-hover:text-primary transition-colors">
                              Ogólny zakres: {activeParent.nazwa}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-normal mt-0.5 leading-snug">
                              Wybierz, jeśli sprawa dotyczy całego zakresu tej dziedziny
                            </span>
                          </div>
                          {isParentSelected ? (
                            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-md border border-border/80 group-hover:border-primary group-hover:bg-primary/20 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                              <Plus className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })()}

                    {activeChildren.length > 0 && <div className="h-px bg-border/30 my-2" />}

                    {/* Lista podkategorii */}
                    {activeChildren.map((child) => {
                      const isChildSelected = value.includes(child.id);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => toggleCategory(child.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all text-xs font-medium cursor-pointer group my-0.5",
                            isChildSelected
                              ? "border-primary bg-primary/15 text-white font-semibold shadow-xs ring-1 ring-primary/20"
                              : "border-border/30 bg-background-sec/25 text-zinc-200 hover:border-primary/50 hover:bg-primary/15 hover:text-white shadow-xs",
                          )}
                        >
                          <span className="pr-2">{child.nazwa}</span>
                          {isChildSelected ? (
                            <div className="h-5 w-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-md border border-border/40 group-hover:border-primary/60 group-hover:bg-primary/20 flex items-center justify-center shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors">
                              <Plus className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
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

        <DialogFooter className="pt-3 border-t border-border/20">
          <div className="flex items-center justify-between w-full gap-3">
            <span
              className={cn(
                "text-xs transition-colors",
                value.length > 0 ? "text-primary font-bold" : "text-muted-foreground font-normal",
              )}
            >
              Wybrane kategorie: {value.length}
            </span>
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsOpen(false)}
              disabled={value.length === 0}
              className="h-10 px-6 font-bold shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              Zatwierdź wybór
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
