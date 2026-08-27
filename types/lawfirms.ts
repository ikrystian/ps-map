/**
 * Centralized law firm types
 * Used across the application for law firm data
 */

import type { Review } from "./reviews"


/**
 * Base law firm type with essential fields
 */
export interface LawFirmBase {
  id: string
  slug: string
  nazwa: string
  logo?: string | null
  zdjecieGlowne?: string | null
  numerTelefonu?: string | null
  stronaWww?: string | null
}

/**
 * Law firm with location information
 */
export interface LawFirmWithLocation extends LawFirmBase {
  miasto: string
  ulica?: string | null
  kodPocztowy?: string | null
  voivodeship?: {
    id?: string
    nazwa: string
    slug?: string
  } | null
  voivodeshipId?: string
}

/**
 * Law firm for public listing/search and general usage
 */
export interface LawFirm extends LawFirmWithLocation {
  nip?: string | null
  regon?: string | null
  krs?: string | null
  imieKontakt?: string | null
  nazwiskoKontakt?: string | null
  numerTelefonu2?: string | null
  adres?: string | null
  latitude?: number | null
  longitude?: number | null
  opis?: string | null
  filmYouTube?: string | null
  okladkaFilmu?: string | null
  kolejnoscMultimedia?: string | null
  statusGodzinyOtwarcia?: boolean
  godzinyOtwarcia?: Record<string, string> | any
  linkLinkedIn?: string | null
  linkFacebook?: string | null
  linkInstagram?: string | null
  linkTwitter?: string | null
  linkTikTok?: string | null
  telefon?: string | null
  email?: string | null
  strona?: string | null
  unikatowyOpisUslugi?: string | null
  slowaKluczowe?: string[] | any
  calaPolska?: boolean
  onlineOnly?: boolean
  bieglySadowy?: boolean
  bieglySadowyNazwaSadu?: string | null
  punktySaldo?: number
  pakietSubskrypcji?: string | null
  pakietObrazek?: string | null
  dataPakietuOd?: string | Date | null
  dataPakietuDo?: string | Date | null
  mainCategoryName?: string
  subscriptionType?: string | null
  autoRenewal?: boolean
  wyswietleniaProfilu?: number
  zlozoneOferty?: number
  wygraneOferty?: number
  konwersja?: number
  pozycjaRanking?: number | null
  zgodaRegulamin?: boolean
  zgodaPrzetwarzanie?: boolean
  zweryfikowana: boolean
  aktywna?: boolean
  expertiseCategoryId?: string | null
  expertiseCategory?: {
    id: string
    nazwa: string
    kolor?: string | null
  } | null
  // Flagi pochodzące z ustawień powiadomień eksperta (profil publiczny)
  przyjmujeBezposrednieZapytania?: boolean
  naUrlopie?: boolean
  skillLawFocusActive?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  rank?: number | null
  profilViews?: number

  categories: Array<{
    id?: string
    kolejnosc?: number
    percentage?: number
    category?: {
      id?: string
      nazwa: string
      slug: string
      opis?: string | null
      opisDodatkowy?: string | null
      ikona?: string | null
      typ?: string
    }
    // simple format support
    nazwa?: string
    slug?: string
  }>
  avgRating: number
  reviewCount: number

  voivodeships?: Array<{
    voivodeship: {
      nazwa: string
    }
  }>
  cities?: Array<{
    city: {
      nazwa: string
      voivodeship: {
        nazwa: string
      }
    }
  }>
  services?: Array<{
    id: string
    nazwaUslugi: string
    opisUslugi: string
    cenaOd?: number | null
    cenaDo?: number | null
    jednostka: string
  }>
  certificates?: Array<{
    id: string
    nazwaCertyfikatu: string
    wydawca: string
    dataUzyskania: string
    dataWaznosci?: string
    numerCertyfikatu?: string
    skanCertyfikatu?: string
  }>
  blogPosts?: Array<{
    id: string
    tytul: string
    slug: string
    tresc: string
    obrazekWyrozniajacy?: string
    dataPublikacji: string
    wyswietlenia: number
  }>
  reviews?: Review[]
  badges?: Array<{
    id: string
    badge: {
      id: string
      name: string
      description: string
      imageUrl: string
      conditionType?: string
      threshold?: number
      createdAt?: string
      updatedAt?: string
    }
    awardedAt: string | Date
  }>
  edukacja?: Array<{
    uczelnia: string
    wydzial: string
    rokOd: string
    rokDo: string
  }>
  galeriaZdjec?: string[]
  oraStatus?: boolean
  oraMiasto?: string | null
  oraWpis?: string | null
  oirpStatus?: boolean
  oirpMiasto?: string | null
  oirpWpis?: string | null
  user?: {
    id: string
    email: string
    name?: string | null
    status?: string
    emailVerified?: string | Date | null
    createdAt?: string | Date
  }
  // Publiczny e-mail kontaktowy (opcjonalny — obecnie nieeksponowany przez API)
  emailKontakt?: string | null
  _count?: {
    offers?: number
    reviews?: number
    blogPosts?: number
    orders?: number
    categories?: number
    services?: number
  }
}

/**
 * Complete law firm profile (for profile pages)
 */
export interface LawFirmProfile extends LawFirm {
  specjalizacje?: string | null
  wyksztalcenie?: string | null
  certyfikaty?: string | null
  godzinyPracy?: string | null
  galeria?: string | null
  punkty?: number
  subscriptionPlan?: {
    id: string
    nazwa: string
    cena: number
  } | null
}

/**
 * Law firm reference (minimal info for relations)
 */
export interface LawFirmReference {
  id: string
  slug: string
  nazwa: string
  logo?: string | null
}

