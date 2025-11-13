"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Bold, Italic, List, Link2, Heading1, Heading2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
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

const postSchema = z.object({
  tytul: z.string().min(1, "Tytuł jest wymagany").max(200, "Tytuł może mieć maksymalnie 200 znaków"),
  tresc: z.string().min(100, "Treść musi mieć minimum 100 znaków"),
  categoryId: z.string().optional(),
  obrazekWyrozniajacy: z.string().url("Podaj poprawny URL obrazka").optional().or(z.literal("")),
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

export default function LawFirmEditBlogPostPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
        router.push("/panel-kancelarii/blog")
        return
      }

      if (response.ok) {
        const post = await response.json()
        form.reset({
          tytul: post.tytul || "",
          tresc: post.tresc || "",
          categoryId: post.categoryId || "",
          obrazekWyrozniajacy: post.obrazekWyrozniajacy || "",
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          opublikowany: post.opublikowany || false,
        })
        if (post.obrazekWyrozniajacy) {
          setImagePreview(post.obrazekWyrozniajacy)
        }
      } else {
        throw new Error("Nie znaleziono wpisu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się pobrać wpisu")
      router.push("/panel-kancelarii/blog")
    } finally {
      setLoadingPost(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Proszę wybrać plik obrazu")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rozmiar pliku nie może przekraczać 5MB")
      return
    }

    setUploadingImage(true)

    try {
      // For now, we'll use a data URL for preview
      // In production, you would upload to a storage service
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        form.setValue("obrazekWyrozniajacy", dataUrl)
        toast.success("Obrazek został dodany")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Nie udało się wgrać obrazka")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    form.setValue("obrazekWyrozniajacy", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.success("Obrazek został usunięty")
  }

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)

    const newText = beforeText + before + selectedText + after + afterText
    form.setValue("tresc", newText)

    // Set cursor position
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
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
          metaTitle: values.metaTitle || null,
          metaDescription: values.metaDescription || null,
        }),
      })

      if (response.ok) {
        toast.success("Artykuł został zaktualizowany")
        router.push("/panel-kancelarii/blog")
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/panel-kancelarii/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edytuj artykuł</h1>
            <p className="text-muted-foreground">
              Zaktualizuj wpis na blogu swojej kancelarii
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tytul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł artykułu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tytuł artykułu" {...field} />
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
                    <div className="space-y-2">
                      {/* WYSIWYG Toolbar */}
                      <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertFormatting("# ", "")}
                          title="Nagłówek 1"
                        >
                          <Heading1 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertFormatting("## ", "")}
                          title="Nagłówek 2"
                        >
                          <Heading2 className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertFormatting("**", "**")}
                          title="Pogrubienie"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertFormatting("_", "_")}
                          title="Kursywa"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertFormatting("- ", "")}
                          title="Lista"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => insertFormatting("[", "](url)")}
                          title="Link"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormControl>
                        <Textarea
                          placeholder="Treść artykułu w formacie Markdown...&#10;&#10;Przykłady:&#10;# Nagłówek 1&#10;## Nagłóbek 2&#10;**Pogrubienie**&#10;_Kursywa_&#10;- Element listy&#10;[Tekst linku](https://example.com)"
                          className="min-h-[400px] resize-y font-mono"
                          {...field}
                          ref={(e) => {
                            field.ref(e);
                            textareaRef.current = e;
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Używaj Markdown do formatowania tekstu. Skróty: Ctrl+B (pogrubienie), Ctrl+I (kursywa)
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="obrazekWyrozniajacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obrazek wyróżniający</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {imagePreview ? (
                          <div className="space-y-3">
                            <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden border">
                              <Image
                                src={imagePreview}
                                alt="Podgląd obrazka"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Zmień obrazek
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveImage}
                                disabled={uploadingImage}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Usuń obrazek
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div
                              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-sm font-medium mb-2">
                                Kliknij aby dodać obrazek wyróżniający
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF do 5MB
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Lub wklej URL obrazka:
                            </div>
                            <Input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e)
                                if (e.target.value) {
                                  setImagePreview(e.target.value)
                                }
                              }}
                            />
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta tytuł</FormLabel>
                    <FormControl>
                      <Input placeholder="Tytuł dla wyszukiwarek" {...field} />
                    </FormControl>
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
                      <Textarea placeholder="Opis dla wyszukiwarek" className="resize-none" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publikacja</CardTitle>
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/panel-kancelarii/blog")}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
