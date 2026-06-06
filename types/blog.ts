/**
 * Centralized blog types
 */

export interface BlogCategory {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  aktywna?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  _count?: {
    blogPosts: number
  }
}


export interface BlogPost {
  id: string;
  tytul: string;
  slug: string;
  tresc?: string;
  obrazekWyrozniajacy?: string | null;
  dataPublikacji?: string | Date | null;
  wyswietlenia?: number;
  status?: string;
  opublikowany?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  categoryId?: string | null;
  category?: {
    id?: string;
    nazwa: string;
    slug?: string;
  } | null;
  lawFirmId?: string | null;
  lawFirm?: {
    id?: string;
    nazwa?: string;
    nazwaFirmy?: string;
    logo?: string | null;
    miasto?: string;
    voivodeship?: any;
  } | null;
  views?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isSponsored?: boolean;
  sponsoredLawFirm?: any;
  tagi?: string | null;
}
