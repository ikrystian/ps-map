export interface LawFirm {
  id: string
  nazwa: string
  logo: string | null
  imieKontakt?: string | null
  punktySaldo: number
  pakietSubskrypcji: string | null
  dataPakietuDo: string | null
  zweryfikowana: boolean
  aktywna: boolean
}

export interface Permissions {
  pakietSubskrypcji: string | null
  dataPakietuDo: string | null
  zalaczniki?: boolean
  powiadomieniaSprawy: number
  permissions?: { extras?: { allowAttachments?: boolean } }
}

export interface Category {
  id: string
  nazwa: string
  parentId?: string | null
  typ?: string
  aktywna?: boolean
}

export interface CaseOfferSummary {
  id: string
  status: string
  kwotaNetto: number
  terminRealizacjiDni: number
  createdAt: string
}

export interface CaseListItem {
  id: string
  numerSprawy: string | null
  nazwaSprawy: string
  opisSprawy: string
  typSprawy: string
  budzetOd: number | null
  budzetDo: number | null
  doNegocjacji: boolean
  trybPilny: boolean
  zTwojegoPolecenia?: boolean
  status: string
  createdAt: string
  category: { id: string; nazwa: string }
  categories?: { category: { id: string; nazwa: string } }[]
  voivodeship: { id: string; nazwa: string }
  city?: { id: string; nazwa: string } | null
  _count?: { offers: number }
  offers?: CaseOfferSummary[]
}

export interface CaseDetail extends Omit<CaseListItem, "offers"> {
  zalaczniki?: string[] | null
  oczekiwanyTerminRealizacji?: string | null
  imieNazwisko: string
  telefonKontakt: string
  client?: { userId: string } | null
  referral?: { id: string } | null
  offers?: { id: string; status: string; lawFirmId: string }[]
}

export interface Dashboard {
  lawFirm: LawFirm & {
    zlozoneOferty: number
    wygraneOferty: number
    konwersja: number
    pozycjaRanking: number | null
  }
  stats: {
    casesThisMonth: number
    offersThisMonth: number
    viewsThisMonth: number
    averageRating: number
    reviewsCount: number
  }
}

export interface Offer {
  id: string
  caseId: string
  kwotaNetto: number
  vat: number
  kwotaBrutto: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  warunkiPlatnosci: string
  dodatkoweWarunki?: string | null
  wyroznienie?: boolean
  status: string
  createdAt: string
  case: {
    id: string
    nazwaSprawy: string
    typSprawy: string
    category: { nazwa: string }
    client: { imie: string; nazwisko: string }
  }
}

export interface Referral {
  id: string
  email: string
  status: string
  link: string
  nazwaSprawy: string | null
  expiresAt: string
  createdAt: string
  categories: { category: { id: string; nazwa: string } }[]
  city: { nazwa: string } | null
  voivodeship: { nazwa: string } | null
  case: { id: string; nazwaSprawy: string; status: string } | null
}

export interface ReferralStats {
  wyslane: number
  otwarte: number
  zarejestrowane: number
  sprawy: number
  konwersja: number
}

export interface Booking {
  id: string
  consultationDate: string
  duration: number
  price: number
  topic: string
  clientContact: string
  status: string
  paymentStatus: string
  googleMeetUrl: string | null
  isArchived: boolean
  client: { userId: string; imie: string | null; nazwisko: string | null; user?: { name: string | null } }
}

export interface OwnInterest {
  id: string
  proponowanyTermin: string
  alternatywnyTermin: string | null
  duration: number
  cena: number
  forma: string
  wiadomosc: string
  status: string
}

export interface ConsultationRequest {
  id: string
  temat: string
  opis: string
  forma: string
  status: string
  budzetDo: number | null
  preferowanyCzas: number | null
  preferowanyTermin: string | null
  terminOd: string | null
  terminDo: string | null
  telefonKontakt?: string | null
  createdAt: string
  category: { nazwa: string } | null
  client: { imie: string | null; nazwisko: string | null } | null
  interests: OwnInterest[]
  liczbaZgloszen: number
}

export interface Conversation {
  id: string
  otherUser: { id: string; name: string; image: string | null; isOnline?: boolean }
  lastMessage: { content: string; createdAt: string; isFromMe: boolean; isRead: boolean } | null
  unreadCount: number
  updatedAt: string
}

export interface MessageAttachment {
  url: string
  filename: string
  size?: number
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  isRead: boolean
  createdAt: string
  attachments: MessageAttachment[] | null
}

export interface MessagesPage {
  messages: ChatMessage[]
  total: number
  hasMore: boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Order {
  id: string
  orderNumber?: string
  orderType?: string
  pakietPunktow: string | null
  liczbaPunktow: number | null
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: "OCZEKUJE" | "ZAPLACONE" | "ANULOWANE" | "ZWROT"
  subscriptionPlan?: { nazwa: string } | null
  subscriptionPeriod?: number | null
  createdAt: string
}

export interface PointEntry {
  id: string
  amount: number
  balanceAfter: number
  type: string
  description: string
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  grossAmount: number
  status: string
  ksefStatus: string | null
  ksefNumber: string | null
  order: { orderNumber: string; orderType: string }
}

export interface SubscriptionPlan {
  id: string
  typ: string
  nazwa: string
  cena1Miesiac: number | null
  cena6Miesiecy: number | null
  cena12Miesiecy: number
  dostepDoSpraw: number | null
  kategorieSpraw: number | null
  wojewodztwa: number | null
  miasta: number | null
  powiadomieniaSprawy: number
  punktyGratis: number
}

export type PublicSettings = Record<string, string | undefined>

export interface AccountInfo {
  createdAt: string
  lastLogin: { date: string; ipAddress: string | null } | null
  lastFailedLogin: { date: string; ipAddress: string | null } | null
}

export interface LoginRecord {
  id: string
  success: boolean
  ipAddress: string | null
  location: string | null
  userAgent: string | null
  createdAt: string
}

export interface RetentionSummary {
  invoices: number
  paidOrders: number
  cases: number
  offers: number
  retentionUntil: string
}

export interface City {
  id: string
  nazwa: string
  voivodeship?: { nazwa: string }
  county?: { nazwa: string } | null
}
