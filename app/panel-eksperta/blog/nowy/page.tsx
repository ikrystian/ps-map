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
import { useRouter } from "next/navigation"
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
import { flattenCategoryTree } from "@/lib/blog-category-tree"

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

export default function LawFirmNewBlogPostPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()

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

  const handleSubmit = async (values: PostFormValues) => {
    setLoading(true)
    try {
      const response = await fetch("/api/law-firms/me/blog", {
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
        router.push("/panel-eksperta/blog")
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
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

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
            title="Nowy artykuł"
            subtitle="Utwórz nowy wpis na blogu swojego profilu i dziel się swoją wiedzą."
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
                  <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
                  <CardHeader className="border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
                      Podstawowe informacje
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                      Wprowadź tytuł, wybierz kategorię oraz dodaj główną treść swojego artykułu
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
                              className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Atrakcyjny tytuł przyciągnie czytelników do zapoznania się z wpisem
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
                              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 text-sm">
                                <SelectValue placeholder="Wybierz kategorię" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                              {flattenCategoryTree(categories).map((category) => (
                                <SelectItem key={category.id} value={category.id} className="hover:bg-primary/10 focus:bg-primary/10">
                                  <span style={{ paddingLeft: `${category.depth * 12}px` }}>
                                    {category.depth > 0 && "— "}
                                    {category.nazwa}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm text-zinc-500">
                            Kategoria pomaga uporządkować wpisy i ułatwia ich wyszukiwanie
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
                            <div className="rounded-xl overflow-hidden border border-border/40 bg-zinc-950/40 focus-within:border-primary/60 transition-all [&_.ql-toolbar]:bg-zinc-700 [&_.ql-toolbar]:border-border/20 [&_.ql-container]:border-none [&_.ql-editor]:text-zinc-200 [&_.ql-editor]:min-h-[400px]">
                              <RichTextEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Napisz treść swojego artykułu..."
                                minHeight="400px"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-zinc-500">
                            Wymagane minimum 100 znaków. Użyj edytora do formatowania akapitów i list.
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
                <Button type="submit" disabled={loading} className="h-11 px-6 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl shadow-md border-t border-white/10 group gap-2 transition-all">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? "Zapisywanie..." : form.watch("opublikowany") ? "Opublikuj artykuł" : "Zapisz jako szkic"}
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
                      Wprowadź tagi i metadane, aby ułatwić wyszukiwarkom pozycjonowanie Twojego wpisu
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
                                  className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm"
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
                                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-3.5 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-primary/15"
                                    >
                                      <span>{tag}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentTags = field.value || []
                                          field.onChange(currentTags.filter((_, i) => i !== index))
                                        }}
                                        className="text-primary/70 hover:text-rose-400 transition-colors font-bold text-sm leading-none ml-0.5"
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
                              className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm"
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
                              className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm resize-none"
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
                      Wybierz czy chcesz od razu opublikować wpis czy zapisać go jako wersję roboczą (szkic)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <FormField
                      control={form.control}
                      name="opublikowany"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/20 p-4 bg-zinc-950/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold text-white">Opublikuj od razu</FormLabel>
                            <FormDescription className="text-sm text-zinc-500 max-w-sm">
                              Po zaznaczeniu artykuł natychmiast ukaże się na Twoim profilu publicznym.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary"
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