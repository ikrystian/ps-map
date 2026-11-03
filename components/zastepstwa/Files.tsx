"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, fileSize } from "@/lib/substitutions/client"
import { MAX_FILE_MB } from "@/lib/substitutions/constants"
import type { FileDTO } from "@/lib/substitutions/types"
import { cn } from "@/lib/utils"
import { FileText, Loader2, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png"

const KIND_LABELS: Record<string, string> = {
  PELNOMOCNICTWO: "pełnomocnictwo",
  RAPORT: "załącznik raportu",
}

/** Lista plików zlecenia z pobieraniem przez autoryzowany endpoint. */
export function OrderFiles({
  orderId,
  files,
  canDelete = false,
  onDeleted,
}: {
  orderId: string
  files: FileDTO[]
  canDelete?: boolean
  onDeleted?: (fileId: string) => void
}) {
  const [busy, setBusy] = useState<string | null>(null)

  const remove = async (file: FileDTO) => {
    setBusy(file.id)
    try {
      await apiFetch(`/api/substitutions/${orderId}/files/${file.id}`, { method: "DELETE" })
      onDeleted?.(file.id)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (files.length === 0) return null
  return (
    <div className="mt-2 space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/30 px-3 py-2 text-[13px]"
        >
          <FileText className="h-4 w-4 flex-none text-muted-foreground" />
          <a
            href={`/api/substitutions/${orderId}/files/${file.id}`}
            className="min-w-0 truncate font-medium text-foreground hover:text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {file.nazwa}
          </a>
          <span className="ml-auto flex-none text-xs text-muted-foreground">
            {KIND_LABELS[file.rodzaj] ? `${KIND_LABELS[file.rodzaj]} · ` : ""}
            {fileSize(file.rozmiar)}
          </span>
          {canDelete && file.mojPlik && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-none text-muted-foreground hover:text-error"
              title="Usuń plik"
              onClick={() => remove(file)}
              disabled={busy === file.id}
            >
              {busy === file.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Pole „przeciągnij pliki albo wybierz z dysku”. `ensureOrderId` pozwala
 * kreatorowi zapisać szkic, zanim trafi do niego pierwszy plik.
 */
export function FileDropzone({
  ensureOrderId,
  rodzaj = "DOKUMENT",
  onUploaded,
  hint = `PDF, DOCX, JPG do ${MAX_FILE_MB} MB.`,
  label,
  compact = false,
  disabled = false,
}: {
  ensureOrderId: () => Promise<string>
  rodzaj?: "DOKUMENT" | "PELNOMOCNICTWO" | "RAPORT"
  onUploaded: (file: FileDTO) => void
  hint?: string
  label?: React.ReactNode
  compact?: boolean
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const upload = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setUploading(true)
    try {
      const orderId = await ensureOrderId()
      for (const file of Array.from(list)) {
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          toast.error(`${file.name}: plik jest większy niż ${MAX_FILE_MB} MB`)
          continue
        }
        const form = new FormData()
        form.append("file", file)
        form.append("rodzaj", rodzaj)
        try {
          onUploaded(await apiFetch<FileDTO>(`/api/substitutions/${orderId}/files`, { method: "POST", body: form }))
        } catch (e) {
          toast.error(`${file.name}: ${errorMessage(e)}`)
        }
      }
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (!disabled) upload(e.dataTransfer.files)
      }}
      className={cn(
        "cursor-pointer rounded-xl border-[1.5px] border-dashed border-border/70 bg-background/30 text-center text-[13px] text-muted-foreground transition-colors",
        compact ? "px-3 py-3" : "px-4 py-4",
        dragging && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      {uploading ? (
        <Loader2 className="mx-auto mb-1.5 h-5 w-5 animate-spin text-primary" />
      ) : (
        <Upload className="mx-auto mb-1.5 h-5 w-5" />
      )}
      {label ?? (
        <>
          Przeciągnij pliki albo <b className="text-primary">wybierz z dysku</b>
        </>
      )}
      {hint && <div className="mt-0.5 text-xs">{hint}</div>}
    </div>
  )
}
