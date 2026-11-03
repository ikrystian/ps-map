"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import { errorMessage, patchJson } from "@/lib/substitutions/client"
import type { ConfidentialDTO, FileDTO } from "@/lib/substitutions/types"
import { Download, Loader2, Lock, Pencil } from "lucide-react"
import { useState } from "react"
import { FileDropzone, OrderFiles } from "./Files"
import { DefinitionList, Panel } from "./ui"

/**
 * Dane poufne zlecenia w szczegółach: sygnatura, strony, instrukcja i pliki.
 * Zlecający może je uzupełniać także po wyborze zastępcy; wybrany zastępca tylko czyta.
 */
export function ConfidentialCard({
  orderId,
  data,
  files,
  editable,
  note,
  onSaved,
  onFilesChange,
  powerOfAttorneyLabel,
}: {
  orderId: string
  data: ConfidentialDTO
  files: FileDTO[]
  editable: boolean
  note: string
  onSaved?: (data: ConfidentialDTO) => void
  onFilesChange?: (files: FileDTO[]) => void
  powerOfAttorneyLabel?: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ConfidentialDTO>(data)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      const result = await patchJson(`/api/substitutions/${orderId}`, { poufne: draft })
      toast.success(result.message)
      onSaved?.(draft)
      setEditing(false)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const empty = <span className="text-muted-foreground">nie podano</span>

  return (
    <Panel className="border-secondary/40">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-secondary">
        <Lock className="h-3.5 w-3.5" />
        Dane poufne
        {editable && !editing && (
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold normal-case tracking-normal text-primary hover:underline"
            onClick={() => {
              setDraft(data)
              setEditing(true)
            }}
          >
            <Pencil className="h-3 w-3" />
            Uzupełnij
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs">Sygnatura akt</Label>
            <Input value={draft.sygnatura} maxLength={100} onChange={(e) => setDraft({ ...draft, sygnatura: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Strony</Label>
            <Input value={draft.strony} maxLength={500} onChange={(e) => setDraft({ ...draft, strony: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Instrukcja dla zastępcy</Label>
            <Textarea rows={4} maxLength={4000} value={draft.instrukcja} onChange={(e) => setDraft({ ...draft, instrukcja: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Anuluj
            </Button>
            <Button size="sm" onClick={save} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Zapisz
            </Button>
          </div>
        </div>
      ) : (
        <>
          <DefinitionList
            labelWidth="90px"
            items={[
              ["Sygnatura", data.sygnatura || empty],
              ["Strony", data.strony || empty],
            ]}
          />
          {data.instrukcja && (
            <div className="mt-3 whitespace-pre-line rounded-lg border-l-[3px] border-secondary bg-background/40 px-3 py-2.5 text-[13.5px] text-foreground/80">
              {data.instrukcja}
            </div>
          )}
        </>
      )}

      <OrderFiles
        orderId={orderId}
        files={files}
        canDelete={editable}
        onDeleted={(id) => onFilesChange?.(files.filter((f) => f.id !== id))}
      />
      {editable && (
        <div className="mt-2.5">
          <FileDropzone
            compact
            ensureOrderId={async () => orderId}
            onUploaded={(file) => onFilesChange?.([...files, file])}
            label={
              <>
                Dodaj dokument albo <b className="text-primary">pełnomocnictwo</b>
              </>
            }
          />
        </div>
      )}

      <p className="mt-2.5 text-xs text-muted-foreground">{note}</p>
      {powerOfAttorneyLabel && (
        <Button asChild variant="ghost" size="sm" className="mt-2 px-2">
          <a href={`/api/substitutions/${orderId}/power-of-attorney`}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {powerOfAttorneyLabel}
          </a>
        </Button>
      )}
    </Panel>
  )
}
