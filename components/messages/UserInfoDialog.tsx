"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/sonner"
import { formatLastSeen } from "@/lib/time-utils"
import { Ban, Calendar, CheckCircle2, Mail, UserCircle } from "lucide-react"
import { useState } from "react"

interface UserInfo {
  id: string
  name: string
  email: string
  image?: string
  role: "CLIENT" | "LAW_FIRM"
  createdAt: string
  description?: string
  isOnline?: boolean
  lastSeen?: string
  isBlocked?: boolean
  // Law firm specific
  lawFirm?: {
    nazwa: string
    opis?: string
    logo?: string
    nip?: string
    miasto?: string
    voivodeship?: {
      nazwa: string
    }
  }
  // Client specific
  client?: {
    imie: string
    nazwisko: string
    miasto?: string
  }
}

interface UserInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onBlock?: () => void
  onUnblock?: () => void
}

export function UserInfoDialog({
  open,
  onOpenChange,
  userId,
  onBlock,
  onUnblock,
}: UserInfoDialogProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)

  // Fetch user info when dialog opens
  useState(() => {
    if (open && userId) {
      fetchUserInfo()
    }
  })

  const fetchUserInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/info`)
      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
      } else {
        toast.error("Nie udało się pobrać informacji o użytkowniku")
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      toast.error("Wystąpił błąd podczas ładowania danych")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlock = async () => {
    setIsBlocking(true)
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Użytkownik został zablokowany")
        setUserInfo((prev) => (prev ? { ...prev, isBlocked: true } : null))
        onBlock?.()
      } else {
        toast.error("Nie udało się zablokować użytkownika")
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      toast.error("Wystąpił błąd podczas blokowania")
    } finally {
      setIsBlocking(false)
    }
  }

  const handleUnblock = async () => {
    setIsBlocking(true)
    try {
      const response = await fetch(`/api/users/${userId}/unblock`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Użytkownik został odblokowany")
        setUserInfo((prev) => (prev ? { ...prev, isBlocked: false } : null))
        onUnblock?.()
      } else {
        toast.error("Nie udało się odblokować użytkownika")
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast.error("Wystąpił błąd podczas odblokowywania")
    } finally {
      setIsBlocking(false)
    }
  }

  const displayName = userInfo?.lawFirm?.nazwa || userInfo?.name || "Użytkownik"
  const displayImage = userInfo?.lawFirm?.logo || userInfo?.image

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informacje o użytkowniku</DialogTitle>
          <DialogDescription>
            Szczegółowe informacje o koncie
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : userInfo ? (
          <div className="space-y-6">
            {/* Avatar and basic info */}
            <div className="flex flex-col items-center text-center space-y-3">
              <Avatar className="h-24 w-24">
                {displayImage && (
                  <AvatarImage src={displayImage} alt={displayName} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold">{displayName}</h3>
                {userInfo.isOnline !== undefined && (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        userInfo.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {userInfo.isOnline
                        ? "Online"
                        : userInfo.lastSeen
                        ? formatLastSeen(userInfo.lastSeen)
                        : "Offline"}
                    </span>
                  </div>
                )}
              </div>

              {userInfo.isBlocked && (
                <Badge variant="destructive" className="gap-1">
                  <Ban className="h-3 w-3" />
                  Zablokowany
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{userInfo.email}</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  Dołączył:{" "}
                  {new Date(userInfo.createdAt).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <UserCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  {userInfo.role === "LAW_FIRM" ? "Ekspert prawny" : "Klient"}
                </span>
              </div>

              {userInfo.lawFirm?.miasto && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-xs">📍</span>
                  <span>
                    {userInfo.lawFirm.miasto}
                    {userInfo.lawFirm.voivodeship &&
                      `, ${userInfo.lawFirm.voivodeship.nazwa}`}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {(userInfo.description || userInfo.lawFirm?.opis) && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  {userInfo.description || userInfo.lawFirm?.opis}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t">
              {userInfo.isBlocked ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleUnblock}
                  disabled={isBlocking}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isBlocking ? "Odblokowywanie..." : "Odblokuj"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleBlock}
                  disabled={isBlocking}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {isBlocking ? "Blokowanie..." : "Zablokuj"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nie znaleziono informacji o użytkowniku
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
