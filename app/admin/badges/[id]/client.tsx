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
import { ChevronLeft, Trash, AlertCircle, CheckCircle2, Loader2, Search, UserPlus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"
import { expertAvatar } from "@/lib/expert-avatar"

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
        "PROFILE_VIEWS",
        "MANUAL"
    ]),
    threshold: z.coerce.number().min(0, "Próg musi być liczbą nieujemną"),
})

type BadgeFormValues = z.infer<typeof badgeSchema>

export function EditBadgeClient({ badge }: { badge: Badge }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Manual Badge Assignment state & functions
    interface LawFirmBadgeAssignment {
        id: string
        lawFirmId: string
        badgeId: string
        awardedAt: string
        lawFirm: {
            id: string
            nazwa: string
            logo: string | null
            user?: {
                email: string
            }
        }
    }

    const [assignments, setAssignments] = useState<LawFirmBadgeAssignment[]>([])
    const [loadingAssignments, setLoadingAssignments] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searchingFirms, setSearchingFirms] = useState(false)
    const [assigningId, setAssigningId] = useState<string | null>(null)
    const [unassigningId, setUnassigningId] = useState<string | null>(null)

    const fetchAssignments = async () => {
        try {
            setLoadingAssignments(true)
            const res = await fetch(`/api/badges/${badge.id}/assign`)
            if (res.ok) {
                const data = await res.json()
                setAssignments(data)
            }
        } catch (error) {
            console.error("Failed to fetch assignments", error)
        } finally {
            setLoadingAssignments(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [badge.id])

    const handleSearchFirms = async (query: string) => {
        setSearchQuery(query)
        if (query.trim().length < 2) {
            setSearchResults([])
            return
        }

        try {
            setSearchingFirms(true)
            const res = await fetch(`/api/admin/law-firms?search=${encodeURIComponent(query)}&limit=10`)
            if (res.ok) {
                const data = await res.json()
                const existingFirmIds = new Set(assignments.map(a => a.lawFirmId))
                const filtered = (data.lawFirms || []).filter((firm: any) => !existingFirmIds.has(firm.id))
                setSearchResults(filtered)
            }
        } catch (err) {
            console.error("Error searching law firms", err)
        } finally {
            setSearchingFirms(false)
        }
    }

    const handleAssign = async (lawFirmId: string) => {
        try {
            setAssigningId(lawFirmId)
            const res = await fetch(`/api/badges/${badge.id}/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lawFirmId }),
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg || "Nie udało się przypisać orderu")
            }

            toast.success("Order został pomyślnie przypisany")
            setSearchQuery("")
            setSearchResults([])
            await fetchAssignments()
        } catch (error: any) {
            toast.error(error.message || "Wystąpił błąd podczas przypisywania orderu")
        } finally {
            setAssigningId(null)
        }
    }

    const handleUnassign = async (lawFirmId: string) => {
        if (!confirm("Czy na pewno chcesz odebrać ten order tej firmie?")) return

        try {
            setUnassigningId(lawFirmId)
            const res = await fetch(`/api/badges/${badge.id}/assign?lawFirmId=${lawFirmId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                throw new Error("Nie udało się odebrać orderu")
            }

            toast.success("Order został odebrany")
            await fetchAssignments()
        } catch (error) {
            toast.error("Wystąpił błąd podczas odbierania orderu")
        } finally {
            setUnassigningId(null)
        }
    }

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 border rounded-lg p-6 bg-card shadow-sm">
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
                                                <SelectItem value="MANUAL">Manualnie przypisywany</SelectItem>
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
                                    onClick={() => router.push("/admin/badges")}
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
                                        "Zapisz zmiany"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>

            <div className="border rounded-lg p-6 bg-card shadow-sm space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Przypisane firmy ({assignments.length})</h3>
                    <p className="text-sm text-muted-foreground">Ręcznie przydziel ten order wybranym kancelariom</p>
                </div>

                {/* Search Section */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Wyszukaj firmę po nazwie..."
                            className="pl-9 pr-8"
                            value={searchQuery}
                            onChange={(e) => handleSearchFirms(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("")
                                    setSearchResults([])
                                }}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {searchingFirms && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-1">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Szukanie...
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="border rounded-md bg-popover max-h-60 overflow-y-auto divide-y shadow-md">
                            {searchResults.map((firm) => (
                                <div key={firm.id} className="flex items-center justify-between p-3 hover:bg-accent transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-8 w-8 rounded-md overflow-hidden border">
                                            <Image
                                                src={expertAvatar(firm.logo)}
                                                alt={firm.nazwa}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium line-clamp-1">{firm.nazwa}</div>
                                            <div className="text-xs text-muted-foreground">{firm.user?.email || firm.nip}</div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        type="button"
                                        onClick={() => handleAssign(firm.id)}
                                        disabled={assigningId !== null}
                                    >
                                        {assigningId === firm.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-4 w-4 text-primary" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchQuery.trim().length >= 2 && !searchingFirms && searchResults.length === 0 && (
                        <div className="text-sm text-muted-foreground py-2 px-1">
                            Brak pasujących, nieprzypisanych firm.
                        </div>
                    )}
                </div>

                <hr />

                {/* Assigned Firms List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lista przypisanych</span>
                        {loadingAssignments && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </div>

                    {loadingAssignments ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Ładowanie...
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-8 border border-dashed rounded-lg text-sm text-muted-foreground">
                            Brak firm z tym orderem.
                        </div>
                    ) : (
                        <div className="divide-y max-h-96 overflow-y-auto pr-1">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-8 w-8 rounded-md overflow-hidden border">
                                            <Image
                                                src={expertAvatar(assignment.lawFirm.logo)}
                                                alt={assignment.lawFirm.nazwa}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium line-clamp-1">{assignment.lawFirm.nazwa}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Dodano: {new Date(assignment.awardedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        type="button"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleUnassign(assignment.lawFirmId)}
                                        disabled={unassigningId !== null}
                                    >
                                        {unassigningId === assignment.lawFirmId ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    )
}
