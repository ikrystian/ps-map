"use client"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/format"
import { BLOG_EDIT_HISTORY_LIMIT } from "@/lib/blog-edit-history"
import { editorRoleLabel, editorRoleLabelForAdmin } from "@/lib/roles"
import { History, Loader2, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"

// Panel admina widzi konta edytujących, ekspert — wyłącznie rolę i datę.
export type BlogEditHistoryMode = "admin" | "expert"

interface EditEntry {
  id: string
  createdAt: string
  role: "ADMIN" | "MODERATOR" | "LAW_FIRM"
  name?: string | null
}

const historyUrl = (postId: string, mode: BlogEditHistoryMode) =>
  mode === "admin" ? `/api/admin/blog/${postId}/edits` : `/api/law-firms/me/blog/${postId}/edits`

interface BlogPostEditHistoryListProps {
  postId: string
  mode: BlogEditHistoryMode
  createdAt?: string | Date | null
}

export function BlogPostEditHistoryList({ postId, mode, createdAt }: BlogPostEditHistoryListProps) {
  const [edits, setEdits] = useState<EditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch(historyUrl(postId, mode))
      .then((response) => {
        if (!response.ok) throw new Error("Błąd pobierania historii edycji")
        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        setEdits(data.edits)
        setTotal(data.total)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [postId, mode])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Nie udało się pobrać historii edycji.</p>
  }

  const roleLabel = mode === "admin" ? editorRoleLabelForAdmin : editorRoleLabel

  return (
    <div className="space-y-3">
      {edits.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Ten wpis nie był jeszcze edytowany.</p>
      ) : (
        <ol className="space-y-2">
          {edits.map((edit) => {
            const editedByStaff = edit.role !== "LAW_FIRM"
            return (
              <li
                key={edit.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">
                    {mode === "admin" && edit.name ? `${edit.name} (${roleLabel(edit.role)})` : roleLabel(edit.role)}
                  </span>
                  {mode === "expert" && editedByStaff && (
                    <Badge className="shrink-0 border border-amber-500/30 bg-amber-500/10 text-amber-500">
                      Zespół portalu
                    </Badge>
                  )}
                </div>
                <time dateTime={edit.createdAt} className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(edit.createdAt)}
                </time>
              </li>
            )
          })}
        </ol>
      )}

      {total > edits.length && (
        <p className="text-xs text-muted-foreground">
          Wyświetlono ostatnie {BLOG_EDIT_HISTORY_LIMIT} z {total} edycji.
        </p>
      )}

      {createdAt && (
        <div className="flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <PlusCircle className="h-3.5 w-3.5" />
            Utworzenie wpisu
          </span>
          <time dateTime={new Date(createdAt).toISOString()}>{formatDateTime(createdAt)}</time>
        </div>
      )}
    </div>
  )
}

interface BlogPostEditHistoryDialogProps {
  post: { id: string; tytul: string; createdAt?: string | Date | null } | null
  mode: BlogEditHistoryMode
  onClose: () => void
}

export function BlogPostEditHistoryDialog({ post, mode, onClose }: BlogPostEditHistoryDialogProps) {
  return (
    <Dialog open={post !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {post && (
          <>
            <DialogHeader>
              <DialogTitle>Historia edycji</DialogTitle>
              <DialogDescription className="truncate" title={post.tytul}>
                {post.tytul}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <BlogPostEditHistoryList key={post.id} postId={post.id} mode={mode} createdAt={post.createdAt} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
