import * as z from "zod"

export const lawFirmSchema = z.object({
  // User credentials
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"]),
  emailVerified: z.boolean(),

  // Basic info
  typ: z.enum(["OSOBA_FIZYCZNA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_KOMANDYTOWA", "SPOLKA_JAWNA", "SPOLKA_ZOO", "INNY"]),
  typInny: z.string().optional(),
  expertiseCategoryId: z.string().optional(),
  nazwa: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  nip: z.string().regex(/^\d{10}$/, "NIP must be 10 digits").or(z.literal("")),
  regon: z.string().optional(),
  krs: z.string().optional(),

  // Contact
  imieKontakt: z.string().min(1, "Contact first name is required"),
  nazwiskoKontakt: z.string().min(1, "Contact last name is required"),
  numerTelefonu: z.string().min(1, "Phone number is required"),
  numerTelefonu2: z.string().optional(),

  // Address
  adres: z.string().min(1, "Address is required"),
  kodPocztowy: z.string().min(1, "Postal code is required"),
  miasto: z.string().min(1, "City is required"),
  voivodeshipId: z.string().min(1, "Voivodeship is required"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),

  // Profile
  opis: z.string().optional(),
  logo: z.string().optional(),

  // Multimedia
  zdjecieGlowne: z.string().optional(),
  galeriaZdjec: z.string().optional(),
  filmYouTube: z.string().optional(),
  okladkaFilmu: z.string().optional(),
  kolejnoscMultimedia: z.enum(["zdjecia", "film"]).optional(),

  // Business hours
  statusGodzinyOtwarcia: z.boolean(),
  godzinyOtwarcia: z.string().optional(),

  // Social media
  linkLinkedIn: z.string().optional(),
  linkFacebook: z.string().optional(),
  linkInstagram: z.string().optional(),
  linkTwitter: z.string().optional(),
  linkTikTok: z.string().optional(),
  stronaWww: z.string().optional(),

  // Education
  edukacja: z.string().optional(),

  // Legal registrations
  oirpMiasto: z.string().optional(),
  oirpWpis: z.string().optional(),
  oirpStatus: z.boolean(),
  oraMiasto: z.string().optional(),
  oraWpis: z.string().optional(),
  oraStatus: z.boolean(),

  // Services
  unikatowyOpisUslugi: z.string().optional(),
  slowaKluczowe: z.string().optional(),

  // Specjalizacje prawne (LawFirmCategory) + specjalizacja wiodąca
  categoryIds: z.array(z.string()),
  mainCategoryId: z.string().optional(),

  // Biegły sądowy — odznaka na profilu publicznym
  bieglySadowy: z.boolean(),
  bieglySadowyNazwaSadu: z.string().optional(),

  // Coverage area
  calaPolska: z.boolean(),
  onlineOnly: z.boolean(),
  voivodeshipsIds: z.array(z.string()),
  citiesIds: z.array(z.string()),

  // Type and subscription
  typOferty: z.enum(["STALA_WSPOLPRACA", "JEDNORAZOWA_USLUGA", "KONSULTACJA", "WSZYSTKIE"]),
  pakietSubskrypcji: z.enum(["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]).nullable().optional().or(z.literal("")),
  punktySaldo: z.number(),
  dataPakietuOd: z.string().optional(),
  dataPakietuDo: z.string().optional(),
  packageDurationDays: z.number().optional(),
  autoRenewal: z.boolean(),

  // Consents
  zgodaRegulamin: z.boolean(),
  zgodaPrzetwarzanie: z.boolean(),

  // Status
  zweryfikowana: z.boolean(),
  aktywna: z.boolean(),

  // Account Manager
  accountManagerId: z.string().optional(),
}).superRefine((data, ctx) => {
  // Specjalizacja wiodąca musi należeć do wybranych specjalizacji — inaczej
  // profil publiczny wskazuje kategorię, której ekspert nie obsługuje.
  if (data.mainCategoryId && !data.categoryIds.includes(data.mainCategoryId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mainCategoryId"],
      message: "Specjalizacja wiodąca musi być na liście wybranych specjalizacji",
    })
  }

  // Nazwa sądu celowo nie jest wymagana — ekspert może zapisać samą odznakę
  // w swoim panelu, a admin musi móc edytować takie profile.
})

export type LawFirmFormValues = z.infer<typeof lawFirmSchema>

import type { Voivodeship } from "@/types"
export type { Voivodeship }

export interface CategoryOption {
  id: string
  nazwa: string
  parentId: string | null
}

export interface CityOption {
  id: string
  nazwa: string
  voivodeshipId: string
}

export interface AccountManager {
  id: string
  imie: string
  nazwisko: string
  email: string
  aktywny: boolean
}

export interface NotificationSettings {
  id: string
  userId: string
  emailNoweOferty: boolean
  emailWiadomosci: boolean
  emailStatusy: boolean
  smsPilne: boolean
  kontaktKlienci: boolean
  kluczowe: boolean
  wskazowkiPorady: boolean
  ofertPromocje: boolean
  przypomnienieWiadomosci: boolean
  noweFunkcje: boolean
  zmianyCenniki: boolean
  zmianyRegulamin: boolean
  kontaktDoradca: boolean
  wyswietlanieAwatara: boolean
  autoProsbOpinie: boolean
  powiadomienieDzwiekowe: boolean
  ustawieniaOgloszenia: boolean
  powiadomieniaSmNowa: boolean
  wiadomosciZbiorcze: boolean
  urlop: boolean
}
