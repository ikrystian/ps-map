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
import { Edit, Lock, RefreshCw, Search, Trash2, Unlock, UserPlus } from "lucide-react"
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
    nazwaFirmy: string
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
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
      if (roleFilter) params.append("role", roleFilter)
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
  }, [currentPage, searchQuery, roleFilter, statusFilter])

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
      return user.lawFirm.nazwaFirmy.substring(0, 2).toUpperCase()
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
      <AdminHeaderSetter title="Zarządzanie użytkownikami" subtitle="Zarządzaj użytkownikami systemu" />
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Dodaj użytkownika
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
            <Select value={roleFilter} onValueChange={(value) => {
              setRoleFilter(value === "all" ? "" : value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtruj po roli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszyskie role</SelectItem>
                <SelectItem value="CLIENT">Klient</SelectItem>
                <SelectItem value="LAW_FIRM">Ekspert</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
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
          <CardTitle>Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
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
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {formatStatus(user.status)}
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
                          {user.lawFirm.nazwaFirmy}
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
                Page {pagination.page} of {pagination.pages} ({pagination.total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
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
              This will soft delete the user account for{" "}
              <strong>{selectedUser?.email}</strong>. The user will no longer be able to
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
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
