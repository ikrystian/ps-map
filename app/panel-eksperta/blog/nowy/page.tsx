"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full flex items-center justify-center bg-background border border-border rounded-lg text-sm text-muted-foreground">Ładowanie edytora...</div>
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

type PostFormValues = z.infer<typeof postSchema>

interface BlogCategory {
  id: string
  nazwa: string
  slug: string
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/panel-eksperta/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold font-playfair">Nowy artykuł</h1>
            <p className="text-muted-foreground">
              Utwórz nowy wpis na blogu swojego profilu
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>
                Wypełnij podstawowe dane artykułu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tytul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł artykułu *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="np. Jak przygotować się do sprawy rozwodowej?"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Atrakcyjny tytuł zachęci czytelników do przeczytania artykułu
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormDescription>
                      Kategoria pomoże czytelnikom znaleźć Twój artykuł
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tresc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treść artykułu *</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Napisz treść swojego artykułu..."
                        minHeight="400px"
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 100 znaków. Użyj paska narzędzi do formatowania tekstu.
                    </FormDescription>
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
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Obrazek wyróżniający"
                        description="Prześlij obrazek lub podaj URL. Obrazek pojawi się jako miniatura artykułu."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Opcjonalne ustawienia SEO dla lepszej widoczności w wyszukiwarkach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tagi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Słowa kluczowe (tagi)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            id="tag-input"
                            placeholder="Dodaj słowo kluczowe..."
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
                          >
                            Dodaj
                          </Button>
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((tag, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentTags = field.value || []
                                    field.onChange(currentTags.filter((_, i) => i !== index))
                                  }}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Naciśnij Enter lub kliknij "Dodaj" aby dodać słowo kluczowe
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
                    <FormLabel>Meta tytuł</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tytuł dla wyszukiwarek"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jeśli puste, zostanie użyty tytuł artykułu (max 70 znaków)
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
                    <FormLabel>Meta opis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Krótki opis artykułu dla wyszukiwarek"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Zachęcający opis pojawi się w wynikach wyszukiwania (max 160 znaków)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publikacja</CardTitle>
              <CardDescription>
                Zdecyduj czy opublikować artykuł natychmiast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="opublikowany"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Opublikuj artykuł</FormLabel>
                      <FormDescription>
                        Artykuł będzie widoczny publicznie na stronie
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

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Zapisywanie..." : form.watch("opublikowany") ? "Opublikuj" : "Zapisz szkic"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/panel-eksperta/blog")}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
