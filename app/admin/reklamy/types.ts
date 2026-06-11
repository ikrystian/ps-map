export interface AdClient {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  notes: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: { ads: number }
  ads?: Advertisement[]
}

export interface Advertisement {
  id: string
  name: string
  imageUrl: string | null
  linkUrl: string
  htmlContent: string | null
  location: string
  active: boolean
  impressions: number
  clicks: number
  weight: number
  priority: number
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  clientId: string | null
  client?: { id: string; name: string } | null
}

export const AD_LOCATIONS = [
  { value: "search_top", label: "Szukaj - Baner Góra (970x90 / 728x90)" },
  { value: "search_list_middle", label: "Szukaj - Baner Środek Listy (728x90)" },
  { value: "category_top", label: "Kategoria - Baner Góra (970x90 / 728x90)" },
  { value: "category_sidebar", label: "Kategoria - Baner Sidebar (300x250)" },
]
