"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Building2, RefreshCw, Eye, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Enums from Prisma
type LawFirmType = "OSOBA_FIZYCZNA" | "SPOLKA_CYWILNA" | "SPOLKA_PARTNERSKA" | "SPOLKA_KOMANDYTOWA" | "SPOLKA_JAWNA" | "SPOLKA_ZOO" | "INNY"
type OfferType = "STALA_WSPOLPRACA" | "JEDNORAZOWA_USLUGA" | "KONSULTACJA" | "WSZYSTKIE"
type SubscriptionPackage = "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES"

// Validation schema for law firm form
const lawFirmSchema = z.object({
  // User credentials
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),

  // Basic info
  typ: z.enum(["OSOBA_FIZYCZNA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_KOMANDYTOWA", "SPOLKA_JAWNA", "SPOLKA_ZOO", "INNY"]),
  typInny: z.string().optional(),
  nazwa: z.string().min(1, "Name is required"),
  nazwaFirmy: z.string().min(1, "Company name is required"),
  nip: z.string().min(10, "NIP must be 10 digits"),
  regon: z.string().optional(),
  krs: z.string().optional(),

  // Contact
  imieKontakt: z.string().min(1, "Contact first name is required"),
  nazwiskoKontakt: z.string().min(1, "Contact last name is required"),
  stanowisko: z.string().optional(),
  numerTelefonu: z.string().min(1, "Phone number is required"),
  numerTelefonu2: z.string().optional(),
  emailKontakt: z.string().email("Invalid contact email"),

  // Address
  adres: z.string().min(1, "Address is required"),
  kodPocztowy: z.string().min(1, "Postal code is required"),
  miasto: z.string().min(1, "City is required"),
  voivodeshipId: z.string().min(1, "Voivodeship is required"),

  // Profile
  opis: z.string().optional(),

  // Type and subscription
  typOferty: z.enum(["STALA_WSPOLPRACA", "JEDNORAZOWA_USLUGA", "KONSULTACJA", "WSZYSTKIE"]),
  pakietSubskrypcji: z.enum(["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]).optional(),
  punktySaldo: z.number().optional(),

  // Status
  zweryfikowana: z.boolean().optional(),
  aktywna: z.boolean().optional(),
})

const createLawFirmSchema = lawFirmSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LawFirmFormValues = z.infer<typeof lawFirmSchema>
type CreateLawFirmFormValues = z.infer<typeof createLawFirmSchema>

interface Voivodeship {
  id: string
  nazwa: string
}

interface LawFirm {
  id: string
  typ: LawFirmType
  typInny?: string | null
  nazwa: string
  nazwaFirmy: string
  nip: string
  regon?: string | null
  krs?: string | null
  imieKontakt: string
  nazwiskoKontakt: string
  stanowisko?: string | null
  numerTelefonu: string
  numerTelefonu2?: string | null
  emailKontakt: string
  adres: string
  kodPocztowy: string
  miasto: string
  voivodeshipId: string
  opis?: string | null
  typOferty: OfferType
  pakietSubskrypcji: SubscriptionPackage
  punktySaldo: number
  zweryfikowana: boolean
  aktywna: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    status: string
    createdAt: string
  }
  voivodeship: {
    id: string
    nazwa: string
  }
  _count: {
    offers: number
    reviews: number
    blogPosts: number
    orders: number
    categories: number
    services: number
  }
}

interface PaginatedResponse {
  lawFirms: LawFirm[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function AdminLawFirmsPage() {
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLawFirm, setSelectedLawFirm] = useState<LawFirm | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [subscriptionFilter, setSubscriptionFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })
  const { toast } = useToast()

  const createForm = useForm<CreateLawFirmFormValues>({
    resolver: zodResolver(createLawFirmSchema),
    defaultValues: {
      email: "",
      password: "",
      userStatus: "ACTIVE",
      typ: "OSOBA_FIZYCZNA",
      typInny: "",
      nazwa: "",
      nazwaFirmy: "",
      nip: "",
      regon: "",
      krs: "",
      imieKontakt: "",
      nazwiskoKontakt: "",
      stanowisko: "",
      numerTelefonu: "",
      numerTelefonu2: "",
      emailKontakt: "",
      adres: "",
      kodPocztowy: "",
      miasto: "",
      voivodeshipId: "",
      opis: "",
      typOferty: "WSZYSTKIE",
      pakietSubskrypcji: "PODSTAWOWY",
      punktySaldo: 0,
      zweryfikowana: false,
      aktywna: true,
    },
  })

  const editForm = useForm<LawFirmFormValues>({
    resolver: zodResolver(lawFirmSchema),
    defaultValues: {
      email: "",
      password: "",
      userStatus: "ACTIVE",
      typ: "OSOBA_FIZYCZNA",
      typInny: "",
      nazwa: "",
      nazwaFirmy: "",
      nip: "",
      regon: "",
      krs: "",
      imieKontakt: "",
      nazwiskoKontakt: "",
      stanowisko: "",
      numerTelefonu: "",
      numerTelefonu2: "",
      emailKontakt: "",
      adres: "",
      kodPocztowy: "",
      miasto: "",
      voivodeshipId: "",
      opis: "",
      typOferty: "WSZYSTKIE",
      pakietSubskrypcji: "PODSTAWOWY",
      punktySaldo: 0,
      zweryfikowana: false,
      aktywna: true,
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

  // Fetch law firms
  const fetchLawFirms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (searchQuery) params.append("search", searchQuery)
      if (verifiedFilter) params.append("verified", verifiedFilter)
      if (activeFilter) params.append("active", activeFilter)
      if (subscriptionFilter) params.append("subscription", subscriptionFilter)
      if (typeFilter) params.append("lawFirmType", typeFilter)

      const response = await fetch(`/api/admin/law-firms?${params.toString()}`)
      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        setLawFirms(data.lawFirms)
        setPagination(data.pagination)
      } else {
        throw new Error("Error fetching law firms")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch law firms",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLawFirms()
  }, [currentPage, searchQuery, verifiedFilter, activeFilter, subscriptionFilter, typeFilter])

  // Create law firm
  const handleCreateLawFirm = async (values: CreateLawFirmFormValues) => {
    try {
      const response = await fetch("/api/admin/law-firms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Law firm created successfully",
        })
        setIsCreateDialogOpen(false)
        createForm.reset()
        fetchLawFirms()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error creating law firm")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create law firm",
        variant: "destructive",
      })
    }
  }

  // Update law firm
  const handleEditLawFirm = async (values: LawFirmFormValues) => {
    if (!selectedLawFirm) return

    try {
      const updateData: any = {
        ...values,
      }

      // Only include password if it was changed
      if (!values.password || values.password.length === 0) {
        delete updateData.password
      } else {
        updateData.userPassword = values.password
      }
      delete updateData.password

      // Rename email fields for API
      updateData.userEmail = values.email
      delete updateData.email

      const response = await fetch(`/api/admin/law-firms/${selectedLawFirm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Law firm updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedLawFirm(null)
        editForm.reset()
        fetchLawFirms()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error updating law firm")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update law firm",
        variant: "destructive",
      })
    }
  }

  // Delete law firm
  const handleDeleteLawFirm = async () => {
    if (!selectedLawFirm) return

    try {
      const response = await fetch(`/api/admin/law-firms/${selectedLawFirm.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Law firm deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setSelectedLawFirm(null)
        fetchLawFirms()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error deleting law firm")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete law firm",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (lawFirm: LawFirm) => {
    setSelectedLawFirm(lawFirm)
    editForm.reset({
      email: lawFirm.user.email,
      password: "",
      userStatus: lawFirm.user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
      typ: lawFirm.typ,
      typInny: lawFirm.typInny || "",
      nazwa: lawFirm.nazwa,
      nazwaFirmy: lawFirm.nazwaFirmy,
      nip: lawFirm.nip,
      regon: lawFirm.regon || "",
      krs: lawFirm.krs || "",
      imieKontakt: lawFirm.imieKontakt,
      nazwiskoKontakt: lawFirm.nazwiskoKontakt,
      stanowisko: lawFirm.stanowisko || "",
      numerTelefonu: lawFirm.numerTelefonu,
      numerTelefonu2: lawFirm.numerTelefonu2 || "",
      emailKontakt: lawFirm.emailKontakt,
      adres: lawFirm.adres,
      kodPocztowy: lawFirm.kodPocztowy,
      miasto: lawFirm.miasto,
      voivodeshipId: lawFirm.voivodeshipId,
      opis: lawFirm.opis || "",
      typOferty: lawFirm.typOferty,
      pakietSubskrypcji: lawFirm.pakietSubskrypcji,
      punktySaldo: lawFirm.punktySaldo,
      zweryfikowana: lawFirm.zweryfikowana,
      aktywna: lawFirm.aktywna,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (lawFirm: LawFirm) => {
    setSelectedLawFirm(lawFirm)
    setIsDeleteDialogOpen(true)
  }

  // Format type display
  const formatType = (type: LawFirmType, typeOther?: string | null) => {
    const typeMap: { [key: string]: string } = {
      OSOBA_FIZYCZNA: "Osoba fizyczna",
      SPOLKA_CYWILNA: "Spółka cywilna",
      SPOLKA_PARTNERSKA: "Spółka partnerska",
      SPOLKA_KOMANDYTOWA: "Spółka komandytowa",
      SPOLKA_JAWNA: "Spółka jawna",
      SPOLKA_ZOO: "Spółka z o.o.",
      INNY: typeOther || "Inny",
    }
    return typeMap[type] || type
  }

  // Format subscription display
  const formatSubscription = (subscription: SubscriptionPackage) => {
    const subscriptionMap: { [key: string]: string } = {
      PODSTAWOWY: "Podstawowy",
      STANDARD: "Standard",
      PREMIUM: "Premium",
      BIZNES: "Biznes",
    }
    return subscriptionMap[subscription] || subscription
  }

  // Get subscription badge color
  const getSubscriptionBadgeVariant = (subscription: SubscriptionPackage) => {
    switch (subscription) {
      case "PODSTAWOWY":
        return "secondary"
      case "STANDARD":
        return "default"
      case "PREMIUM":
        return "default"
      case "BIZNES":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading && lawFirms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zarządzanie Kancelariami</h1>
          <p className="text-muted-foreground">Zarządzaj wszystkimi kancelariami prawnymi w systemie</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Building2 className="mr-2 h-4 w-4" />
          Dodaj Kancelarię
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj po nazwie, NIP, emailu..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={fetchLawFirms} size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Typ działalności" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  <SelectItem value="OSOBA_FIZYCZNA">Osoba fizyczna</SelectItem>
                  <SelectItem value="SPOLKA_CYWILNA">Spółka cywilna</SelectItem>
                  <SelectItem value="SPOLKA_PARTNERSKA">Spółka partnerska</SelectItem>
                  <SelectItem value="SPOLKA_ZOO">Spółka z o.o.</SelectItem>
                  <SelectItem value="INNY">Inny</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subscriptionFilter} onValueChange={(value) => {
                setSubscriptionFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pakiet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie pakiety</SelectItem>
                  <SelectItem value="PODSTAWOWY">Podstawowy</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="BIZNES">Biznes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verifiedFilter} onValueChange={(value) => {
                setVerifiedFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Weryfikacja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="true">Zweryfikowane</SelectItem>
                  <SelectItem value="false">Niezweryfikowane</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={(value) => {
                setActiveFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="true">Aktywne</SelectItem>
                  <SelectItem value="false">Nieaktywne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Law Firms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kancelarie ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Lokalizacja</TableHead>
                <TableHead>Pakiet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lawFirms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nie znaleziono kancelarii
                  </TableCell>
                </TableRow>
              ) : (
                lawFirms.map((lawFirm) => (
                  <TableRow key={lawFirm.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{lawFirm.nazwa}</div>
                        <div className="text-xs text-muted-foreground">{lawFirm.nazwaFirmy}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{lawFirm.nip}</TableCell>
                    <TableCell>
                      <span className="text-sm">{formatType(lawFirm.typ, lawFirm.typInny)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lawFirm.imieKontakt} {lawFirm.nazwiskoKontakt}</div>
                        <div className="text-xs text-muted-foreground">{lawFirm.emailKontakt}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lawFirm.miasto}</div>
                        <div className="text-xs text-muted-foreground">{lawFirm.voivodeship.nazwa}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSubscriptionBadgeVariant(lawFirm.pakietSubskrypcji)}>
                        {formatSubscription(lawFirm.pakietSubskrypcji)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {lawFirm.zweryfikowana ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Zweryfikowana
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Niezweryfikowana
                          </Badge>
                        )}
                        {lawFirm.aktywna ? (
                          <Badge variant="default" className="text-xs">Aktywna</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Nieaktywna</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(lawFirm)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(lawFirm)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.pages} ({pagination.total} kancelarii)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Poprzednia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Następna
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Law Firm Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dodaj Nową Kancelarię</DialogTitle>
            <DialogDescription>
              Wprowadź dane nowej kancelarii prawniczej
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateLawFirm)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Podstawowe</TabsTrigger>
                  <TabsTrigger value="contact">Kontakt</TabsTrigger>
                  <TabsTrigger value="address">Adres</TabsTrigger>
                  <TabsTrigger value="settings">Ustawienia</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email użytkownika</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hasło</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="typ"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typ działalności</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz typ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OSOBA_FIZYCZNA">Osoba fizyczna</SelectItem>
                              <SelectItem value="SPOLKA_CYWILNA">Spółka cywilna</SelectItem>
                              <SelectItem value="SPOLKA_PARTNERSKA">Spółka partnerska</SelectItem>
                              <SelectItem value="SPOLKA_KOMANDYTOWA">Spółka komandytowa</SelectItem>
                              <SelectItem value="SPOLKA_JAWNA">Spółka jawna</SelectItem>
                              <SelectItem value="SPOLKA_ZOO">Spółka z o.o.</SelectItem>
                              <SelectItem value="INNY">Inny</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {createForm.watch("typ") === "INNY" && (
                      <FormField
                        control={createForm.control}
                        name="typInny"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typ inny (opis)</FormLabel>
                            <FormControl>
                              <Input placeholder="Podaj typ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="nazwa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nazwa kancelarii" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="nazwaFirmy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa firmy</FormLabel>
                          <FormControl>
                            <Input placeholder="Pełna nazwa firmy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="nip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIP</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="regon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>REGON (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="krs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KRS (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="0000123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="opis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Opis kancelarii..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="imieKontakt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imię osoby kontaktowej</FormLabel>
                          <FormControl>
                            <Input placeholder="Jan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="nazwiskoKontakt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwisko osoby kontaktowej</FormLabel>
                          <FormControl>
                            <Input placeholder="Kowalski" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="stanowisko"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stanowisko (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="Radca prawny" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="numerTelefonu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numer telefonu</FormLabel>
                          <FormControl>
                            <Input placeholder="+48 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="numerTelefonu2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numer telefonu 2 (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="+48 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="emailKontakt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email kontaktowy</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="kontakt@kancelaria.pl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="adres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adres</FormLabel>
                        <FormControl>
                          <Input placeholder="ul. Przykładowa 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="kodPocztowy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kod pocztowy</FormLabel>
                          <FormControl>
                            <Input placeholder="00-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="miasto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miasto</FormLabel>
                          <FormControl>
                            <Input placeholder="Warszawa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="voivodeshipId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Województwo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="typOferty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ oferty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz typ oferty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="STALA_WSPOLPRACA">Stała współpraca</SelectItem>
                            <SelectItem value="JEDNORAZOWA_USLUGA">Jednorazowa usługa</SelectItem>
                            <SelectItem value="KONSULTACJA">Konsultacja</SelectItem>
                            <SelectItem value="WSZYSTKIE">Wszystkie</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="pakietSubskrypcji"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pakiet subskrypcji</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz pakiet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PODSTAWOWY">Podstawowy</SelectItem>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="PREMIUM">Premium</SelectItem>
                              <SelectItem value="BIZNES">Biznes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="punktySaldo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saldo punktów</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <FormField
                      control={createForm.control}
                      name="zweryfikowana"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Zweryfikowana</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="aktywna"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Aktywna</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button type="submit">Dodaj Kancelarię</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Law Firm Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj Kancelarię</DialogTitle>
            <DialogDescription>
              Zaktualizuj dane kancelarii prawniczej
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditLawFirm)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Podstawowe</TabsTrigger>
                  <TabsTrigger value="contact">Kontakt</TabsTrigger>
                  <TabsTrigger value="address">Adres</TabsTrigger>
                  <TabsTrigger value="settings">Ustawienia</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email użytkownika</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hasło</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Pozostaw puste aby nie zmieniać" {...field} />
                          </FormControl>
                          <FormDescription>
                            Pozostaw puste jeśli nie chcesz zmieniać hasła
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="typ"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typ działalności</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz typ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OSOBA_FIZYCZNA">Osoba fizyczna</SelectItem>
                              <SelectItem value="SPOLKA_CYWILNA">Spółka cywilna</SelectItem>
                              <SelectItem value="SPOLKA_PARTNERSKA">Spółka partnerska</SelectItem>
                              <SelectItem value="SPOLKA_KOMANDYTOWA">Spółka komandytowa</SelectItem>
                              <SelectItem value="SPOLKA_JAWNA">Spółka jawna</SelectItem>
                              <SelectItem value="SPOLKA_ZOO">Spółka z o.o.</SelectItem>
                              <SelectItem value="INNY">Inny</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {editForm.watch("typ") === "INNY" && (
                      <FormField
                        control={editForm.control}
                        name="typInny"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typ inny (opis)</FormLabel>
                            <FormControl>
                              <Input placeholder="Podaj typ" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="nazwa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nazwa kancelarii" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="nazwaFirmy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa firmy</FormLabel>
                          <FormControl>
                            <Input placeholder="Pełna nazwa firmy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="nip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIP</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="regon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>REGON (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="krs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KRS (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="0000123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="opis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opis (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Opis kancelarii..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="imieKontakt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imię osoby kontaktowej</FormLabel>
                          <FormControl>
                            <Input placeholder="Jan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="nazwiskoKontakt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwisko osoby kontaktowej</FormLabel>
                          <FormControl>
                            <Input placeholder="Kowalski" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="stanowisko"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stanowisko (opcjonalnie)</FormLabel>
                        <FormControl>
                          <Input placeholder="Radca prawny" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="numerTelefonu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numer telefonu</FormLabel>
                          <FormControl>
                            <Input placeholder="+48 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="numerTelefonu2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numer telefonu 2 (opcjonalnie)</FormLabel>
                          <FormControl>
                            <Input placeholder="+48 123 456 789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="emailKontakt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email kontaktowy</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="kontakt@kancelaria.pl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="adres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adres</FormLabel>
                        <FormControl>
                          <Input placeholder="ul. Przykładowa 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="kodPocztowy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kod pocztowy</FormLabel>
                          <FormControl>
                            <Input placeholder="00-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="miasto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Miasto</FormLabel>
                          <FormControl>
                            <Input placeholder="Warszawa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="voivodeshipId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Województwo</FormLabel>
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
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="typOferty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ oferty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz typ oferty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="STALA_WSPOLPRACA">Stała współpraca</SelectItem>
                            <SelectItem value="JEDNORAZOWA_USLUGA">Jednorazowa usługa</SelectItem>
                            <SelectItem value="KONSULTACJA">Konsultacja</SelectItem>
                            <SelectItem value="WSZYSTKIE">Wszystkie</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="pakietSubskrypcji"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pakiet subskrypcji</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz pakiet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PODSTAWOWY">Podstawowy</SelectItem>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="PREMIUM">Premium</SelectItem>
                              <SelectItem value="BIZNES">Biznes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="punktySaldo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saldo punktów</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <FormField
                      control={editForm.control}
                      name="zweryfikowana"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Zweryfikowana</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="aktywna"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Aktywna</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button type="submit">Zapisz Zmiany</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja usunie kancelarię{" "}
              <strong>{selectedLawFirm?.nazwa}</strong> oraz powiązane z nią konto użytkownika.
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLawFirm(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLawFirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń Kancelarię
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
