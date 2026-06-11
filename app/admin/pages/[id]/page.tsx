"use client"

import { PageBuilder } from "@/components/admin/page-builder"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import * as z from "zod"

const pageSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  slug: z.string()
    .min(1, "Slug jest wymagany")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug musi zawierać tylko małe litery, cyfry i myślniki"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  published: z.boolean(),
})

type PageFormValues = z.infer<typeof pageSchema>

interface Module {
  id: string
  name: string
  code: string
  description?: string | null
}

interface PageModule {
  id?: string
  moduleId: string
  module?: Module
  order: number
  data: Record<string, any>
}

interface Page {
  id: string
  title: string
  slug: string
  metaTitle?: string | null
  metaDescription?: string | null
  published: boolean
  publishedAt?: string | null
  modules: Array<{
    id: string
    moduleId: string
    order: number
    data: string | null
    module: Module
  }>
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [pageModules, setPageModules] = useState<PageModule[]>([])
  const [page, setPage] = useState<Page | null>(null)

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      published: false,
    },
  })

  // Fetch page data
  const fetchPage = async () => {
    try {
      setLoading(true)

      // Fetch page
      const pageResponse = await fetch(`/api/admin/pages/${resolvedParams.id}`)
      if (!pageResponse.ok) {
        throw new Error("Failed to fetch page")
      }
      const pageData: Page = await pageResponse.json()
      setPage(pageData)

      // Set form values
      form.reset({
        title: pageData.title,
        slug: pageData.slug,
        metaTitle: pageData.metaTitle || "",
        metaDescription: pageData.metaDescription || "",
        published: pageData.published,
      })

      // Parse and set page modules
      const modules: PageModule[] = pageData.modules
        .sort((a, b) => a.order - b.order)
        .map(pm => ({
          id: pm.id,
          moduleId: pm.moduleId,
          module: pm.module,
          order: pm.order,
          data: pm.data && pm.data.trim() ? JSON.parse(pm.data) : {},
        }))
      setPageModules(modules)

      // Fetch available modules
      const modulesResponse = await fetch('/api/admin/modules?limit=100')
      if (!modulesResponse.ok) {
        throw new Error("Failed to fetch modules")
      }
      const modulesData = await modulesResponse.json()
      setAvailableModules(modulesData.modules)

    } catch (error) {
      console.error("Error fetching page:", error)
      toast.error("Błąd podczas pobierania danych strony")
      router.push("/admin/pages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resolvedParams.id !== "new") {
      fetchPage()
    } else {
      // Fetch modules for new page
      fetch('/api/admin/modules?limit=100')
        .then(res => res.json())
        .then(data => {
          setAvailableModules(data.modules)
          setLoading(false)
        })
        .catch(error => {
          console.error("Error fetching modules:", error)
          toast.error("Błąd podczas pobierania modułów")
          setLoading(false)
        })
    }
  }, [resolvedParams.id])

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź|ż/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Handle title change to auto-generate slug
  const handleTitleChange = (value: string) => {
    form.setValue('title', value)
    if (resolvedParams.id === "new" && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(value))
    }
  }

  // Save page
  const handleSave = async (values: PageFormValues) => {
    try {
      setSaving(true)

      const pageData = {
        ...values,
        modules: pageModules.map(pm => ({
          moduleId: pm.moduleId,
          order: pm.order,
          data: pm.data,
        })),
      }

      const url = resolvedParams.id === "new"
        ? '/api/admin/pages'
        : `/api/admin/pages/${resolvedParams.id}`

      const method = resolvedParams.id === "new" ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save page")
      }

      const savedPage = await response.json()

      toast.success(resolvedParams.id === "new" ? "Strona została utworzona" : "Strona została zaktualizowana")
      if (resolvedParams.id === "new") {
        router.push(`/admin/pages/${savedPage.id}`)
      } else {
        fetchPage()
      }
    } catch (error: any) {
      console.error("Error saving page:", error)
      toast.error(error.message || "Błąd podczas zapisywania strony")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter
        title={resolvedParams.id === "new" ? "Nowa strona" : "Edytuj stronę"}
        subtitle={resolvedParams.id === "new" ? "Utwórz nową stronę z modułów" : `Edytuj stronę: ${page?.title || ""}`}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Button onClick={form.handleSubmit(handleSave)} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Zapisywanie..." : "Zapisz stronę"}
        </Button>
      </div>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia strony</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł strony</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="np. O nas"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="np. o-nas" />
                    </FormControl>
                    <FormDescription>
                      URL strony: /{field.value || "slug"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta tytuł (SEO)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Opcjonalny tytuł dla SEO" />
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
                      <FormLabel>Meta opis (SEO)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Opcjonalny opis dla SEO" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Opublikowana</FormLabel>
                      <FormDescription>
                        Czy strona ma być widoczna publicznie?
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
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Page Builder */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Moduły strony</h2>
        <PageBuilder
          modules={availableModules}
          pageModules={pageModules}
          onChange={setPageModules}
        />
      </div>

      {/* Sticky Actions Bar at the bottom of the page */}
      <div className="sticky bottom-4 left-0 right-0 z-20 bg-background/90 backdrop-blur border border-border p-4 rounded-xl flex justify-between items-center gap-4 shadow-lg">
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
            onClick={() => router.push("/admin/pages")}
            className="h-9"
          >
            Anuluj
          </Button>
          <Button onClick={form.handleSubmit(handleSave)} disabled={saving} className="h-9 font-semibold px-5">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Zapisz stronę
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
