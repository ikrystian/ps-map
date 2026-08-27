"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Loader2, Upload, X } from "lucide-react"
import type { FileAttachment } from "@/components/sprawy/case-draft-types"

interface CaseDescriptionStepProps {
  nazwaSprawy: string
  opisSprawy: string
  errors: { nazwaSprawy?: string; opisSprawy?: string }
  onNazwaChange: (value: string) => void
  onOpisChange: (value: string) => void
  uploadedFiles: FileAttachment[]
  isUploading: boolean
  onFilesSelected: (files: FileList) => void
  onRemoveFile: (index: number) => void
}

export function CaseDescriptionStep({
  nazwaSprawy,
  opisSprawy,
  errors,
  onNazwaChange,
  onOpisChange,
  uploadedFiles,
  isUploading,
  onFilesSelected,
  onRemoveFile,
}: CaseDescriptionStepProps) {
  return (
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
          value={nazwaSprawy}
          onChange={(e) => onNazwaChange(e.target.value)}
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
          value={opisSprawy}
          onChange={(e) => onOpisChange(e.target.value)}
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
              opisSprawy.length >= 50
                ? "bg-success/10 text-success border-success/20"
                : "bg-background-sec/20 text-muted-foreground border-border/20",
            )}
          >
            Znaki: {opisSprawy.length} / 50
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
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onFilesSelected(e.target.files)
                  }
                  e.target.value = ""
                }}
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
                    document.getElementById("file-upload")?.click()
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
                    "font-semibold text-xs text-foreground transition-colors block",
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
                onClick={() => onRemoveFile(index)}
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
  )
}
