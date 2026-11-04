import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/toast"
import { api } from "./api"
import type { Booking, Category, Dashboard, LawFirm, Permissions, PublicSettings, SubscriptionPlan } from "./types"

const STATIC_DATA_STALE_TIME = 10 * 60 * 1000

export const useLawFirm = () => useQuery({ queryKey: ["law-firm"], queryFn: () => api<LawFirm>("/api/law-firms/me") })

export const usePermissions = () =>
  useQuery({ queryKey: ["permissions"], queryFn: () => api<Permissions>("/api/law-firms/me/permissions") })

export const usePublicSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: () => api<PublicSettings>("/api/settings"),
    staleTime: STATIC_DATA_STALE_TIME,
  })

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("/api/categories"),
    staleTime: STATIC_DATA_STALE_TIME,
  })

export const useSubscriptionPlans = () =>
  useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => api<SubscriptionPlan[]>("/api/subscription-plans"),
  })

export const useDashboard = () =>
  useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dashboard>("/api/law-firms/dashboard") })

export function useBookings() {
  const { data: lawFirm, error: lawFirmError, refetch: refetchLawFirm } = useLawFirm()
  const bookings = useQuery({
    queryKey: ["bookings", lawFirm?.id],
    queryFn: () => api<Booking[]>(`/api/law-firms/${lawFirm!.id}/consultation-bookings/all`),
    enabled: !!lawFirm,
  })

  // Bez profilu zapytanie o rezerwacje nie wystartuje; błąd profilu trzeba przekazać dalej
  return {
    ...bookings,
    isPending: bookings.isPending && !lawFirmError,
    error: bookings.error ?? lawFirmError,
    refetch: () => (lawFirm ? bookings.refetch() : refetchLawFirm()),
  }
}

export function usePendingBookingsCount(): number {
  const { data } = useBookings()
  return data?.filter((booking) => booking.status === "PENDING" && !booking.isArchived).length ?? 0
}

/** Otwiera rozmowę z klientem, zakładając ją przy pierwszym kontakcie. */
export function useOpenChat() {
  const navigate = useNavigate()
  const toast = useToast()
  return useMutation({
    mutationFn: (clientUserId: string) =>
      api<{ id: string }>("/api/conversations", { method: "POST", body: { clientUserId } }),
    onSuccess: (conversation) => navigate(`/wiadomosci/${conversation.id}`),
    onError: toast.error,
  })
}
