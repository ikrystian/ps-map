"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save, Sparkles, Loader2, ChevronDown, AlertCircle, CalendarClock, CheckCircle2, Code, Eye, Image as ImageIcon } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"
import { flattenCategoryTree } from "@/lib/blog-category-tree"
import { BlogCategoryPicker } from "@/components/admin/blog-category-picker"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full flex items-center justify-center bg-muted/20 border border-border/30 rounded-xl text-sm text-muted-foreground animate-pulse">Ładowanie edytora...</div>
  }
)

const postFormSchema = z.object({
  tytul: z.string().min(1, "Tytuł jest wymagany").max(200, "Tytuł może mieć maksymalnie 200 znaków"),
  tresc: z.string().min(1, "Treść jest wymagana"),
  categoryId: z.string().optional(),
  obrazekWyrozniajacy: z.string().optional().or(z.literal("")),
  tagi: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  opublikowany: z.boolean(),
  zaplanowany: z.boolean().default(false),
  dataPublikacji: z.string().optional(),
  isSponsored: z.boolean().default(false),
  sponsoredLawFirmId: z.string().optional(),
})

type PostFormValues = z.infer<typeof postFormSchema>

import type { BlogCategory } from "@/types"

const postSchema = postFormSchema.refine((data) => {
  if (data.zaplanowany && !data.dataPublikacji) {
    return false
  }
  return true
}, {
  message: "Podaj datę i godzinę publikacji",
  path: ["dataPublikacji"],
})

// Rozbija jednolinijkowy HTML na linie między sąsiadującymi tagami — czytelniejsza edycja kodu.
// Wstawione znaki nowej linii to zwykłe białe znaki, ignorowane przy konwersji do bloków edytora.
const formatHTMLForEditing = (html: string) => html.replace(/></g, ">\n<")

// Formatuje datę do wartości akceptowanej przez input[type=datetime-local] (czas lokalny)
const toDatetimeLocal = (value: string | Date) => {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

interface BlogPostFormProps {
  postId?: string
  mode?: "admin" | "expert"
}

export function BlogPostForm({ postId, mode = "admin" }: BlogPostFormProps) {
  const isExpert = mode === "expert"
  const baseRedirectUrl = isExpert ? "/panel-eksperta/blog" : "/admin/blog"
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [lawFirms, setLawFirms] = useState<{ id: string; nazwa: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(!!postId)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingLawFirms, setLoadingLawFirms] = useState(false)

  // Collapse/Expand state for right column boxes (default to collapsed/false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [sponsoredOpen, setSponsoredOpen] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)

  // Tryb edycji treści: wizualny (Editor.js) lub kod HTML
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual")

  const router = useRouter()

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      tytul: "",
      tresc: "",
      categoryId: "",
      obrazekWyrozniajacy: "",
      tagi: [],
      metaTitle: "",
      metaDescription: "",
      opublikowany: false,
      zaplanowany: false,
      dataPublikacji: "",
      isSponsored: false,
      sponsoredLawFirmId: "",
    },
  })

  useEffect(() => {
    fetchCategories()
    if (!isExpert) {
      fetchLawFirms()
    }
  }, [isExpert])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchLawFirms = async () => {
    setLoadingLawFirms(true)
    try {
      const response = await fetch("/api/admin/law-firms?limit=200&active=true")
      if (response.ok) {
        const data = await response.json()
        setLawFirms(data.lawFirms || [])
      }
    } catch (error) {
      console.error("Error fetching law firms:", error)
    } finally {
      setLoadingLawFirms(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter((cat: BlogCategory & { aktywna: boolean }) => cat.aktywna))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchPost = async () => {
    try {
      const activeId = currentPostId || postId
      const getUrl = isExpert ? `/api/law-firms/me/blog/${activeId}` : `/api/admin/blog/${activeId}`
      const response = await fetch(getUrl)

      if (response.status === 401 || response.status === 403) {
        toast.error("Nie masz uprawnień do edycji tego wpisu")
        router.push(baseRedirectUrl)
        return
      }

      if (response.ok) {
        const post = await response.json()
        let parsedTagi: string[] = []
        if (post.tagi) {
          try {
            parsedTagi = JSON.parse(post.tagi)
          } catch (e) {
            console.error("Error parsing tags:", e)
          }
        }

        // Wpis z przyszłą datą publikacji traktujemy jako zaplanowany
        const isScheduled = Boolean(
          post.opublikowany &&
          post.dataPublikacji &&
          new Date(post.dataPublikacji) > new Date()
        )

        form.reset({
          tytul: post.tytul || "",
          tresc: post.tresc || "",
          categoryId: post.categoryId || "",
          obrazekWyrozniajacy: post.obrazekWyrozniajacy || "",
          tagi: parsedTagi,
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          opublikowany: isScheduled ? false : (post.opublikowany || false),
          zaplanowany: isScheduled,
          dataPublikacji: isScheduled ? toDatetimeLocal(post.dataPublikacji) : "",
          isSponsored: post.isSponsored || false,
          sponsoredLawFirmId: post.sponsoredLawFirmId || "",
        })

        // If the loaded post is sponsored, open the sponsored section automatically for convenience
        if (post.isSponsored) {
          setSponsoredOpen(true)
        }
      } else {
        throw new Error("Nie znaleziono wpisu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się pobrać wpisu")
      router.push(baseRedirectUrl)
    } finally {
      setLoadingPost(false)
    }
  }

  const handleGenerateSeo = async () => {
    const tresc = form.getValues("tresc")
    if (!tresc || !tresc.trim()) {
      toast.error("Uzupełnij treść artykułu, aby wygenerować metadane SEO")
      return
    }

    setGeneratingSeo(true)
    try {
      const response = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tytul: form.getValues("tytul"),
          tresc,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Błąd generowania metadanych SEO")
      }

      form.setValue("tagi", data.tagi || [], { shouldDirty: true })
      form.setValue("metaTitle", data.metaTitle || "", { shouldDirty: true })
      form.setValue("metaDescription", data.metaDescription || "", { shouldDirty: true })
      setSeoOpen(true)
      toast.success("Metadane SEO zostały wygenerowane")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wygenerować metadanych SEO")
    } finally {
      setGeneratingSeo(false)
    }
  }

  const handlePreview = async () => {
    const isValid = await form.trigger(["tytul", "tresc"])
    if (!isValid) {
      toast.error("Wypełnij tytuł i treść artykułu, aby otworzyć podgląd")
      return
    }

    setPreviewLoading(true)
    const previewWindow = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null

    try {
      const values = form.getValues()
      const activeId = currentPostId || postId
      const url = isExpert
        ? (activeId ? `/api/law-firms/me/blog/${activeId}` : "/api/law-firms/me/blog")
        : (activeId ? `/api/admin/blog/${activeId}` : "/api/admin/blog")
      const method = isExpert
        ? (activeId ? "PUT" : "POST")
        : (activeId ? "PATCH" : "POST")

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          categoryId: values.categoryId || null,
          obrazekWyrozniajacy: values.obrazekWyrozniajacy || null,
          tagi: values.tagi,
          metaTitle: values.metaTitle || null,
          metaDescription: values.metaDescription || null,
          opublikowany: values.opublikowany || values.zaplanowany,
          dataPublikacji: values.zaplanowany && values.dataPublikacji
            ? new Date(values.dataPublikacji).toISOString()
            : null,
          sponsoredLawFirmId: values.isSponsored ? (values.sponsoredLawFirmId || null) : null,
        }),
      })

      if (response.ok) {
        const savedPost = await response.json()

        if (!activeId && savedPost.id) {
          setCurrentPostId(savedPost.id)
          const newEditUrl = isExpert ? `/panel-eksperta/blog/${savedPost.id}` : `/admin/blog/${savedPost.id}`
          window.history.replaceState(null, "", newEditUrl)
        }

        const previewUrl = `/blog/${savedPost.slug}?preview=true`
        if (previewWindow) {
          previewWindow.location.href = previewUrl
        } else {
          window.open(previewUrl, "_blank")
        }

        toast.success("Zapisano wersję roboczą i otwarto podgląd w nowej karcie")
      } else {
        const error = await response.json()
        if (previewWindow) previewWindow.close()
        throw new Error(error.error || "Nie udało się zapisać wpisu do podglądu")
      }
    } catch (error) {
      if (previewWindow) previewWindow.close()
      toast.error(error instanceof Error ? error.message : "Nie udało się otworzyć podglądu")
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSubmit = async (values: PostFormValues) => {
    setLoading(true)
    const activeId = currentPostId || postId
    const url = isExpert
      ? (activeId ? `/api/law-firms/me/blog/${activeId}` : "/api/law-firms/me/blog")
      : (activeId ? `/api/admin/blog/${activeId}` : "/api/admin/blog")
    const method = isExpert
      ? (activeId ? "PUT" : "POST")
      : (activeId ? "PATCH" : "POST")

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          categoryId: values.categoryId || null,
          obrazekWyrozniajacy: values.obrazekWyrozniajacy || null,
          tagi: values.tagi,
          metaTitle: values.metaTitle || null,
          metaDescription: values.metaDescription || null,
          opublikowany: values.opublikowany || values.zaplanowany,
          dataPublikacji: values.zaplanowany && values.dataPublikacji
            ? new Date(values.dataPublikacji).toISOString()
            : null,
          sponsoredLawFirmId: values.isSponsored ? (values.sponsoredLawFirmId || null) : null,
        }),
      })

      if (response.ok) {
        if (activeId) {
          toast.success("Artykuł został zaktualizowany")
        } else if (values.zaplanowany) {
          toast.success("Publikacja artykułu została zaplanowana")
        } else {
          toast.success(values.opublikowany ? "Artykuł został opublikowany" : "Szkic został zapisany")
        }
        router.push(baseRedirectUrl)
      } else {
        const error = await response.json()
        throw new Error(error.error || (activeId ? "Błąd aktualizacji wpisu" : "Błąd tworzenia wpisu"))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (activeId ? "Nie udało się zaktualizować artykułu" : "Nie udało się zapisać artykułu"))
    } finally {
      setLoading(false)
    }
  }

  if (postId && loadingPost) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie artykułu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="h-10 w-10 shrink-0">
          <Link href={baseRedirectUrl}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {postId
              ? (isExpert ? "Edytuj artykuł" : "Edytuj artykuł (Admin)")
              : (isExpert ? "Nowy artykuł" : "Nowy artykuł (Admin)")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {postId
              ? "Zaktualizuj szczegóły wpisu blogowego."
              : (isExpert ? "Utwórz nowy wpis na blogu swojego profilu i dziel się swoją wiedzą." : "Utwórz nowy wpis na blogu przypisany do administratora portalu.")}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Lewa kolumna: Podstawowe informacje */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="border shadow-sm">
                  <CardHeader className="py-5 px-6 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Podstawowe informacje
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {postId
                        ? "Modyfikuj tytuł, kategorię lub zmień treść artykułu."
                        : "Wprowadź tytuł, wybierz kategorię oraz dodaj główną treść artykułu."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="tytul"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Tytuł artykułu *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="np. Jak przygotować się do sprawy rozwodowej?"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Kategoria</FormLabel>
                          <BlogCategoryPicker
                            categories={categories}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={loadingCategories}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tresc"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-semibold">Treść artykułu *</FormLabel>
                            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
                              <Button
                                type="button"
                                size="sm"
                                variant={editorMode === "visual" ? "secondary" : "ghost"}
                                className="h-7 px-2.5 text-xs"
                                onClick={() => setEditorMode("visual")}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                Wizualny
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={editorMode === "html" ? "secondary" : "ghost"}
                                className="h-7 px-2.5 text-xs"
                                onClick={() => {
                                  field.onChange(formatHTMLForEditing(field.value))
                                  setEditorMode("html")
                                }}
                              >
                                <Code className="h-3.5 w-3.5 mr-1.5" />
                                HTML
                              </Button>
                            </div>
                          </div>
                          <FormControl>
                            {editorMode === "visual" ? (
                              <div className="rounded-xl overflow-hidden border bg-background focus-within:border-primary transition-all [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:border-b [&_.ql-container]:border-none [&_.ql-editor]:min-h-[400px]">
                                <RichTextEditor
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Napisz treść artykułu..."
                                  minHeight="400px"
                                />
                              </div>
                            ) : (
                              <Textarea
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="<p>Treść artykułu w HTML...</p>"
                                className="min-h-[400px] font-mono text-xs leading-relaxed"
                                spellCheck={false}
                              />
                            )}
                          </FormControl>
                          {editorMode === "html" && (
                            <FormDescription className="text-xs text-muted-foreground">
                              Po powrocie do trybu wizualnego niestandardowe znaczniki HTML mogą zostać uproszczone do bloków obsługiwanych przez edytor.
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Prawa kolumna (Sidebar): Obrazek wyróżniający, SEO, Wpis Sponsorowany, Publikacja */}
            <div className="space-y-6 lg:sticky lg:top-6">
              {/* Obrazek wyróżniający */}
              <motion.div variants={itemVariants}>
                <Card className="border shadow-sm">
                  <CardHeader className="py-5 px-6 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Obrazek wyróżniający
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Prześlij grafikę lub podaj bezpośredni link URL. Obrazek posłuży za miniaturę wpisu.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <FormField
                      control={form.control}
                      name="obrazekWyrozniajacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* SEO */}
              <motion.div variants={itemVariants}>
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader
                    className="py-5 px-6 border-b cursor-pointer flex flex-row items-center justify-between select-none hover:bg-muted/5 transition-colors"
                    onClick={() => setSeoOpen(!seoOpen)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold">Optymalizacja SEO</CardTitle>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={generatingSeo}
                          className="h-7 px-2.5 text-xs shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateSeo()
                          }}
                        >
                          {generatingSeo ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Generowanie...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                              Generuj
                            </>
                          )}
                        </Button>
                      </div>
                      <CardDescription className="text-xs">
                        Wprowadź tagi i metadane pod wyszukiwarki internetowe.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSeoOpen(!seoOpen)
                      }}
                    >
                      <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", seoOpen && "rotate-180")} />
                    </Button>
                  </CardHeader>
                  <AnimatePresence initial={false}>
                    {seoOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <CardContent className="p-6 space-y-4">
                          <FormField
                            control={form.control}
                            name="tagi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold">Słowa kluczowe (tagi)</FormLabel>
                                <FormControl>
                                  <div className="space-y-3">
                                    <div className="flex gap-2">
                                      <Input
                                        id="tag-input"
                                        placeholder="Wpisz słowo kluczowe i zatwierdź Enterem..."
                                        className="h-11"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault()
                                            const value = e.currentTarget.value.trim()
                                            const currentTags = field.value || []
                                            if (value && !currentTags.includes(value)) {
                                              field.onChange([...currentTags, value])
                                              e.currentTarget.value = ""
                                            }
                                          }
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById("tag-input") as HTMLInputElement
                                          const value = input.value.trim()
                                          const currentTags = field.value || []
                                          if (value && !currentTags.includes(value)) {
                                            field.onChange([...currentTags, value])
                                            input.value = ""
                                          }
                                        }}
                                        className="h-11 px-5"
                                      >
                                        Dodaj
                                      </Button>
                                    </div>
                                    {field.value && field.value.length > 0 && (
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {field.value.map((tag, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium"
                                          >
                                            <span>{tag}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const currentTags = field.value || []
                                                field.onChange(currentTags.filter((_, i) => i !== index))
                                              }}
                                              className="text-primary/70 hover:text-destructive transition-colors ml-1 font-bold"
                                            >
                                              &times;
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                  Naciśnij Enter lub kliknij przycisk "Dodaj", aby zapisać tag.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="metaTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold">Meta tytuł</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Tytuł dla wyników wyszukiwania (Google)"
                                    className="h-11"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                  Jeśli pole pozostanie puste, wyszukiwarka użyje domyślnego tytułu artykułu.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold">Meta opis</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Krótki, chwytliwy opis artykułu, który pojawi się w wynikach wyszukiwania..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                  Krótki fragment podsumowujący artykuł pod linkiem w wynikach wyszukiwania.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>

              {/* Wpis Sponsorowany */}
              <motion.div variants={itemVariants}>
                <Card className="border shadow-sm overflow-hidden relative">
                  {form.watch("isSponsored") && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
                  )}
                  <CardHeader
                    className="py-5 px-6 border-b cursor-pointer flex flex-row items-center justify-between select-none hover:bg-muted/5 transition-colors"
                    onClick={() => setSponsoredOpen(!sponsoredOpen)}
                  >
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        Wpis sponsorowany
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Oznacz ten wpis jako sponsorowany i przypisz do niego eksperta lub eksperta.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSponsoredOpen(!sponsoredOpen)
                      }}
                    >
                      <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", sponsoredOpen && "rotate-180")} />
                    </Button>
                  </CardHeader>
                  <AnimatePresence initial={false}>
                    {sponsoredOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <CardContent className="p-6 space-y-4">
                          <FormField
                            control={form.control}
                            name="isSponsored"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/20">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm font-semibold">Oznacz jako wpis sponsorowany</FormLabel>
                                  <FormDescription className="text-xs text-muted-foreground max-w-sm">
                                    Na blogu pojawi się specjalna sekcja reklamowa z linkiem do profilu wybranego eksperta.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked)
                                      if (!checked) {
                                        form.setValue("sponsoredLawFirmId", "")
                                      }
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {form.watch("isSponsored") && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="pt-2 space-y-2 overflow-hidden"
                            >
                              <FormField
                                control={form.control}
                                name="sponsoredLawFirmId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-semibold">Wybierz eksperta / eksperta (opcjonalnie)</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                      disabled={loadingLawFirms}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-11">
                                          <SelectValue placeholder="Wybierz eksperta lub eksperta" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {lawFirms.map((firm) => (
                                          <SelectItem key={firm.id} value={firm.id}>
                                            {firm.nazwa} {firm.nazwa && firm.nazwa !== firm.nazwa ? `(${firm.nazwa})` : ""}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>

              {/* Publikacja */}
              <motion.div variants={itemVariants}>
                <Card className="border shadow-sm">
                  <CardHeader className="py-5 px-6 border-b">
                    <CardTitle className="text-lg font-semibold">Status publikacji</CardTitle>
                    <CardDescription className="text-xs">
                      {postId
                        ? "Wybierz status publikacji artykułu."
                        : "Wybierz czy chcesz od razu opublikować wpis czy zapisać go jako wersję roboczą."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="opublikowany"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold">
                              {postId ? "Opublikuj artykuł" : "Opublikuj od razu"}
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground max-w-sm">
                              Po zaznaczeniu artykuł natychmiast ukaże się na blogu portalu.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (checked) {
                                  form.setValue("zaplanowany", false)
                                  form.setValue("dataPublikacji", "")
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zaplanowany"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-primary" />
                              Zaplanuj publikację
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground max-w-sm">
                              Artykuł zostanie automatycznie opublikowany w wybranym terminie.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (checked) {
                                  form.setValue("opublikowany", false)
                                } else {
                                  form.setValue("dataPublikacji", "")
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("zaplanowany") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="overflow-hidden"
                      >
                        <FormField
                          control={form.control}
                          name="dataPublikacji"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Data i godzina publikacji *</FormLabel>
                              <FormControl>
                                <DateTimePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  minDate={new Date()}
                                  timeLabel="Godzina publikacji:"
                                  placeholder="Wybierz datę i godzinę publikacji"
                                  className="[&_button]:h-11"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-muted-foreground">
                                Do tego czasu wpis pozostanie ukryty na blogu portalu.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

            </div>
          </motion.div>

          {/* Sticky Actions Bar at the bottom of the page */}
          <div className="sticky bottom-4 left-0 right-0 z-20 bg-background/90 backdrop-blur border border-border p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg mt-6">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Status walidacji:</span>
              {Object.keys(form.formState.errors).length > 0 ? (
                <span className="text-destructive flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="h-4 w-4 animate-bounce" />
                  Wykryto błędy w formularzu
                </span>
              ) : (
                <span className="text-green-500 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Wszystkie pola poprawne
                </span>
              )}
            </div>

            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                disabled={previewLoading}
                onClick={handlePreview}
                className="h-9 gap-1.5"
              >
                {previewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Podgląd
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(baseRedirectUrl)}
                className="h-9 px-4 font-medium text-xs"
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={loading} className="h-9 font-semibold px-5">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {currentPostId || postId
                      ? "Zapisz zmiany"
                      : form.watch("zaplanowany")
                        ? "Zaplanuj publikację"
                        : form.watch("opublikowany")
                          ? "Opublikuj artykuł"
                          : "Zapisz jako szkic"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
