"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Image as ImageIcon, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import * as z from "zod"

// Validation schema for user form
const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CLIENT", "LAW_FIRM", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]),
  image: z.string().optional(),
  // Client fields
  client: z.object({
    imie: z.string().min(1, "First name is required"),
    nazwisko: z.string().min(1, "Last name is required"),
    telefon: z.string().optional(),
    adres: z.string().optional(),
    kodPocztowy: z.string().optional(),
    miasto: z.string().optional(),
    voivodeshipId: z.string().optional(),
    zgodaRegulamin: z.boolean(),
    zgodaNewsletter: z.boolean(),
    zgodaMarketing: z.boolean(),
  }).optional(),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

import type { Voivodeship } from "@/types"

export default function NewUserPage() {
  const router = useRouter()
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CLIENT",
      status: "ACTIVE",
      image: "",
      client: {
        imie: "",
        nazwisko: "",
        telefon: "",
        adres: "",
        kodPocztowy: "",
        miasto: "",
        voivodeshipId: "",
        zgodaRegulamin: false,
        zgodaNewsletter: false,
        zgodaMarketing: false,
      },
    },
  })

  // Fetch voivodeships
  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const response = await fetch("/api/voivodeships")
        if (response.ok) {
          const data = await response.json()
          setVoivodeships(data)
        }
      } catch (error) {
        console.error("Error fetching voivodeships:", error)
      }
    }
    fetchVoivodeships()
  }, [])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()
      form.setValue("image", data.url)
      toast.success("Zdjęcie zostało przesłane")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się przesłać zdjęcia")
    } finally {
      setIsUploadingImage(false)
      e.target.value = ""
    }
  }

  // Handle image removal
  const handleRemoveImage = () => {
    form.setValue("image", "")
    toast.success("Zdjęcie zostało usunięte")
  }

  // Create user
  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("Użytkownik został utworzony pomyślnie")
        router.push("/admin/users")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd podczas tworzenia użytkownika")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się utworzyć użytkownika")
    } finally {
      setIsSubmitting(false)
    }
  }

  const imageValue = form.watch("image")

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Dodaj Nowego Użytkownika" subtitle="Wprowadź dane nowego użytkownika" />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Zdjęcie profilowe</CardTitle>
              <CardDescription>Avatar użytkownika (opcjonalnie)</CardDescription>
            </CardHeader>
            <CardContent>
              {imageValue ? (
                <div className="flex items-start gap-4">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-card">
                    <Image
                      src={imageValue}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="image-upload"
                      className={cn(
                        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background h-10 px-4 py-2",
                        isUploadingImage
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      )}
                      onClick={(e) => {
                        if (isUploadingImage) {
                          e.preventDefault()
                        }
                      }}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Przesyłanie...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Zmień zdjęcie
                        </>
                      )}
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveImage}
                      disabled={isUploadingImage}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Usuń zdjęcie
                    </Button>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="h-10 w-10 mb-3 text-muted-foreground animate-spin" />
                          <p className="text-sm text-muted-foreground">Przesyłanie...</p>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Kliknij aby przesłać</span> zdjęcie profilowe
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP (max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dane konta</CardTitle>
              <CardDescription>Email, hasło i podstawowe informacje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum 8 znaków
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rola</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz rolę" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CLIENT">Klient</SelectItem>
                          <SelectItem value="LAW_FIRM">Ekspert</SelectItem>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Aktywny</SelectItem>
                          <SelectItem value="INACTIVE">Nieaktywny</SelectItem>
                          <SelectItem value="SUSPENDED">Zawieszony</SelectItem>
                          <SelectItem value="BLOCKED">Zablokowany</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
              <CardDescription>Podstawowe informacje o użytkowniku</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client.imie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imię</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client.nazwisko"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwisko</FormLabel>
                      <FormControl>
                        <Input placeholder="Kowalski" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("role") === "CLIENT" && (
                <>
                  <FormField
                    control={form.control}
                    name="client.telefon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="+48 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client.adres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adres (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="ul. Przykładowa 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="client.kodPocztowy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kod pocztowy (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="00-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="client.miasto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miasto (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="Warszawa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="client.voivodeshipId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Województwo (opcjonalnie)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz województwo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {voivodeships.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.nazwa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="client.zgodaRegulamin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Zgoda na regulamin</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="client.zgodaNewsletter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Zgoda na newsletter</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="client.zgodaMarketing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Zgoda na marketing</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Tworzenie..." : "Dodaj Użytkownika"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
