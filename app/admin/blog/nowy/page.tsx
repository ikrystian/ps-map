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
import { ArrowLeft, Save, Sparkles, Loader2, Building2 } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full flex items-center justify-center bg-muted/20 border border-border/30 rounded-xl text-sm text-muted-foreground animate-pulse">Ładowanie edytora...</div>
  }
)

import { ImageUpload } from "@/components/ui/image-upload"

const postSchema = z.object({
  tytul: z.string().min(1, "Tytuł jest wymagany").max(200, "Tytuł może mieć maksymalnie 200 znaków"),
  tresc: z.string().min(1, "Treść jest wymagana"),
  categoryId: z.string().optional(),
  lawFirmId: z.string().min(1, "Wybór kancelarii jest wymagany"),
  obrazekWyrozniajacy: z.string().optional().or(z.literal("")),
  tagi: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  opublikowany: z.boolean(),
})

type PostFormValues = z.infer<typeof postSchema>

interface BlogCategory {
  id: string
  nazwa: string
  slug: string
}

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
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

export default function AdminNewBlogPostPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingLawFirms, setLoadingLawFirms] = useState(true)
  const router = useRouter()

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      tytul: "",
      tresc: "",
      categoryId: "",
      lawFirmId: "",
      obrazekWyrozniajacy: "",
      tagi: [],
      metaTitle: "",
      metaDescription: "",
      opublikowany: false,
    },
  })

  useEffect(() => {
    fetchCategories()
    fetchLawFirms()
  }, [])

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

  const fetchLawFirms = async () => {
    try {
      const response = await fetch("/api/admin/law-firms?limit=1000")
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

  const handleSubmit = async (values: PostFormValues) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
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
        }),
      })

      if (response.ok) {
        toast.success(values.opublikowany ? "Artykuł został opublikowany" : "Szkic został zapisany")
        router.push("/admin/blog")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd tworzenia wpisu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zapisać artykułu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="h-10 w-10 shrink-0">
          <Link href="/admin/blog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nowy artykuł (Admin)</h1>
          <p className="text-muted-foreground text-sm">
            Utwórz nowy wpis na blogu wybranej kancelarii bez żadnych ograniczeń długości.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Wybór Kancelarii */}
            <motion.div variants={itemVariants}>
              <Card className="border shadow-sm">
                <CardHeader className="py-5 px-6 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Przypisanie do kancelarii *
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Wskaż kancelarię/eksperta, na którego blogu ukaże się ten artykuł.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="lawFirmId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Wybierz kancelarię *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingLawFirms}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Wybierz kancelarię z listy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {lawFirms.map((lf) => (
                              <SelectItem key={lf.id} value={lf.id}>
                                {lf.nazwa} ({lf.nazwaFirmy})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Podstawowe informacje */}
            <motion.div variants={itemVariants}>
              <Card className="border shadow-sm">
                <CardHeader className="py-5 px-6 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Podstawowe informacje
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Wprowadź tytuł, wybierz kategorię oraz dodaj główną treść artykułu.
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

            {/* SEO */}
            <motion.div variants={itemVariants}>
              <Card className="border shadow-sm">
                <CardHeader className="py-5 px-6 border-b">
                  <CardTitle className="text-lg font-semibold">Optymalizacja SEO</CardTitle>
                  <CardDescription className="text-xs">
                    Wprowadź tagi i metadane pod wyszukiwarki internetowe.
                  </CardDescription>
                </CardHeader>
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
              </Card>
            </motion.div>

            {/* Publikacja */}
            <motion.div variants={itemVariants}>
              <Card className="border shadow-sm">
                <CardHeader className="py-5 px-6 border-b">
                  <CardTitle className="text-lg font-semibold">Status publikacji</CardTitle>
                  <CardDescription className="text-xs">
                    Wybierz czy chcesz od razu opublikować wpis czy zapisać go jako wersję roboczą.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <FormField
                    control={form.control}
                    name="opublikowany"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-muted/20">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold">Opublikuj od razu</FormLabel>
                          <FormDescription className="text-xs text-muted-foreground max-w-sm">
                            Po zaznaczeniu artykuł natychmiast ukaże się na profilu publicznym wybranej kancelarii.
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

            {/* Akcje formularza */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2">
              <Button type="submit" disabled={loading} className="h-11 px-6 group gap-2 font-semibold">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Zapisywanie..." : form.watch("opublikowany") ? "Opublikuj artykuł" : "Zapisz jako szkic"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/blog")}
                className="h-11 px-6"
              >
                Anuluj
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </div>
  )
}
