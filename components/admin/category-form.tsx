"use client"

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
import { IconPicker } from "@/components/admin/icon-picker"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Schema walidacji formularza
const categorySchema = z.object({
  nazwa: z.string().min(1, "Nazwa jest wymagana"),
  slug: z.string().min(1, "Slug jest wymagany").regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  opis: z.string().optional().nullable(),
  opisDodatkowy: z.string().optional().nullable(),
  ikona: z.string().optional().nullable(),
  ikonaUrl: z.string().optional().nullable(),
  backgroundImageUrl: z.string().optional().nullable(),
  typ: z.enum(["SPRAWY_FIRMOWE", "SPRAWY_PRYWATNE"]),
  parentId: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  aktywna: z.boolean(),
  kolejnosc: z.number(),
  wyswietlajNaGlownejPrywatne: z.boolean(),
  wyswietlajNaGlownejFirmowe: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
import { Category } from "@/types/categories"

interface CategoryFormProps {
  initialData?: Category | null
  categories: Category[]
  onSubmit: (values: CategoryFormValues) => void
  isLoading?: boolean
  title: string
}

export function CategoryForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
  title
}: CategoryFormProps) {
  const router = useRouter()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
      nazwa: initialData.nazwa,
      slug: initialData.slug,
      opis: initialData.opis || "",
      opisDodatkowy: initialData.opisDodatkowy || "",
      ikona: initialData.ikona || "",
      ikonaUrl: initialData.ikonaUrl || "",
      backgroundImageUrl: initialData.backgroundImageUrl || "",
      typ: initialData.typ,
      parentId: initialData.parentId || "none",
      metaTitle: initialData.metaTitle || "",
      metaDescription: initialData.metaDescription || "",
      aktywna: initialData.aktywna,
      kolejnosc: initialData.kolejnosc,
      wyswietlajNaGlownejPrywatne: !!initialData.wyswietlajNaGlownejPrywatne,
      wyswietlajNaGlownejFirmowe: !!initialData.wyswietlajNaGlownejFirmowe,
    } : {
      nazwa: "",
      slug: "",
      opis: "",
      opisDodatkowy: "",
      ikona: "",
      ikonaUrl: "",
      backgroundImageUrl: "",
      typ: "SPRAWY_PRYWATNE",
      parentId: "none",
      metaTitle: null,
      metaDescription: null,
      aktywna: true,
      kolejnosc: 0,
      wyswietlajNaGlownejPrywatne: false,
      wyswietlajNaGlownejFirmowe: false,
    },
  })

  // Generowanie sluga z nazwy
  const generateSlug = (nazwa: string) => {
    return nazwa
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż]/g, "-")
      .replace(/[ąćęłńóśźż]/g, (match) => {
        const polishToEnglish: { [key: string]: string } = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
          'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
        }
        return polishToEnglish[match] || match
      })
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  // Obsługa zmiany nazwy - automatyczne generowanie sluga
  const handleNameChange = (value: string) => {
    form.setValue("nazwa", value)
    if (!form.getValues("slug") || form.getValues("slug") === generateSlug(form.getValues("nazwa"))) {
      form.setValue("slug", generateSlug(value))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/categories")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Podstawowe informacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nazwa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="np. Prawo cywilne"
                              {...field}
                              onChange={(e) => handleNameChange(e.target.value)}
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
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="prawo-cywilne" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unikalny identyfikator URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="opis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Krótki opis kategorii..."
                            className="min-h-[100px] resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="opisDodatkowy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis dodatkowy</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dodatkowy opis kategorii..."
                            className="min-h-[150px] resize-none"
                            {...field}
                            value={field.value || ""}
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tytuł SEO"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
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
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Opis SEO..."
                            className="resize-none"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ustawienia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="typ"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ kategorii</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz typ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SPRAWY_FIRMOWE">Sprawy firmowe</SelectItem>
                            <SelectItem value="SPRAWY_PRYWATNE">Sprawy prywatne</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoria nadrzędna</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz kategorię nadrzędną" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Brak kategorii nadrzędnej</SelectItem>
                            {categories
                              .filter(cat => !initialData || cat.id !== initialData.id)
                              .map((category) => (
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
                    name="kolejnosc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kolejność</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Niższa liczba = wyższa pozycja
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aktywna"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Aktywna</FormLabel>
                          <FormDescription>
                            Widoczność na stronie
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
                  {form.watch("typ") === "SPRAWY_PRYWATNE" ? (
                    <FormField
                      control={form.control}
                      name="wyswietlajNaGlownejPrywatne"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Na głównej (prywatne)</FormLabel>
                            <FormDescription>
                              Wyświetlaj w sekcji spraw prywatnych na stronie głównej
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
                  ) : (
                    <FormField
                      control={form.control}
                      name="wyswietlajNaGlownejFirmowe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Na głównej (firmowe)</FormLabel>
                            <FormDescription>
                              Wyświetlaj w sekcji spraw firmowych na stronie głównej
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
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wygląd</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ikona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ikona (Lucide)</FormLabel>
                        <FormControl>
                          <IconPicker
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Wybierz ikonę z biblioteki Lucide React
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ikonaUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ikona niestandardowa</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            onChange={field.onChange}
                            label=""
                            description="Prześlij niestandardową ikonę"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="backgroundImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zdjęcie w tle</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            onChange={field.onChange}
                            label=""
                            description="Prześlij zdjęcie, które będzie wyświetlane w tle kategorii na stronie głównej"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Zapisywanie..." : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Zapisz kategorię
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/admin/categories")}
                  disabled={isLoading}
                >
                  Anuluj
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
