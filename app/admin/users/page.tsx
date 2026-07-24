"use client"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Lock, Mail, RefreshCw, Search, Trash2, Unlock, UserPlus } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { PaginatedResponse } from '@/types/pagination';

interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: "CLIENT" | "LAW_FIRM" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BLOCKED" | "PENDING"
  emailVerified?: Date | null
  createdAt: string
  updatedAt: string
  lastLogin?: Date | null
  client?: {
    id: string
    imie: string
    nazwisko: string
    telefon?: string | null
  } | null
  lawFirm?: {
    id: string
    nazwa: string
    nazwa: string
    nip: string
    zweryfikowana: boolean
    aktywna: boolean
  } | null
  _count?: {
    sentMessages: number
    receivedMessages: number
    notifications: number
  }
}



export default function AdminUsersPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSendVerificationDialogOpen, setIsSendVerificationDialogOpen] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })


  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (searchQuery) params.append("search", searchQuery)
      params.append("role", "CLIENT")
      if (statusFilter) params.append("status", statusFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (response.ok) {
        const data: PaginatedResponse<'users', User> = await response.json()
        setUsers(data.users)
        setPagination(data.pagination as any)
      } else {
        throw new Error("Error fetching users")
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery, statusFilter])

  // Toggle user block status
  const handleToggleBlock = async (user: User) => {
    const newStatus = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED"
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast.success(newStatus === "BLOCKED" ? "User blocked successfully" : "User unblocked successfully")
        fetchUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user status")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle block status")
    }
  }

  // Delete user (soft delete)
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("User deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error deleting user")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    }
  }

  // Send activation emails to all PENDING users
  const handleSendPendingVerification = async () => {
    setIsSendingVerification(true)
    try {
      const response = await fetch("/api/admin/users/send-pending-verification", {
        method: "POST",
      })
      const data = await response.json()
      if (response.ok) {
        if (data.total === 0) {
          toast.info("Brak użytkowników PENDING oczekujących na aktywację.")
        } else {
          toast.success(
            `Wysłano ${data.sent} z ${data.total} maili aktywacyjnych.${
              data.failed > 0 ? ` ${data.failed} nie udało się wysłać.` : ""
            }`
          )
        }
      } else {
        throw new Error(data.error || "Błąd serwera")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać maili")
    } finally {
      setIsSendingVerification(false)
      setIsSendVerificationDialogOpen(false)
    }
  }

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "LAW_FIRM":
        return "default"
      case "CLIENT":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "INACTIVE":
        return "secondary"
      case "SUSPENDED":
      case "BLOCKED":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Format role display
  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      CLIENT: "Client",
      LAW_FIRM: "Law Firm",
      ADMIN: "Admin",
    }
    return roleMap[role] || role
  }

  // Format status display
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      ACTIVE: "Active",
      PENDING: "Pending",
      INACTIVE: "Inactive",
      SUSPENDED: "Suspended",
      BLOCKED: "Blocked",
    }
    return statusMap[status] || status
  }

  // Effective status badge: an ACTIVE account with no confirmed email cannot
  // actually log in, so surface that instead of a misleading "Active" badge.
  const getEffectiveStatusBadge = (
    user: User
  ): { label: string; variant: "default" | "primary" | "secondary" | "destructive" | "outline" } => {
    if (user.status === "ACTIVE" && !user.emailVerified) {
      return { label: "Email niepotwierdzony", variant: "outline" }
    }
    return { label: formatStatus(user.status), variant: getStatusBadgeVariant(user.status) }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get user initials for avatar fallback
  const getUserInitials = (user: User) => {
    if (user.name) {
      const names = user.name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return user.name.substring(0, 2).toUpperCase()
    }
    if (user.client) {
      return `${user.client.imie[0]}${user.client.nazwisko[0]}`.toUpperCase()
    }
    if (user.lawFirm) {
      return user.lawFirm.nazwa.substring(0, 2).toUpperCase()
    }
    return user.email.substring(0, 2).toUpperCase()
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Zarządzanie klientami" subtitle="Zarządzaj klientami systemu" />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setIsSendVerificationDialogOpen(true)}
        >
          <Mail className="mr-2 h-4 w-4" />
          Wyślij maile aktywacyjne
        </Button>
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Dodaj klienta
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po imieniu, nazwisku lub emailu..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtruj po statusie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszyskie statusy</SelectItem>
                <SelectItem value="ACTIVE">Aktywny</SelectItem>
                <SelectItem value="PENDING">Oczekujący</SelectItem>
                <SelectItem value="INACTIVE">Nieaktywny</SelectItem>
                <SelectItem value="SUSPENDED">Zawieszony</SelectItem>
                <SelectItem value="BLOCKED">Zablokowany</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUsers} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Klienci ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        {user.image && (
                          <AvatarImage src={user.image} alt={user.name || user.email} />
                        )}
                        <AvatarFallback>
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.name || "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getEffectiveStatusBadge(user).variant}>
                        {getEffectiveStatusBadge(user).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.client && (
                        <span className="text-sm text-muted-foreground">
                          {user.client.imie} {user.client.nazwisko}
                        </span>
                      )}
                      {user.lawFirm && (
                        <span className="text-sm text-muted-foreground">
                          {user.lawFirm.nazwa}
                        </span>
                      )}
                      {!user.client && !user.lawFirm && "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {user.id !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBlock(user)}
                            title={user.status === "BLOCKED" ? "Unlock user" : "Block user"}
                            className={user.status === "BLOCKED" ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
                          >
                            {user.status === "BLOCKED" ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
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
                Strona {pagination.page} z {pagination.pages} (łącznie {pagination.total} klientów)
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the client account for{" "}
              <strong>{selectedUser?.email}</strong>. The client will no longer be able to
              access the system, but their data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Verification Confirmation Dialog */}
      <AlertDialog open={isSendVerificationDialogOpen} onOpenChange={setIsSendVerificationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wysłać maile aktywacyjne?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja wyśle maile z linkiem weryfikacyjnym (ważnym 24h) do{" "}
              <strong>wszystkich użytkowników ze statusem PENDING</strong>{" "}
              którzy nie mają jeszcze potwierdzonego emaila. Poprzednie tokeny
              weryfikacyjne zostaną unieważnione i zastąpione nowymi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingVerification}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendPendingVerification}
              disabled={isSendingVerification}
            >
              {isSendingVerification ? "Wysyłanie..." : "Wyślij maile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
