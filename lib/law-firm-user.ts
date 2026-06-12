/**
 * Pola osobowe/kontaktowe/adresowe kancelarii zostały przeniesione
 * z modelu LawFirm do modelu User. Te helpery pozwalają:
 *  - dociągać je relacją `user` w zapytaniach Prisma (USER_CONTACT_SELECT),
 *  - spłaszczać wynik do dotychczasowego kształtu odpowiedzi API
 *    (imieKontakt, nazwiskoKontakt, numerTelefonu, adres, miasto, ...).
 */

export const USER_CONTACT_SELECT = {
  imie: true,
  nazwisko: true,
  numerTelefonu: true,
  numerTelefonu2: true,
  adres: true,
  kodPocztowy: true,
  miasto: true,
  voivodeshipId: true,
  latitude: true,
  longitude: true,
  voivodeship: {
    select: { id: true, nazwa: true, slug: true },
  },
} as const;

export interface UserContactFields {
  imie?: string | null;
  nazwisko?: string | null;
  numerTelefonu?: string | null;
  numerTelefonu2?: string | null;
  adres?: string | null;
  kodPocztowy?: string | null;
  miasto?: string | null;
  voivodeshipId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  voivodeship?: { id: string; nazwa: string; slug: string } | null;
}

/**
 * Spłaszcza dane kontaktowe z relacji `user` do dotychczasowych pól
 * na obiekcie kancelarii (zachowuje kompatybilny kształt odpowiedzi API).
 */
export function flattenLawFirmUser<T extends { user?: UserContactFields | null }>(
  lawFirm: T
) {
  const user = lawFirm.user;
  return {
    ...lawFirm,
    imieKontakt: user?.imie ?? "",
    nazwiskoKontakt: user?.nazwisko ?? "",
    numerTelefonu: user?.numerTelefonu ?? "",
    numerTelefonu2: user?.numerTelefonu2 ?? null,
    adres: user?.adres ?? "",
    kodPocztowy: user?.kodPocztowy ?? "",
    miasto: user?.miasto ?? "",
    voivodeshipId: user?.voivodeshipId ?? null,
    latitude: user?.latitude ?? null,
    longitude: user?.longitude ?? null,
    voivodeship: user?.voivodeship ?? null,
  };
}

/**
 * Spłaszcza dane kontaktowe z relacji `user` do dotychczasowych pól
 * na obiekcie klienta (telefon, adres, kodPocztowy, miasto, voivodeship).
 */
export function flattenClientUser<T extends { user?: UserContactFields | null }>(
  client: T
) {
  const user = client.user;
  return {
    ...client,
    telefon: user?.numerTelefonu ?? null,
    adres: user?.adres ?? null,
    kodPocztowy: user?.kodPocztowy ?? null,
    miasto: user?.miasto ?? null,
    voivodeshipId: user?.voivodeshipId ?? null,
    voivodeship: user?.voivodeship ?? null,
  };
}
