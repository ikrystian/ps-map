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
import { ArrowLeft, Save, Sparkles, Loader2, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn } from "@/lib/utils"

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
  isSponsored: z.boolean().default(false),
  sponsoredLawFirmId: z.string().optional(),
})

type PostFormValues = z.infer<typeof postFormSchema>

import type { BlogCategory } from "@/types"

const postSchema = postFormSchema.refine((data) => {
  if (data.isSponsored && !data.sponsoredLawFirmId) {
    return false
  }
  return true
}, {
  message: "Musisz wybrać eksperta/eksperta dla wpisu sponsorowanego",
  path: ["sponsoredLawFirmId"],
})

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
}

export function BlogPostForm({ postId }: BlogPostFormProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [lawFirms, setLawFirms] = useState<{ id: string; nazwa: string; nazwaFirmy: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(!!postId)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingLawFirms, setLoadingLawFirms] = useState(false)
  
  // Collapse/Expand state for right column boxes (default to collapsed/false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [sponsoredOpen, setSponsoredOpen] = useState(false)
  
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
      isSponsored: false,
      sponsoredLawFirmId: "",
    },
  })

  useEffect(() => {
    fetchCategories()
    fetchLawFirms()
  }, [])

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
      const response = await fetch(`/api/admin/blog/${postId}`)

      if (response.status === 401 || response.status === 403) {
        toast.error("Nie masz uprawnień do edycji tego wpisu")
        router.push("/admin/blog")
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

        form.reset({
          tytul: post.tytul || "",
          tresc: post.tresc || "",
          categoryId: post.categoryId || "",
          obrazekWyrozniajacy: post.obrazekWyrozniajacy || "",
          tagi: parsedTagi,
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          opublikowany: post.opublikowany || false,
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
      router.push("/admin/blog")
    } finally {
      setLoadingPost(false)
    }
  }

  const handleSubmit = async (values: PostFormValues) => {
    setLoading(true)
    const url = postId ? `/api/admin/blog/${postId}` : "/api/admin/blog"
    const method = postId ? "PATCH" : "POST"

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
          sponsoredLawFirmId: values.isSponsored ? (values.sponsoredLawFirmId || null) : null,
        }),
      })

      if (response.ok) {
        if (postId) {
          toast.success("Artykuł został zaktualizowany")
        } else {
          toast.success(values.opublikowany ? "Artykuł został opublikowany" : "Szkic został zapisany")
        }
        router.push("/admin/blog")
      } else {
        const error = await response.json()
        throw new Error(error.error || (postId ? "Błąd aktualizacji wpisu" : "Błąd tworzenia wpisu"))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (postId ? "Nie udało się zaktualizować artykułu" : "Nie udało się zapisać artykułu"))
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
          <Link href="/admin/blog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {postId ? "Edytuj artykuł (Admin)" : "Nowy artykuł (Admin)"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {postId
              ? "Zaktualizuj szczegóły wpisu blogowego administratora portalu."
              : "Utwórz nowy wpis na blogu przypisany do administratora portalu."}
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loadingCategories}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Wybierz kategorię" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.nazwa}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tresc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Treść artykułu *</FormLabel>
                          <FormControl>
                            <div className="rounded-xl overflow-hidden border bg-background focus-within:border-primary transition-all [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:border-b [&_.ql-container]:border-none [&_.ql-editor]:min-h-[400px]">
                              <RichTextEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Napisz treść artykułu..."
                                minHeight="400px"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="obrazekWyrozniajacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="rounded-xl p-1 bg-muted/10 border mt-4">
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                label="Obrazek wyróżniający"
                                description="Prześlij grafikę lub podaj bezpośredni link URL. Obrazek posłuży za miniaturę wpisu."
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Prawa kolumna (Sidebar): SEO, Wpis Sponsorowany, Publikacja */}
            <div className="space-y-6 lg:sticky lg:top-6">
              {/* SEO */}
              <motion.div variants={itemVariants}>
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader 
                    className="py-5 px-6 border-b cursor-pointer flex flex-row items-center justify-between select-none hover:bg-muted/5 transition-colors"
                    onClick={() => setSeoOpen(!seoOpen)}
                  >
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">Optymalizacja SEO</CardTitle>
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
                                    <FormLabel className="text-xs font-semibold">Wybierz eksperta / eksperta *</FormLabel>
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
                                            {firm.nazwa} {firm.nazwaFirmy && firm.nazwaFirmy !== firm.nazwa ? `(${firm.nazwaFirmy})` : ""}
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
                  <CardContent className="p-6">
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
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
                onClick={() => router.push("/admin/blog")}
                className="h-9"
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
                    {postId
                      ? "Zapisz zmiany"
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
