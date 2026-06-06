"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
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
import { ArrowLeft, Save, Sparkles, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full flex items-center justify-center bg-zinc-950/20 border border-border/30 rounded-xl text-sm text-zinc-500 backdrop-blur-sm animate-pulse">Ładowanie edytora...</div>
  }
)

import { ImageUpload } from "@/components/ui/image-upload"

const postSchema = z.object({
  tytul: z.string().min(1, "Tytuł jest wymagany").max(200, "Tytuł może mieć maksymalnie 200 znaków"),
  tresc: z.string().min(100, "Treść musi mieć minimum 100 znaków"),
  categoryId: z.string().optional(),
  obrazekWyrozniajacy: z.string().optional().or(z.literal("")),
  tagi: z.array(z.string()).optional(),
  metaTitle: z.string().max(70, "Meta tytuł może mieć maksymalnie 70 znaków").optional(),
  metaDescription: z.string().max(160, "Meta opis może mieć maksymalnie 160 znaków").optional(),
  opublikowany: z.boolean(),
})

import type { BlogCategory } from "@/types"

type PostFormValues = z.infer<typeof postSchema>

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

export default function LawFirmEditBlogPostPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      tytul: "",
      tresc: "",
      categoryId: "",
      obrazekWyrozniajacy: "",
      tagi: [],
      metaTitle: "",
      metaDescription: "",
      opublikowany: false,
    },
  })

  useEffect(() => {
    fetchCategories()
    fetchPost()
  }, [postId])

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
      const response = await fetch(`/api/law-firms/me/blog/${postId}`)

      if (response.status === 403) {
        toast.error("Nie masz uprawnień do edycji tego wpisu")
        router.push("/panel-eksperta/blog")
        return
      }

      if (response.ok) {
        const post = await response.json()
        // Parse tagi z JSON string jeśli istnieje
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
        })
      } else {
        throw new Error("Nie znaleziono wpisu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się pobrać wpisu")
      router.push("/panel-eksperta/blog")
    } finally {
      setLoadingPost(false)
    }
  }

  const handleSubmit = async (values: PostFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/law-firms/me/blog/${postId}`, {
        method: "PUT",
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
        toast.success("Artykuł został zaktualizowany")
        router.push("/panel-eksperta/blog")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji wpisu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować artykułu")
    } finally {
      setLoading(false)
    }
  }

  if (loadingPost) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie artykułu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 mb-6 relative z-10"
      >
        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl border border-border/40 hover:bg-muted text-zinc-400 hover:text-white transition-all shrink-0">
          <Link href="/panel-eksperta/blog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Edytuj artykuł"
            subtitle="Zaktualizuj dane wpisu na blogu swojego profilu."
            className="mb-0"
            titleClassName="text-white text-3xl"
          />
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Lewa kolumna: Podstawowe informacje i akcje */}
            <div className="lg:col-span-2 space-y-6">
              {/* Podstawowe informacje */}
              <motion.div variants={itemVariants}>
                <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
                  <BorderBeam lightColor="#0da192" lightWidth={400} duration={8} borderWidth={1} />
                  <CardHeader className="border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#d7b56d] animate-pulse" />
                      Podstawowe informacje
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                      Zmień tytuł, kategorię lub zmodyfikuj treść i grafikę artykułu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="tytul"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Tytuł artykułu *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="np. Jak przygotować się do sprawy rozwodowej?"
                              className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Tytuł powinien być zwięzły i czytelny dla użytkowników
                          </FormDescription>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Kategoria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loadingCategories}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192] focus:bg-background/80 text-zinc-300 text-sm">
                                <SelectValue placeholder="Wybierz kategorię" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="hover:bg-[#0da192]/10 focus:bg-[#0da192]/10">
                                  {category.nazwa}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm text-zinc-500">
                            Kategoria służy do tematycznego grupowania artykułów na blogu
                          </FormDescription>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tresc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Treść artykułu *</FormLabel>
                          <FormControl>
                            <div className="rounded-xl overflow-hidden border border-border/40 bg-zinc-950/40 focus-within:border-[#0da192]/60 transition-all [&_.ql-toolbar]:bg-zinc-700 [&_.ql-toolbar]:border-border/20 [&_.ql-container]:border-none [&_.ql-editor]:text-zinc-200 [&_.ql-editor]:min-h-[400px]">
                              <RichTextEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Napisz treść swojego artykułu..."
                                minHeight="400px"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Minimum 100 znaków. Pamiętaj o czytelnym formatowaniu nagłówkami i listami.
                          </FormDescription>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="obrazekWyrozniajacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="rounded-xl p-1 bg-zinc-950/20 border border-border/30 mt-4">
                              <ImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                label="Obrazek wyróżniający"
                                description="Prześlij grafikę lub podaj bezpośredni link URL. Obrazek posłuży za miniaturę wpisu."
                                confirmDelete={true}
                                confirmDeleteTitle="Usuń obrazek z postu"
                                confirmDeleteDescription="Czy na pewno chcesz usunąć obrazek wyróżniający z tego artykułu?"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Akcje formularza */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2">
                <Button type="submit" disabled={loading} className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 group gap-2 transition-all">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/panel-eksperta/blog")}
                  className="h-11 px-6 border-border/50 hover:bg-muted text-white rounded-xl transition-all"
                >
                  Anuluj
                </Button>
              </motion.div>
            </div>

            {/* Prawa kolumna (Sidebar): SEO i Publikacja */}
            <div className="space-y-6">
              {/* SEO */}
              <motion.div variants={itemVariants}>
                <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
                  <CardHeader className="border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-lg font-playfair text-white">Optymalizacja SEO</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                      Dostosuj tagi i metadane pod wyszukiwarki internetowe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="tagi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Słowa kluczowe (tagi)</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input
                                  id="tag-input"
                                  placeholder="Wpisz słowo kluczowe i zatwierdź Enterem..."
                                  className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm"
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
                                  className="h-11 px-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-border/40 transition-all font-medium text-xs shrink-0"
                                >
                                  Dodaj
                                </Button>
                              </div>
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {field.value.map((tag, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-1.5 bg-[#0da192]/10 border border-[#0da192]/30 text-[#0da192] px-3.5 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-[#0da192]/15"
                                    >
                                      <span>{tag}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentTags = field.value || []
                                          field.onChange(currentTags.filter((_, i) => i !== index))
                                        }}
                                        className="text-[#0da192]/70 hover:text-rose-400 transition-colors font-bold text-sm leading-none ml-0.5"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Naciśnij Enter lub kliknij przycisk &quot;Dodaj&quot;, aby zapisać tag
                          </FormDescription>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Meta tytuł</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tytuł dla wyników wyszukiwania (Google)"
                              className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Jeśli pole pozostanie puste, wyszukiwarka użyje domyślnego tytułu artykułu (maksymalnie 70 znaków)
                          </FormDescription>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-300">Meta opis</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Krótki, chwytliwy opis artykułu, który pojawi się w wynikach wyszukiwania..."
                              className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-background/80 transition-all text-white text-sm resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Krótki fragment podsumowujący artykuł pod linkiem w wynikach wyszukiwania (maksymalnie 160 znaków)
                          </FormDescription>
                          <FormMessage className="text-rose-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Publikacja */}
              <motion.div variants={itemVariants}>
                <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
                  <CardHeader className="border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-lg font-playfair text-white">Status publikacji</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                      Określ status publikacji artykułu na blogu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <FormField
                      control={form.control}
                      name="opublikowany"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/20 p-4 bg-zinc-950/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold text-white">Opublikuj artykuł</FormLabel>
                            <FormDescription className="text-sm text-zinc-500 max-w-sm">
                              Po zaznaczeniu artykuł natychmiast ukaże się na Twoim profilu publicznym.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#0da192]"
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
        </form>
      </Form>
    </div>
  )
}