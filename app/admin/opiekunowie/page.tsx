'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Plus, Trash2, Upload, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminHeaderSetter } from '@/components/admin/AdminTitleContext'

interface AccountManager {
  id: string
  imie: string
  nazwisko: string
  email: string
  telefon: string | null
  avatar: string | null
  aktywny: boolean
  createdAt: string
  lawFirms: {
    id: string
    nazwa: string
    numerTelefonu: string
    miasto: string
  }[]
  _count: {
    lawFirms: number
  }
}

export default function AccountManagersPage() {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingManager, setEditingManager] = useState<AccountManager | null>(null)
  const [viewingFirmsFor, setViewingFirmsFor] = useState<AccountManager | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    imie: '',
    nazwisko: '',
    email: '',
    telefon: '',
    avatar: '',
    aktywny: true,
  })

  useEffect(() => {
    fetchAccountManagers()
  }, [])

  const fetchAccountManagers = async () => {
    try {
      const response = await fetch('/api/admin/account-managers')
      if (response.ok) {
        const data = await response.json()
        setAccountManagers(data)
      }
    } catch (error) {
      console.error('Error fetching account managers:', error)
      toast.error('Błąd podczas pobierania opiekunów')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingManager
      ? `/api/admin/account-managers/${editingManager.id}`
      : '/api/admin/account-managers'

    const method = editingManager ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          editingManager ? 'Opiekun został zaktualizowany' : 'Opiekun został dodany'
        )
        setDialogOpen(false)
        resetForm()
        fetchAccountManagers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Wystąpił błąd')
      }
    } catch (error) {
      console.error('Error saving account manager:', error)
      toast.error('Wystąpił błąd podczas zapisywania')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego opiekuna?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/account-managers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Opiekun został usunięty')
        fetchAccountManagers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Wystąpił błąd')
      }
    } catch (error) {
      console.error('Error deleting account manager:', error)
      toast.error('Wystąpił błąd podczas usuwania')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await fetch('/api/admin/account-managers/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, avatar: data.url }))
        toast.success('Avatar został przesłany')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Wystąpił błąd')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Wystąpił błąd podczas przesyłania')
    } finally {
      setUploading(false)
    }
  }

  const openEditDialog = (manager: AccountManager) => {
    setEditingManager(manager)
    setFormData({
      imie: manager.imie,
      nazwisko: manager.nazwisko,
      email: manager.email,
      telefon: manager.telefon || '',
      avatar: manager.avatar || '',
      aktywny: manager.aktywny,
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingManager(null)
    setFormData({
      imie: '',
      nazwisko: '',
      email: '',
      telefon: '',
      avatar: '',
      aktywny: true,
    })
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Opiekunowie" subtitle="Zarządzaj opiekunami przypisanymi do ekspertów" />
      <div className="flex justify-between items-center">
        <div />
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj opiekuna
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingManager ? 'Edytuj opiekuna' : 'Dodaj opiekuna'}
              </DialogTitle>
              <DialogDescription>
                {editingManager
                  ? 'Zaktualizuj dane opiekuna eksperta'
                  : 'Dodaj nowego opiekuna eksperta'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar || undefined} />
                    <AvatarFallback>
                      {formData.imie[0]}
                      {formData.nazwisko[0]}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imie">Imię *</Label>
                  <Input
                    id="imie"
                    value={formData.imie}
                    onChange={(e) =>
                      setFormData({ ...formData, imie: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nazwisko">Nazwisko *</Label>
                  <Input
                    id="nazwisko"
                    value={formData.nazwisko}
                    onChange={(e) =>
                      setFormData({ ...formData, nazwisko: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefon">Telefon</Label>
                <Input
                  id="telefon"
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) =>
                    setFormData({ ...formData, telefon: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="aktywny"
                  type="checkbox"
                  checked={formData.aktywny}
                  onChange={(e) =>
                    setFormData({ ...formData, aktywny: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="aktywny">Aktywny</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit">
                  {editingManager ? 'Zaktualizuj' : 'Dodaj'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for viewing assigned experts (law firms) */}
        <Dialog open={!!viewingFirmsFor} onOpenChange={(open) => !open && setViewingFirmsFor(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Eksperci przypisani do opiekuna</DialogTitle>
              <DialogDescription>
                {viewingFirmsFor?.imie} {viewingFirmsFor?.nazwisko} ({viewingFirmsFor?.email})
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto mt-4">
              {viewingFirmsFor?.lawFirms && viewingFirmsFor.lawFirms.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Miasto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingFirmsFor.lawFirms.map((firm) => (
                      <TableRow key={firm.id}>
                        <TableCell className="font-medium">{firm.nazwa}</TableCell>

                        <TableCell>{firm.numerTelefonu}</TableCell>
                        <TableCell>{firm.miasto}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Brak przypisanych ekspertów
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingFirmsFor(null)}>Zamknij</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista opiekunów</CardTitle>
          <CardDescription>
            {accountManagers.length} {accountManagers.length === 1 ? 'opiekun' : 'opiekunów'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opiekun</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Eksperci</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountManagers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Brak opiekunów
                  </TableCell>
                </TableRow>
              ) : (
                accountManagers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={manager.avatar || undefined} />
                          <AvatarFallback>
                            {manager.imie[0]}
                            {manager.nazwisko[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {manager.imie} {manager.nazwisko}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{manager.telefon || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{manager._count.lawFirms}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={manager.aktywny ? 'default' : 'secondary'}
                      >
                        {manager.aktywny ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Zobacz przypisanych ekspertów"
                          onClick={() => setViewingFirmsFor(manager)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(manager)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(manager.id)}
                          disabled={manager._count.lawFirms > 0}
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
        </CardContent>
      </Card>
    </div>
  )
}
