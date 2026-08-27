"use client"

import { Label } from "@/components/ui/label"
import { CategoryPicker } from "@/components/sprawy/CategoryPicker"
import { CityCombobox } from "@/components/sprawy/CityCombobox"
import { cn } from "@/lib/utils"
import { Loader2, Sparkles } from "lucide-react"
import type { CaseType } from "@/components/sprawy/case-draft-types"

interface CaseCategoryLocationStepProps {
  categories: any[]
  isLoadingCategories: boolean
  typSprawy: CaseType | ""
  categoryIds: string[]
  onCategoryIdsChange: (categoryIds: string[]) => void
  categoryError?: string
  cityId: string
  selectedCityName: string
  cityError?: string
  onCitySelect: (city: { id: string; nazwa: string; voivodeshipSlug: string }) => void
  onSuggestCategories: () => void
  isSuggestingCategories: boolean
  aiSuggestion: { uzasadnienie: string; categories: { id: string; nazwa: string; path: string }[] } | null
}

export function CaseCategoryLocationStep({
  categories,
  isLoadingCategories,
  typSprawy,
  categoryIds,
  onCategoryIdsChange,
  categoryError,
  cityId,
  selectedCityName,
  cityError,
  onCitySelect,
  onSuggestCategories,
  isSuggestingCategories,
  aiSuggestion,
}: CaseCategoryLocationStepProps) {
  return (
    <div className="space-y-5">
      <div id="field-categoryIds">
        <Label
          className={cn(
            "text-muted-foreground text-xs font-semibold mb-2 block",
            categoryError && "text-destructive",
          )}
        >
          Kategorie sprawy * (możesz wybrać więcej niż jedną)
        </Label>
        <CategoryPicker
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          typSprawy={typSprawy}
          value={categoryIds}
          onChange={onCategoryIdsChange}
          hasError={!!categoryError}
        />

        {categoryError && (
          <p className="text-xs text-destructive mt-2 font-medium">
            {categoryError}
          </p>
        )}

        {/* Automatyczny dobór kategorii przez AI na podstawie opisu z kroku 2 */}
        <button
          type="button"
          onClick={onSuggestCategories}
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
              <p className="text-xs text-foreground/80 leading-relaxed font-normal">
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
            cityError && "text-destructive",
          )}
        >
          Miasto *
        </Label>
        <CityCombobox
          value={cityId}
          cityName={selectedCityName}
          hasError={!!cityError}
          onSelect={onCitySelect}
        />
        {cityError && (
          <p className="text-xs text-destructive mt-1 font-medium">{cityError}</p>
        )}
      </div>
    </div>
  )
}
