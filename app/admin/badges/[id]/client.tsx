"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import type { Badge } from "@prisma/client"
import { ChevronLeft, Trash } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { useForm } from "react-hook-form"
import * as z from "zod"

const badgeSchema = z.object({
    name: z.string().min(1, "Nazwa jest wymagana"),
    description: z.string().min(1, "Opis jest wymagany"),
    imageUrl: z.string().min(1, "Obrazek jest wymagany"),
    conditionType: z.enum([
        "YEARS_IN_SERVICE",
        "WON_CASES",
        "REVIEWS_COUNT",
        "BLOG_POSTS_COUNT",
        "OFFERS_SUBMITTED",
        "PROFILE_VIEWS"
    ]),
    threshold: z.coerce.number().min(0, "Próg musi być liczbą nieujemną"),
})

type BadgeFormValues = z.infer<typeof badgeSchema>

export function EditBadgeClient({ badge }: { badge: Badge }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<BadgeFormValues>({
        defaultValues: {
            name: badge.name,
            description: badge.description,
            imageUrl: badge.imageUrl,
            conditionType: badge.conditionType as any,
            threshold: Number(badge.threshold),
        },
    })

    const onSubmit = async (values: BadgeFormValues) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/badges/${badge.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Nie udało się zaktualizować orderu")
            }

            toast.success("Order został zaktualizowany")
            router.push("/admin/badges")
            router.refresh()
        } catch (error) {
            toast.error("Wystąpił błąd podczas aktualizacji orderu")
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        if (!confirm("Czy na pewno chcesz usunąć ten order?")) return

        try {
            setLoading(true)
            const response = await fetch(`/api/badges/${badge.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Nie udało się usunąć orderu")
            }

            toast.success("Order został usunięty")
            router.push("/admin/badges")
            router.refresh()
        } catch (error) {
            toast.error("Wystąpił błąd podczas usuwania orderu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <AdminHeaderSetter title="Edytuj order" subtitle="Zmień szczegóły orderu przyznawanego ekspertom" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/badges">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <Button variant="destructive" size="icon" onClick={onDelete} disabled={loading}>
                    <Trash className="h-4 w-4" />
                </Button>
            </div>

            <div className="max-w-2xl border rounded-lg p-6 bg-card">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nazwa orderu</FormLabel>
                                    <FormControl>
                                        <Input placeholder="np. Weteran" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Opis</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Opis orderu..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Obrazek</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value}
                                            onChange={(url) => field.onChange(url)}
                                            label="Wgraj obrazek orderu"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="conditionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warunek przyznania</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Wybierz warunek" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="YEARS_IN_SERVICE">Lata w serwisie</SelectItem>
                                                <SelectItem value="WON_CASES">Wygrane sprawy</SelectItem>
                                                <SelectItem value="REVIEWS_COUNT">Liczba opinii</SelectItem>
                                                <SelectItem value="BLOG_POSTS_COUNT">Wpisy na blogu</SelectItem>
                                                <SelectItem value="OFFERS_SUBMITTED">Złożone oferty</SelectItem>
                                                <SelectItem value="PROFILE_VIEWS">Wyświetlenia profilu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="threshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Próg (wartość liczbowa)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Wartość, którą trzeba osiągnąć
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Zapisz zmiany" : "Zapisz zmiany"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
