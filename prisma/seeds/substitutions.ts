import {
  PrismaClient,
  UserRole,
  UserStatus,
  type Prisma,
  type SubstitutionInvoiceStatus,
  type SubstitutionOfferStatus,
  type SubstitutionStatus,
} from "@prisma/client";
import fontkit from "@pdf-lib/fontkit";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import { sealConfidential, type ConfidentialData } from "../../lib/substitutions/confidential";
import {
  URGENT_POINTS,
  czynnoscLabel,
  type CzynnoscKey,
  type DziedzinaKey,
  type KtoryTerminKey,
  type OfertyDoKey,
  type PrzebiegKey,
  type RolaKey,
  type TypMiejscaKey,
} from "../../lib/substitutions/constants";
import { SUBSTITUTIONS_DIR } from "../../lib/substitutions/files";
import { displayName, resolveRole } from "../../lib/substitutions/people";
import { findPlace } from "../../lib/substitutions/places";
import {
  computeOffersDeadline,
  formatShort,
  formatTermin,
  shiftDay,
  warsawDay,
  warsawMinutesOfDay,
  warsawToUtc,
} from "../../lib/substitutions/time";

/**
 * Zastępstwa procesowe (/panel-eksperta/zastepstwa) — dane demonstracyjne, które
 * pokazują możliwie każdy wariant widoków: wszystkie statusy z perspektywy
 * zlecającego i zastępcy, giełdę (pasujące, niepasujące, niewidoczne dla roli),
 * zapytania imienne, aplikantów, oferty po wyborze, rezygnacji i odwołaniu,
 * raporty, problemy, oceny, rozliczenia z kilku miesięcy i pliki na dysku.
 *
 * Daty liczymy od chwili uruchomienia (dni robocze, czas polski), więc seed można
 * powtarzać — za każdym razem zastępuje wszystkie dane modułu świeżymi.
 * Dane są „ciche” dla schedulera: nie wyzwalają od razu przypomnień, zestawień
 * ani SMS-ów (przypomnienia oznaczone jako wysłane, zapytania bez „Pilne”).
 *
 * Konta: kancelarie z seedowania użytkowników + aplikanci i konto bez weryfikacji
 * zakładane tutaj (hasło jak u ekspertów: Ekspert123!).
 */

const PANEL = "/panel-eksperta/zastepstwa";
const HOUR = 3600_000;
const DAY = 24 * HOUR;
const MIN = 60_000;

// ---------------------------------------------------------------------------
// Konta
// ---------------------------------------------------------------------------

type Who = "K" | "W" | "AK" | "S" | "TK" | "ZM" | "BZ" | "JK" | "NW" | "ML" | "PN";

/** Kancelarie z seedowania użytkowników (prisma/seeds/users-and-firms.ts). */
const EXISTING: Record<Exclude<Who, "JK" | "NW" | "ML" | "PN">, string> = {
  K: "krystian@bpcoders.pl", // r.pr., Lublin, Biznes — główne konto demonstracyjne
  W: "adwokat.wisniewski@ps-dev.com.pl", // adw., Warszawa, Biznes
  AK: "radca.kowalczyk@ps-dev.com.pl", // r.pr., Kraków, Premium
  S: "prawopracy.szymanska@ps-dev.com.pl", // adw., Poznań, Standard
  TK: "techlaw.kaczmarek@ps-dev.com.pl", // r.pr., Warszawa, Premium
  ZM: "adwokat.mazur@ps-dev.com.pl", // adw., Lublin, Podstawowy
  BZ: "medycyna.zajac@ps-dev.com.pl", // r.pr., Kraków, Premium
};

interface NewAccount {
  key: Who;
  email: string;
  imie: string;
  nazwisko: string;
  nazwa: string;
  slug: string;
  miasto: string;
  adres: string;
  kod: string;
  wojewodztwo: string;
  aplikant?: { rodzaj: "ADWOKACKA" | "RADCOWSKA"; izba: string; miesiace: number };
  ora?: { miasto: string; wpis: string };
  zweryfikowana: boolean;
}

/**
 * Aplikanci (bez telefonu — kontakt tylko mailem) i adwokat czekający na weryfikację.
 * Data rozpoczęcia aplikacji liczona od dziś, więc „1. rok, jeszcze bez zastępstw” zostaje aktualny.
 */
const NEW_ACCOUNTS: NewAccount[] = [
  {
    key: "JK",
    email: "aplikantka.kaminska@ps-dev.com.pl",
    imie: "Julia",
    nazwisko: "Kamińska",
    nazwa: "Kancelaria Adwokacka adw. Marka Zielińskiego",
    slug: "aplikantka-julia-kaminska",
    miasto: "Warszawa",
    adres: "ul. Hoża 41/7",
    kod: "00-681",
    wojewodztwo: "Mazowieckie",
    aplikant: { rodzaj: "ADWOKACKA", izba: "Warszawa", miesiace: 20 },
    zweryfikowana: true,
  },
  {
    key: "NW",
    email: "aplikantka.wrobel@ps-dev.com.pl",
    imie: "Natalia",
    nazwisko: "Wróbel",
    nazwa: "Kancelaria Radców Prawnych Wróbel i Partnerzy",
    slug: "aplikantka-natalia-wrobel",
    miasto: "Lublin",
    adres: "ul. Narutowicza 12/4",
    kod: "20-004",
    wojewodztwo: "Lubelskie",
    aplikant: { rodzaj: "RADCOWSKA", izba: "Lublin", miesiace: 29 },
    zweryfikowana: true,
  },
  {
    key: "ML",
    email: "aplikant.lewandowski@ps-dev.com.pl",
    imie: "Mateusz",
    nazwisko: "Lewandowski",
    nazwa: "Kancelaria Adwokacka adw. Ewy Lewandowskiej",
    slug: "aplikant-mateusz-lewandowski",
    miasto: "Lublin",
    adres: "ul. Chopina 8/2",
    kod: "20-026",
    wojewodztwo: "Lubelskie",
    aplikant: { rodzaj: "ADWOKACKA", izba: "Lublin", miesiace: 3 },
    zweryfikowana: true,
  },
  {
    key: "PN",
    email: "adwokat.nowicki@ps-dev.com.pl",
    imie: "Paweł",
    nazwisko: "Nowicki",
    nazwa: "Kancelaria Adwokacka Adw. Paweł Nowicki",
    slug: "adwokat-pawel-nowicki",
    miasto: "Gdańsk",
    adres: "ul. Długa 21",
    kod: "80-827",
    wojewodztwo: "Pomorskie",
    ora: { miasto: "Gdańsk", wpis: "GDA/Adw/2207" },
    zweryfikowana: false,
  },
];

const CITY_COORDS: Record<string, [number, number]> = {
  Lublin: [51.2465, 22.5684],
  Świdnik: [51.2197, 22.6966],
  Puławy: [51.4167, 21.969],
  Zamość: [50.7231, 23.252],
  Chełm: [51.1431, 23.4716],
  Warszawa: [52.2297, 21.0122],
  Kraków: [50.0647, 19.945],
  Poznań: [52.4064, 16.9252],
  Gdańsk: [54.352, 18.6466],
};

/** Typowy czas reakcji na nowe zlecenie (minuty) — z niego wychodzi „odpowiada w ~X” na kartach. */
const REACTION: Record<Who, number> = { K: 22, W: 9, AK: 70, S: 190, TK: 250, ZM: 27, BZ: 41, JK: 14, NW: 95, ML: 30, PN: 30 };

const FIRM_SELECT = {
  id: true,
  userId: true,
  nazwa: true,
  aktywna: true,
  zweryfikowana: true,
  oraStatus: true,
  oraWpis: true,
  oraMiasto: true,
  oirpStatus: true,
  oirpWpis: true,
  oirpMiasto: true,
  aplikantRodzaj: true,
  aplikantIzba: true,
  aplikacjaOd: true,
  user: { select: { email: true, imie: true, nazwisko: true, name: true, miasto: true } },
} satisfies Prisma.LawFirmSelect;

type Firm = Prisma.LawFirmGetPayload<{ select: typeof FIRM_SELECT }>;

// ---------------------------------------------------------------------------
// Czas
// ---------------------------------------------------------------------------

/** Dni wolne od pracy o stałej dacie (MM-DD) — w te dni sądy nie wyznaczają terminów. */
const HOLIDAYS = ["01-01", "01-06", "05-01", "05-03", "08-15", "11-01", "11-11", "12-24", "12-25", "12-26"];

function isWorkday(day: string): boolean {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return weekday !== 0 && weekday !== 6 && !HOLIDAYS.includes(day.slice(5));
}

function monthsBefore(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

const plus = (date: Date, ms: number) => new Date(date.getTime() + ms);
const minDate = (a: Date, b: Date) => (a < b ? a : b);

function makeClock(now: Date) {
  const today = warsawDay(now);
  /** n-ty dzień roboczy od dziś: 0 — dziś (albo najbliższy roboczy), 1 — następny, -1 — poprzedni. */
  const workday = (n: number): string => {
    let day = today;
    if (n >= 0) {
      while (!isWorkday(day)) day = shiftDay(day, 1);
      for (let i = 0; i < n; i++) {
        day = shiftDay(day, 1);
        while (!isWorkday(day)) day = shiftDay(day, 1);
      }
    } else {
      for (let i = 0; i < -n; i++) {
        day = shiftDay(day, -1);
        while (!isWorkday(day)) day = shiftDay(day, -1);
      }
    }
    return day;
  };
  const at = (n: number, time: string) => warsawToUtc(workday(n), time);
  const ago = (hours: number) => new Date(now.getTime() - hours * HOUR);
  const later = (hours: number) => new Date(now.getTime() + hours * HOUR);
  /** Termin, który już się odbył, a raportu jeszcze nie ma: dziś rano albo poprzedni dzień roboczy. */
  const pastSlot = (time: string, fallback: string) =>
    isWorkday(today) && warsawMinutesOfDay(now) >= 12 * 60 ? warsawToUtc(today, time) : at(-1, fallback);
  /** Chwila sprzed `hours` godzin, ale w bieżącym miesiącu — zamknięcia „bez terminu” trafiają do rozliczeń tego miesiąca. */
  const monthStart = warsawToUtc(`${today.slice(0, 7)}-01`);
  const thisMonthAgo = (hours: number) => {
    const floor = plus(monthStart, 10 * MIN);
    const value = ago(hours) < floor ? floor : ago(hours);
    return value > now ? plus(now, -MIN) : value;
  };
  /** Raport po czynności: kilka godzin po terminie, ale nie dawniej niż `maxAge` h — automatyczne zamknięcie jest po 48 h. */
  const reportAt = (termin: Date, hoursAfter: number, maxAgeHours: number) => {
    const value = plus(termin, hoursAfter * HOUR);
    const floor = ago(maxAgeHours);
    const ceiling = ago(0.5);
    return value < floor ? floor : value > ceiling ? ceiling : value;
  };
  return { now, today, workday, at, ago, later, pastSlot, thisMonthAgo, reportAt };
}

type Clock = ReturnType<typeof makeClock>;

// ---------------------------------------------------------------------------
// Specyfikacje zleceń
// ---------------------------------------------------------------------------

type OrderFields = Omit<
  Prisma.SubstitutionUncheckedCreateInput,
  "id" | "numer" | "zlecajacyId" | "zastepcaId" | "zapytanieDoId" | "status" | "createdAt" | "updatedAt" | "poufne" | "pliki" | "oferty"
>;

interface OfferSpec {
  who: Who;
  stawka: number;
  status: SubstitutionOfferStatus;
  at: Date;
  notatka?: string;
  fakturaVat?: boolean;
  rezygnacjaAt?: Date;
  rezygnacjaPozno?: boolean;
}

type FileSource =
  | { pdf: { title: string; lines: string[]; pages?: number; images?: string[] } }
  | { doc: { title: string; paragraphs: string[] } }
  | { copy: string };

interface FileSpec {
  rodzaj: "DOKUMENT" | "PELNOMOCNICTWO" | "RAPORT";
  nazwa: string;
  who: Who;
  at: Date;
  source: FileSource;
}

interface OrderSpec {
  /** Klucz do powiadomień (link i numer zlecenia). */
  ref?: string;
  by: Who;
  status: SubstitutionStatus;
  /** Chwila nadania numeru (publikacja albo wysłanie zapytania); null — szkic bez numeru. */
  numberedAt: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  fields: OrderFields;
  zastepca?: Who;
  zapytanieDo?: Who;
  offers?: OfferSpec[];
  poufne?: ConfidentialData;
  files?: FileSpec[];
}

interface PlaceFields {
  typMiejsca: TypMiejscaKey;
  miejsce: string;
  wydzial: string | null;
  miasto: string | null;
  wojewodztwo: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Miejsce z list w kreatorze — miejscowość i województwo jak przy wyborze podpowiedzi. */
function place(typ: TypMiejscaKey, nazwa: string, wydzial?: string): PlaceFields {
  const found = findPlace(typ, nazwa);
  if (!found) throw new Error(`[seed zastępstw] Nie ma „${nazwa}” na liście miejsc (${typ})`);
  const coords = typ === "ZDALNIE" ? null : CITY_COORDS[found.miasto] ?? null;
  return {
    typMiejsca: typ,
    miejsce: found.nazwa,
    wydzial: wydzial ?? null,
    miasto: found.miasto || null,
    wojewodztwo: found.wojewodztwo || null,
    latitude: coords?.[0] ?? null,
    longitude: coords?.[1] ?? null,
  };
}

/** Miejsce spoza list — wpisane ręcznie (nazwa i miejscowość). */
function customPlace(typ: TypMiejscaKey, nazwa: string, miasto: string, wojewodztwo: string, wydzial?: string): PlaceFields {
  const coords = CITY_COORDS[miasto] ?? null;
  return { typMiejsca: typ, miejsce: nazwa, wydzial: wydzial ?? null, miasto, wojewodztwo, latitude: coords?.[0] ?? null, longitude: coords?.[1] ?? null };
}

type Kogo = "ADW" | "RADCA" | "APL";

interface PublicInput {
  tytul: string;
  czynnosc: CzynnoscKey;
  dziedzina: DziedzinaKey;
  rola: RolaKey;
  ktory?: KtoryTerminKey;
  opis?: string;
  place: PlaceFields;
  termin: Date | null;
  godzina?: boolean;
  doUstalenia?: boolean;
  ofertyDoTryb?: OfertyDoKey;
  kogo?: Kogo[];
  stawka: number | null;
  vat?: boolean;
  tryb?: "WYBIERAM" | "PIERWSZY";
  pilne?: boolean;
}

function publicFields(p: PublicInput): OrderFields {
  const kogo = p.kogo ?? ["ADW", "RADCA"];
  return {
    tytul: p.tytul,
    czynnosc: p.czynnosc,
    dziedzina: p.dziedzina,
    rolaZastepcy: p.rola,
    ktoryTermin: p.ktory ?? "PIERWSZY",
    opis: p.opis ?? null,
    ...p.place,
    termin: p.doUstalenia ? null : p.termin,
    terminMaGodzine: p.godzina ?? true,
    terminDoUstalenia: p.doUstalenia ?? false,
    ofertyDoTryb: p.ofertyDoTryb ?? "DZIEN_PRZED",
    dlaAdwokatow: kogo.includes("ADW"),
    dlaRadcow: kogo.includes("RADCA"),
    dlaAplikantow: kogo.includes("APL"),
    stawka: p.stawka,
    fakturaVat: p.vat ?? true,
    trybWyboru: p.tryb ?? "WYBIERAM",
    pilne: p.pilne ?? false,
    pilnePunkty: p.pilne ? URGENT_POINTS : null,
  };
}

/** Termin ofert dokładnie tak, jak liczy go publikacja. */
function offersDeadline(fields: OrderFields, publishedAt: Date): Date {
  return computeOffersDeadline(
    {
      termin: (fields.termin as Date | null) ?? null,
      terminMaGodzine: fields.terminMaGodzine ?? true,
      terminDoUstalenia: fields.terminDoUstalenia ?? false,
      ofertyDoTryb: fields.ofertyDoTryb ?? "DZIEN_PRZED",
    },
    publishedAt
  );
}

const offer = (who: Who, stawka: number, status: SubstitutionOfferStatus, at: Date, extra: Partial<OfferSpec> = {}): OfferSpec => ({
  who,
  stawka,
  status,
  at,
  fakturaVat: extra.fakturaVat ?? !["JK", "NW", "ML"].includes(who),
  ...extra,
});

/** Chwila złożenia oferty: publikacja + typowa reakcja danej osoby (+ przesunięcie). */
const reactAt = (published: Date, who: Who, extraMin = 0) => plus(published, (REACTION[who] + extraMin) * MIN);

// ---------------------------------------------------------------------------
// Pliki
// ---------------------------------------------------------------------------

const pdfDoc = (title: string, lines: string[], extra: { pages?: number; images?: string[] } = {}): FileSource => ({
  pdf: { title, lines, ...extra },
});

const DEMO_LINE = "Dokument przykładowy — dane demonstracyjne modułu zastępstw procesowych ProstaSprawa.";

function wrapText(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

let fontBytes: Buffer | null = null;

async function renderPdf(source: { title: string; lines: string[]; pages?: number; images?: string[] }): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  fontBytes ??= await readFile(path.join(process.cwd(), "assets", "fonts", "DejaVuSans.ttf"));
  const font = await doc.embedFont(fontBytes, { subset: true });
  doc.setTitle(source.title);
  doc.setProducer("ProstaSprawa — seed zastępstw procesowych");

  const pages = source.pages ?? 1;
  for (let index = 0; index < pages; index++) {
    const page = doc.addPage([595.28, 841.89]);
    let y = 780;
    page.drawText(source.title, { x: 56, y, size: 16, font, color: rgb(0.24, 0.22, 0.16) });
    y -= 22;
    page.drawText(`${DEMO_LINE} Strona ${index + 1} z ${pages}.`, { x: 56, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    y -= 34;
    for (const line of source.lines) {
      for (const chunk of wrapText(line, font, 11, 483)) {
        page.drawText(chunk, { x: 56, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 16;
      }
      y -= 8;
    }
  }
  for (const image of source.images ?? []) {
    const file = path.join(process.cwd(), image);
    if (!existsSync(file)) continue;
    const bytes = await readFile(file);
    const embedded = image.endsWith(".png") ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const scale = Math.min(483 / embedded.width, 640 / embedded.height, 1);
    const page = doc.addPage([595.28, 841.89]);
    page.drawText(`Zdjęcie: ${path.basename(image)}`, { x: 56, y: 790, size: 10, font });
    page.drawImage(embedded, { x: 56, y: 770 - embedded.height * scale, width: embedded.width * scale, height: embedded.height * scale });
  }
  return Buffer.from(await doc.save());
}

/** Dokument Worda w HTML (.doc) — tak samo jak wzór pełnomocnictwa generowany przez moduł. */
function renderDoc(source: { title: string; paragraphs: string[] }): Buffer {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${source.title}</title>
<style>body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; } h1 { font-size: 14pt; }</style></head>
<body><h1>${source.title}</h1>${source.paragraphs.map((p) => `<p>${p}</p>`).join("")}<p><i>${DEMO_LINE}</i></p></body></html>`;
  return Buffer.from(html, "utf8");
}

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

async function materializeFile(orderId: string, file: FileSpec): Promise<{ sciezka: string; rozmiar: number; mime: string } | null> {
  let buffer: Buffer;
  let ext: string;
  if ("pdf" in file.source) {
    buffer = await renderPdf(file.source.pdf);
    ext = "pdf";
  } else if ("doc" in file.source) {
    buffer = renderDoc(file.source.doc);
    ext = "doc";
  } else {
    const from = path.join(process.cwd(), file.source.copy);
    if (!existsSync(from)) return null;
    buffer = await readFile(from);
    ext = path.extname(from).slice(1).toLowerCase();
  }
  const dir = path.join(SUBSTITUTIONS_DIR, orderId);
  await mkdir(dir, { recursive: true });
  const stored = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, stored), buffer);
  return { sciezka: `${orderId}/${stored}`, rozmiar: buffer.length, mime: MIME[ext] ?? "application/octet-stream" };
}

// ---------------------------------------------------------------------------
// Czyszczenie
// ---------------------------------------------------------------------------

/** Usuwa wszystkie dane modułu: zlecenia (z ofertami, danymi poufnymi i plikami), ustawienia i powiadomienia. */
export async function clearSubstitutions(prisma: PrismaClient) {
  await prisma.substitutionFile.deleteMany();
  await prisma.substitutionOffer.deleteMany();
  await prisma.substitutionConfidential.deleteMany();
  await prisma.substitution.deleteMany();
  await prisma.substitutionSettings.deleteMany();
  await prisma.notification.deleteMany({ where: { typ: "ZASTEPSTWO" } });
  // Katalog zawiera wyłącznie pliki zleceń — po usunięciu zleceń są osierocone
  await rm(SUBSTITUTIONS_DIR, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Konta
// ---------------------------------------------------------------------------

async function ensureNewAccounts(prisma: PrismaClient, now: Date) {
  const password = await bcrypt.hash("Ekspert123!", 10);
  const voivodeships = await prisma.voivodeship.findMany({ select: { id: true, nazwa: true } });

  for (const account of NEW_ACCOUNTS) {
    const coords = CITY_COORDS[account.miasto] ?? null;
    const voivodeshipId = voivodeships.find((v) => v.nazwa.toLowerCase() === account.wojewodztwo.toLowerCase())?.id ?? null;
    const firmData = {
      nazwa: account.nazwa,
      aktywna: true,
      zweryfikowana: account.zweryfikowana,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      aplikantRodzaj: account.aplikant?.rodzaj ?? null,
      aplikantIzba: account.aplikant?.izba ?? null,
      aplikacjaOd: account.aplikant ? monthsBefore(now, account.aplikant.miesiace) : null,
      oraMiasto: account.ora?.miasto ?? null,
      oraWpis: account.ora?.wpis ?? null,
      oraStatus: !!account.ora,
    };
    const userData = {
      name: `${account.imie} ${account.nazwisko}`,
      imie: account.imie,
      nazwisko: account.nazwisko,
      adres: account.adres,
      kodPocztowy: account.kod,
      miasto: account.miasto,
      voivodeshipId,
      latitude: coords?.[0] ?? null,
      longitude: coords?.[1] ?? null,
    };

    const existing = await prisma.user.findUnique({ where: { email: account.email }, select: { id: true, lawFirm: { select: { id: true } } } });
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: userData });
      if (existing.lawFirm) {
        await prisma.lawFirm.update({ where: { id: existing.lawFirm.id }, data: firmData });
      } else {
        await prisma.lawFirm.create({ data: { ...firmData, userId: existing.id, slug: account.slug } });
      }
      continue;
    }

    await prisma.user.create({
      data: {
        ...userData,
        email: account.email,
        password,
        role: UserRole.LAW_FIRM,
        status: UserStatus.ACTIVE,
        emailVerified: now,
        notificationSettings: { create: { isConfigured: true } },
        lawFirm: {
          create: {
            ...firmData,
            slug: account.slug,
            logo: "/images/defailt-user.jpg",
            opis: account.aplikant
              ? `Aplikacja ${account.aplikant.rodzaj === "ADWOKACKA" ? "adwokacka" : "radcowska"} przy izbie w mieście ${account.aplikant.izba}. Zastępstwa na upoważnienie patrona i innych pełnomocników.`
              : "Kancelaria adwokacka — konto czeka na weryfikację wpisu ORA.",
          },
        },
      },
    });
  }
}

async function loadFirms(prisma: PrismaClient): Promise<Record<Who, Firm>> {
  const emails: Record<Who, string> = {
    ...EXISTING,
    ...Object.fromEntries(NEW_ACCOUNTS.map((a) => [a.key, a.email])),
  } as Record<Who, string>;
  const rows = await prisma.lawFirm.findMany({ where: { user: { email: { in: Object.values(emails) } } }, select: FIRM_SELECT });

  const missing = (Object.keys(emails) as Who[]).filter((key) => !rows.some((r) => r.user.email === emails[key]));
  if (missing.length > 0) {
    throw new Error(
      `[seed zastępstw] Brak kont: ${missing.map((k) => emails[k]).join(", ")}. Najpierw uruchom pełny seed (bun run db:seed).`
    );
  }
  const firms = Object.fromEntries((Object.keys(emails) as Who[]).map((key) => [key, rows.find((r) => r.user.email === emails[key])!])) as Record<Who, Firm>;

  for (const key of Object.keys(EXISTING) as Who[]) {
    const firm = firms[key];
    if (!firm.aktywna || !firm.zweryfikowana || !resolveRole(firm)) {
      console.warn(`⚠️  ${firm.user.email} nie ma dostępu do zastępstw (aktywna/zweryfikowana/wpis ORA lub OIRP) — jego dane będą niewidoczne.`);
    }
  }
  return firms;
}

// ---------------------------------------------------------------------------
// Ustawienia zastępców
// ---------------------------------------------------------------------------

function settingsFor(c: Clock): Partial<Record<Who, Omit<Prisma.SubstitutionSettingsUncheckedCreateInput, "lawFirmId">>> {
  const year = Number(c.today.slice(0, 4));
  const christmasYear = c.today > `${year}-12-23` ? year + 1 : year;
  const json = (value: unknown) => JSON.stringify(value);
  const [lublinLat, lublinLng] = CITY_COORDS.Lublin;
  const [warsawLat, warsawLng] = CITY_COORDS.Warszawa;

  return {
    // Miasto + promień, konkretne sądy poza promieniem, bez spraw karnych, minimalna stawka i dwa urlopy
    K: {
      przyjmuje: true,
      miasto: "Lublin",
      latitude: lublinLat,
      longitude: lublinLng,
      promienKm: 60,
      sady: json(["Sąd Okręgowy w Zamościu", "Wojewódzki Sąd Administracyjny w Lublinie"]),
      zdalne: true,
      czynnosci: null,
      dziedziny: json(["CYWILNA", "RODZINNA", "GOSPODARCZA", "PRACY", "KIO", "ADMINISTRACYJNA", "INNA"]),
      minStawka: 200,
      niedostepnosc: json([
        { od: c.workday(14), do: c.workday(18) },
        { od: `${christmasYear}-12-24`, do: `${christmasYear + 1}-01-02` },
      ]),
      emailOdRazu: true,
      zestawienieDzienne: false,
      smsPilne: true,
      przypomnienie: true,
    },
    // Poranne zestawienie zamiast maili od razu, tylko wybrane czynności
    W: {
      przyjmuje: true,
      miasto: "Warszawa",
      latitude: warsawLat,
      longitude: warsawLng,
      promienKm: 30,
      zdalne: true,
      czynnosci: json(["ROZPRAWA", "POSIEDZENIE", "PRZESLUCHANIE", "OGLOSZENIE_WYROKU"]),
      minStawka: 250,
      emailOdRazu: false,
      zestawienieDzienne: true,
      ostatnieZestawienieAt: c.now,
      smsPilne: true,
      przypomnienie: true,
    },
    // Wstrzymane przyjmowanie zastępstw
    AK: { przyjmuje: false, miasto: "Kraków", latitude: CITY_COORDS.Kraków[0], longitude: CITY_COORDS.Kraków[1], promienKm: 25, zdalne: false },
    // Tylko wybrane sądy (bez własnego miasta — liczymy od adresu z profilu), bez zdalnych i przypomnień
    TK: {
      przyjmuje: true,
      promienKm: 15,
      sady: json(["Krajowa Izba Odwoławcza", "Sąd Okręgowy w Warszawie", "Sąd Apelacyjny w Warszawie"]),
      zdalne: false,
      dziedziny: json(["GOSPODARCZA", "KIO", "CYWILNA", "ADMINISTRACYJNA"]),
      minStawka: 400,
      przypomnienie: false,
    },
    ZM: { przyjmuje: true, miasto: "Lublin", latitude: lublinLat, longitude: lublinLng, promienKm: 100, zdalne: true },
    JK: {
      przyjmuje: true,
      miasto: "Warszawa",
      latitude: warsawLat,
      longitude: warsawLng,
      promienKm: 40,
      zdalne: true,
      czynnosci: json(["ROZPRAWA", "POSIEDZENIE", "PRZEGLADANIE_AKT", "FOTOKOPIE_AKT"]),
      minStawka: 100,
    },
    NW: { przyjmuje: true, miasto: "Lublin", latitude: lublinLat, longitude: lublinLng, promienKm: 50, zdalne: false },
    ML: { przyjmuje: true, miasto: "Lublin", latitude: lublinLat, longitude: lublinLng, promienKm: 30, zdalne: true },
    // S, BZ i PN bez zapisanych ustawień — panel pokazuje zachętę do ich uzupełnienia
  };
}

// ---------------------------------------------------------------------------
// Historia: zamknięte zlecenia z poprzednich tygodni (statystyki, oceny, rozliczenia)
// ---------------------------------------------------------------------------

interface HistoryItem {
  by: Who;
  to: Who;
  tytul: string;
  place: PlaceFields;
  czynnosc: CzynnoscKey;
  dziedzina: DziedzinaKey;
  rola: RolaKey;
  dzien: number; // dzień roboczy wstecz
  godzina: string | null; // null — termin bez godziny
  stawka: number;
  ocena: number | null;
  komentarz?: string;
  faktura: SubstitutionInvoiceStatus;
  przebieg: PrzebiegKey;
  notatka: string;
  kolejnyDni?: number;
  inni?: [Who, number][];
  kogo?: Kogo[];
  auto?: boolean;
  archiwum?: boolean;
  /** Wybrana wcześniej osoba zrezygnowała na mniej niż 24 h przed terminem. */
  poznaRezygnacja?: Who;
  pilne?: boolean;
}

function historyOrder(c: Clock, h: HistoryItem, index: number): OrderSpec {
  const termin = c.at(h.dzien, h.godzina ?? "00:00");
  const start = h.godzina ? termin : plus(termin, 9 * HOUR);
  const createdAt = plus(termin, -(3 + (index % 6)) * DAY - 3 * HOUR);
  const opublikowanoAt = plus(createdAt, 18 * MIN);
  const fields = publicFields({
    tytul: h.tytul,
    czynnosc: h.czynnosc,
    dziedzina: h.dziedzina,
    rola: h.rola,
    ktory: index % 3 === 0 ? "KOLEJNY" : "PIERWSZY",
    place: h.place,
    termin,
    godzina: !!h.godzina,
    kogo: h.kogo,
    stawka: h.stawka,
    pilne: h.pilne,
  });
  fields.opublikowanoAt = opublikowanoAt;
  fields.ofertyDo = offersDeadline(fields, opublikowanoAt);

  const offers: OfferSpec[] = [offer(h.to, h.stawka, "WYBRANA", reactAt(opublikowanoAt, h.to))];
  for (const [who, stawka] of h.inni ?? []) offers.push(offer(who, stawka, "ODRZUCONA", reactAt(opublikowanoAt, who, 7)));

  let wybranoAt = plus(offers.reduce((latest, o) => (o.at > latest ? o.at : latest), opublikowanoAt), 2 * HOUR);
  if (h.poznaRezygnacja) {
    const rezygnacjaAt = plus(start, -10 * HOUR);
    offers.push(offer(h.poznaRezygnacja, h.stawka, "REZYGNACJA", reactAt(opublikowanoAt, h.poznaRezygnacja, 3), { rezygnacjaAt, rezygnacjaPozno: true }));
    wybranoAt = plus(rezygnacjaAt, HOUR);
  }
  const potwierdzonoAt = plus(wybranoAt, 35 * MIN);
  const wykonanoAt = plus(start, 150 * MIN);
  const zamknietoAt = h.auto ? plus(wykonanoAt, 48 * HOUR + 4 * MIN) : plus(wykonanoAt, (3 + (index % 20)) * HOUR);
  const kolejny = h.kolejnyDni ? warsawToUtc(shiftDay(warsawDay(termin), h.kolejnyDni), "10:00") : null;

  return {
    by: h.by,
    status: "ZAMKNIETE",
    numberedAt: opublikowanoAt,
    createdAt,
    updatedAt: zamknietoAt,
    zastepca: h.to,
    offers,
    fields: {
      ...fields,
      wybranoAt,
      potwierdzenieDo: minDate(plus(wybranoAt, 24 * HOUR), start),
      potwierdzonoAt,
      przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
      naMiejscuAt: index % 2 === 0 && h.godzina ? plus(termin, -20 * MIN) : null,
      wykonanoAt,
      zamknietoAt,
      zamknietoAutomatycznie: !!h.auto,
      raportPrzebieg: h.przebieg,
      raportKolejnyTermin: kolejny,
      raportNotatka: h.notatka,
      ocena: h.ocena,
      ocenaKomentarz: h.komentarz ?? null,
      stawkaUzgodniona: h.stawka,
      fakturaStatus: h.faktura,
      zarchiwizowane: !!h.archiwum,
    },
  };
}

function history(): HistoryItem[] {
  const SO_LUBLIN = place("SAD", "Sąd Okręgowy w Lublinie", "I Wydział Cywilny, sala 214");
  const SR_LZ = place("SAD", "Sąd Rejonowy Lublin-Zachód w Lublinie", "I Wydział Cywilny");
  const SO_WAW = place("SAD", "Sąd Okręgowy w Warszawie", "XX Wydział Gospodarczy");
  const done = "Rozprawa odbyła się zgodnie z planem. Szczegóły w notatce przesłanej mailem.";

  return [
    // K jako zlecający (zaufani zastępcy w kreatorze, „Zlecone przeze mnie” w rozliczeniach)
    { by: "K", to: "ZM", tytul: "Rozprawa o zapłatę z umowy o roboty budowlane", place: SO_LUBLIN, czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -12, godzina: "10:00", stawka: 300, ocena: 5, komentarz: "Rzetelny raport, wszystko zgodnie z instrukcją.", faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: "Przesłuchano dwóch świadków powoda. Sąd zobowiązał pozwanego do złożenia dokumentów w 14 dni.", kolejnyDni: 35 },
    { by: "K", to: "ZM", tytul: "Posiedzenie w sprawie o kontakty z dzieckiem", place: SR_LZ, czynnosc: "POSIEDZENIE", dziedzina: "RODZINNA", rola: "PELNOMOCNIK_UCZESTNIKA", dzien: -31, godzina: "11:30", stawka: 250, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "K", to: "NW", tytul: "Przeglądanie akt i notatka z akt", place: SR_LZ, czynnosc: "PRZEGLADANIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", dzien: -24, godzina: null, stawka: 150, ocena: 5, komentarz: "Szybko i dokładnie — skany w PDF tego samego dnia.", faktura: "OPLACONA", przebieg: "INNE", notatka: "Akta przejrzane, skany najważniejszych kart wysłane mailem.", kogo: ["ADW", "RADCA", "APL"] },
    { by: "K", to: "W", tytul: "Rozprawa gospodarcza — spór o kary umowne", place: SO_WAW, czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", dzien: -40, godzina: "12:00", stawka: 450, ocena: 5, faktura: "OPLACONA", przebieg: "ODROCZONA", notatka: "Sąd odroczył rozprawę z powodu niestawiennictwa świadka.", kolejnyDni: 42, inni: [["TK", 500]] },
    { by: "K", to: "TK", tytul: "Rozprawa przed KIO — odwołanie wykonawcy", place: place("ZDALNIE", "Krajowa Izba Odwoławcza, rozprawa zdalna"), czynnosc: "ROZPRAWA", dziedzina: "KIO", rola: "PELNOMOCNIK_ODWOLUJACEGO", dzien: -55, godzina: "10:00", stawka: 600, ocena: 3, komentarz: "Raport bardzo skrótowy, musiałem dopytywać o szczegóły.", faktura: "OPLACONA", przebieg: "ZAMKNIETA_WYROK", notatka: "Izba oddaliła odwołanie.", archiwum: true },
    // K jako zastępca (statystyki K i „Współpracowaliście już…” w zapytaniu od ZM)
    { by: "W", to: "K", tytul: "Rozprawa o zachowek", place: SO_LUBLIN, czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -15, godzina: "09:30", stawka: 350, ocena: 5, komentarz: "Świetny kontakt, polecam.", faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done, inni: [["ZM", 330]] },
    { by: "ZM", to: "K", tytul: "Ogłoszenie wyroku w sprawie o zapłatę", place: SR_LZ, czynnosc: "OGLOSZENIE_WYROKU", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", dzien: -28, godzina: "14:00", stawka: 200, ocena: 4, faktura: "WYSTAWIONA", przebieg: "ZAMKNIETA_WYROK", notatka: "Powództwo oddalone w całości. Wniosek o uzasadnienie złożony na biurze podawczym." },
    { by: "ZM", to: "K", tytul: "Rozprawa z zakresu prawa pracy — wynagrodzenie", place: place("SAD", "Sąd Rejonowy w Puławach", "IV Wydział Pracy"), czynnosc: "ROZPRAWA", dziedzina: "PRACY", rola: "PELNOMOCNIK_POWODA", dzien: -47, godzina: "10:00", stawka: 300, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "AK", to: "K", tytul: "Rozprawa przed WSA — skarga na decyzję podatkową", place: place("SAD", "Wojewódzki Sąd Administracyjny w Lublinie", "Wydział I"), czynnosc: "ROZPRAWA", dziedzina: "ADMINISTRACYJNA", rola: "PELNOMOCNIK_UCZESTNIKA", dzien: -36, godzina: "11:00", stawka: 350, ocena: null, faktura: "OPLACONA", przebieg: "ZAMKNIETA_WYROK", notatka: "Wyrok uchylający decyzję organu." },
    { by: "TK", to: "K", tytul: "Rozprawa gospodarcza — dostawy oprogramowania", place: SO_LUBLIN, czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", dzien: -62, godzina: "10:30", stawka: 400, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    // W — doświadczony zastępca (dużo zastępstw, wysoka ocena)
    { by: "TK", to: "W", tytul: "Rozprawa apelacyjna w sprawie gospodarczej", place: place("SAD", "Sąd Apelacyjny w Warszawie", "VII Wydział Gospodarczy"), czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", dzien: -8, godzina: "11:00", stawka: 500, ocena: 5, faktura: "WYSTAWIONA", przebieg: "ZAMKNIETA_WYROK", notatka: "Sąd oddalił apelację pozwanego." },
    { by: "AK", to: "W", tytul: "Rozprawa o naruszenie dóbr osobistych", place: SO_WAW, czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -20, godzina: "09:00", stawka: 420, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "BZ", to: "W", tytul: "Obrona na rozprawie karnej", place: place("SAD", "Sąd Rejonowy dla Warszawy-Mokotowa w Warszawie", "III Wydział Karny"), czynnosc: "ROZPRAWA", dziedzina: "KARNA", rola: "OBRONCA", dzien: -33, godzina: "12:30", stawka: 380, ocena: 5, faktura: "OPLACONA", przebieg: "ODROCZONA", notatka: "Sprawa odroczona — biegły nie złożył opinii.", kolejnyDni: 28, kogo: ["ADW"] },
    { by: "S", to: "W", tytul: "Rozprawa w sprawie pracowniczej", place: SO_WAW, czynnosc: "ROZPRAWA", dziedzina: "PRACY", rola: "PELNOMOCNIK_POZWANEGO", dzien: -45, godzina: "10:00", stawka: 380, ocena: 4, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done, poznaRezygnacja: "TK" },
    { by: "TK", to: "W", tytul: "Rozprawa przed KIO w siedzibie Izby", place: place("ORGAN", "Krajowa Izba Odwoławcza"), czynnosc: "ROZPRAWA", dziedzina: "KIO", rola: "PELNOMOCNIK_ODWOLUJACEGO", dzien: -58, godzina: "13:00", stawka: 650, ocena: 5, faktura: "OPLACONA", przebieg: "ZAMKNIETA_WYROK", notatka: "Izba uwzględniła odwołanie.", pilne: true },
    { by: "AK", to: "W", tytul: "Przesłuchanie pokrzywdzonego w prokuraturze", place: place("PROKURATURA", "Prokuratura Rejonowa Warszawa-Mokotów w Warszawie"), czynnosc: "PRZESLUCHANIE", dziedzina: "KARNA", rola: "PELNOMOCNIK_POKRZYWDZONEGO", dzien: -70, godzina: "09:00", stawka: 300, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "BZ", to: "W", tytul: "Przesłuchanie podejrzanego na komendzie", place: place("POLICJA", "Komenda Rejonowa Policji Warszawa II"), czynnosc: "PRZESLUCHANIE", dziedzina: "KARNA", rola: "OBRONCA", dzien: -80, godzina: "15:00", stawka: 300, ocena: null, faktura: "OPLACONA", przebieg: "INNE", notatka: "Podejrzany skorzystał z prawa do odmowy składania wyjaśnień.", kogo: ["ADW"] },
    // Pozostali zastępcy — różne statystyki na kartach ofert
    { by: "BZ", to: "ZM", tytul: "Rozprawa o zadośćuczynienie", place: place("SAD", "Sąd Rejonowy Lublin-Wschód w Lublinie z siedzibą w Świdniku", "I Wydział Cywilny"), czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -19, godzina: "12:00", stawka: 250, ocena: 4, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "W", to: "ZM", tytul: "Rozprawa o eksmisję", place: SO_LUBLIN, czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -52, godzina: "09:00", stawka: 350, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "AK", to: "ZM", tytul: "Widzenie z osadzonym i wniosek o przerwę w karze", place: place("ZAKLAD_KARNY", "Areszt Śledczy w Lublinie"), czynnosc: "INNA", dziedzina: "KARNA_WYKONAWCZA", rola: "OBRONCA", dzien: -66, godzina: "10:00", stawka: 200, ocena: 5, faktura: "OPLACONA", przebieg: "INNE", notatka: "Rozmowa z osadzonym odbyta, wniosek podpisany i złożony." },
    { by: "BZ", to: "TK", tytul: "Rozprawa apelacyjna — błąd medyczny", place: place("SAD", "Sąd Apelacyjny w Warszawie", "I Wydział Cywilny"), czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -26, godzina: "11:30", stawka: 500, ocena: 4, faktura: "OPLACONA", przebieg: "ZAMKNIETA_WYROK", notatka: "Wyrok zmieniony na korzyść powoda." },
    { by: "AK", to: "BZ", tytul: "Rozprawa o odszkodowanie", place: place("SAD", "Sąd Rejonowy dla Krakowa-Krowodrzy w Krakowie", "I Wydział Cywilny"), czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -14, godzina: "10:00", stawka: 250, ocena: 5, faktura: "WYSTAWIONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "S", to: "BZ", tytul: "Rozprawa — świadczenia z ubezpieczenia", place: place("SAD", "Sąd Okręgowy w Krakowie", "II Wydział Cywilny"), czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -44, godzina: "09:30", stawka: 300, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "BZ", to: "AK", tytul: "Posiedzenie pojednawcze", place: place("SAD", "Sąd Okręgowy w Krakowie", "I Wydział Cywilny"), czynnosc: "POSIEDZENIE", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", dzien: -50, godzina: "12:00", stawka: 300, ocena: 5, faktura: "OPLACONA", przebieg: "ODBYLA_SIE", notatka: done },
    { by: "W", to: "JK", tytul: "Przeglądanie akt sprawy o zapłatę", place: place("SAD", "Sąd Rejonowy dla Warszawy-Mokotowa w Warszawie"), czynnosc: "PRZEGLADANIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", dzien: -10, godzina: null, stawka: 120, ocena: 5, faktura: "DO_WYSTAWIENIA", przebieg: "INNE", notatka: "Akta przejrzane, brak nowych pism od strony przeciwnej.", kogo: ["ADW", "RADCA", "APL"] },
    { by: "TK", to: "JK", tytul: "Fotokopie akt — spór o licencję", place: SO_WAW, czynnosc: "FOTOKOPIE_AKT", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", dzien: -30, godzina: null, stawka: 100, ocena: 4, faktura: "OPLACONA", przebieg: "INNE", notatka: "Wykonano 84 fotokopie, przesłane w jednym pliku PDF.", kogo: ["ADW", "RADCA", "APL"], auto: true },
  ];
}

// ---------------------------------------------------------------------------
// Bieżące zlecenia — każde pokazuje inny wariant widoku
// ---------------------------------------------------------------------------

function currentOrders(c: Clock): OrderSpec[] {
  const orders: OrderSpec[] = [];
  const add = (spec: OrderSpec) => orders.push(spec);

  const SO_LUBLIN = (wydzial?: string) => place("SAD", "Sąd Okręgowy w Lublinie", wydzial);
  const SR_LZ = (wydzial?: string) => place("SAD", "Sąd Rejonowy Lublin-Zachód w Lublinie", wydzial);
  const SR_SWIDNIK = place("SAD", "Sąd Rejonowy Lublin-Wschód w Lublinie z siedzibą w Świdniku", "II Wydział Karny");
  const SR_PULAWY = (wydzial?: string) => place("SAD", "Sąd Rejonowy w Puławach", wydzial);

  /** Opublikowane zlecenie: publikacja godzinę po utworzeniu, termin ofert jak przy publikacji. */
  const published = (fields: OrderFields, opublikowanoAt: Date) => {
    fields.opublikowanoAt = opublikowanoAt;
    fields.ofertyDo = offersDeadline(fields, opublikowanoAt);
    return fields;
  };

  // ==========================================================================
  // K (krystian@bpcoders.pl) jako zlecający — „Moje zlecenia”
  // ==========================================================================

  // Szkic prawie gotowy do publikacji
  add({
    by: "K",
    status: "SZKIC",
    numberedAt: null,
    createdAt: c.ago(26),
    updatedAt: c.ago(25),
    fields: publicFields({
      tytul: "Rozprawa o zapłatę za usługi transportowe",
      czynnosc: "ROZPRAWA",
      dziedzina: "GOSPODARCZA",
      rola: "PELNOMOCNIK_POWODA",
      place: SR_LZ("VIII Wydział Gospodarczy"),
      termin: c.at(6, "10:30"),
      stawka: 300,
      opis: "Pierwsza rozprawa po sprzeciwie od nakazu zapłaty. Wnioski dowodowe zgłoszone w pozwie.",
    }),
    poufne: { sygnatura: "VIII GC 512/26", strony: "", instrukcja: "" },
  });

  // Pusty szkic — „Szkic bez tytułu”
  add({ by: "K", status: "SZKIC", numberedAt: null, createdAt: c.ago(3), fields: { tytul: "" } });

  // Zapytanie do konkretnej osoby, czeka na odpowiedź (licznik)
  {
    const sentAt = c.ago(4);
    add({
      ref: "K_ZAPYTANIE",
      by: "K",
      status: "ZAPYTANIE",
      numberedAt: sentAt,
      createdAt: plus(sentAt, -12 * MIN),
      zapytanieDo: "ZM",
      fields: {
        ...publicFields({
          tytul: "Rozprawa rozwodowa — przesłuchanie stron",
          czynnosc: "ROZPRAWA",
          dziedzina: "RODZINNA",
          rola: "PELNOMOCNIK_POWODA",
          ktory: "KOLEJNY",
          place: SO_LUBLIN("VI Wydział Rodzinny, sala 12"),
          termin: c.at(3, "09:00"),
          stawka: 350,
        }),
        zapytanieWazneDo: c.later(9),
      },
      poufne: { sygnatura: "VI RC 233/26", strony: "Powódka: Ewa M. · Pozwany: Tomasz M.", instrukcja: "Przesłuchanie stron. Wnoszę o zabezpieczenie kontaktów — wniosek w aktach (k. 45)." },
    });
  }

  // Na giełdzie po zapytaniu bez odpowiedzi, jeszcze bez ofert, „czekam na propozycje”
  {
    const sentAt = c.ago(15);
    const fields = publicFields({
      tytul: "Posiedzenie wykonawcze — wniosek o odroczenie",
      czynnosc: "POSIEDZENIE",
      dziedzina: "KARNA_WYKONAWCZA",
      rola: "OBRONCA",
      ktory: "NIE_DOTYCZY",
      place: SR_PULAWY("II Wydział Karny"),
      termin: c.at(5, "11:00"),
      stawka: null,
      kogo: ["ADW", "RADCA", "APL"],
    });
    add({
      by: "K",
      status: "OPUBLIKOWANE",
      numberedAt: sentAt,
      createdAt: plus(sentAt, -25 * MIN),
      zapytanieDo: "ZM",
      fields: { ...published(fields, plus(sentAt, 13 * HOUR)), zapytanieWazneDo: plus(sentAt, 13 * HOUR), zapytanieOdpowiedz: "BRAK_ODPOWIEDZI" },
    });
  }

  // Pilne, cztery oferty (różne statystyki, aplikantka, notatki) + oferta wycofana; dane poufne i pliki przed wyborem
  {
    const pub = c.ago(5);
    add({
      ref: "K_OFERTY",
      by: "K",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -40 * MIN),
      fields: published(
        publicFields({
          tytul: "Rozprawa apelacyjna — odszkodowanie za szkodę w uprawach",
          czynnosc: "ROZPRAWA",
          dziedzina: "CYWILNA",
          rola: "PELNOMOCNIK_POWODA",
          ktory: "KOLEJNY",
          opis: "Apelacja pozwanego od wyroku zasądzającego odszkodowanie.\nNa rozprawie możliwe pytania o opinię biegłego — opinia i odpowiedź na apelację w aktach.\nWystarczy podtrzymać stanowisko z odpowiedzi na apelację.",
          place: place("SAD", "Sąd Apelacyjny w Lublinie", "I Wydział Cywilny, sala 4"),
          termin: c.at(2, "12:00"),
          ofertyDoTryb: "DO_TERMINU",
          kogo: ["ADW", "RADCA", "APL"],
          stawka: 400,
          pilne: true,
        }),
        pub
      ),
      offers: [
        offer("W", 400, "OCZEKUJE", reactAt(pub, "W"), { notatka: "Byłem w tej sali wielokrotnie, znam skład orzekający." }),
        offer("ZM", 380, "OCZEKUJE", reactAt(pub, "ZM"), { notatka: "Znam sprawę z mediów branżowych, będę 30 minut wcześniej." }),
        offer("NW", 250, "OCZEKUJE", reactAt(pub, "NW"), { notatka: "Aplikantka 3. roku, występuję na upoważnienie. Bez faktury." }),
        offer("TK", 450, "OCZEKUJE", reactAt(pub, "TK", -60), { fakturaVat: true }),
        offer("BZ", 390, "WYCOFANA", reactAt(pub, "BZ")),
      ],
      poufne: {
        sygnatura: "I ACa 455/26",
        strony: "Powód: Gospodarstwo Rolne Jan W. · Pozwany: Agro-Lux sp. z o.o.",
        instrukcja: "1. Podtrzymać stanowisko z odpowiedzi na apelację.\n2. Wnieść o oddalenie apelacji i zasądzenie kosztów według norm.\n3. Nie zgadzać się na ugodę poniżej 80% zasądzonej kwoty.",
      },
      files: [
        { rodzaj: "DOKUMENT", nazwa: "Apelacja pozwanego — kopia.pdf", who: "K", at: plus(pub, -30 * MIN), source: pdfDoc("Apelacja pozwanego (kopia)", ["Sygn. akt I ACa 455/26.", "Pozwany zaskarża wyrok w całości, zarzucając błędną ocenę opinii biegłego i naruszenie art. 233 § 1 k.p.c.", "Wnosi o zmianę wyroku i oddalenie powództwa."], { pages: 3 }) },
        { rodzaj: "DOKUMENT", nazwa: "Dokumentacja zdjęciowa szkody.pdf", who: "K", at: plus(pub, -28 * MIN), source: pdfDoc("Dokumentacja zdjęciowa szkody", ["Zdjęcia wykonane przez rzeczoznawcę w dniu oględzin."], { images: ["public/images/lady-justice-banner.png", "public/images/security-lock.png", "public/images/lawyers_meeting.png"] }) },
      ],
    });
  }

  // Termin ofert minął (2 h od publikacji), ale można jeszcze wybrać z listy; rozprawa zdalna
  {
    const pub = c.ago(6);
    add({
      by: "K",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      fields: published(
        publicFields({
          tytul: "E-rozprawa w sprawie o podział majątku",
          czynnosc: "ROZPRAWA",
          dziedzina: "RODZINNA",
          rola: "PELNOMOCNIK_UCZESTNIKA",
          place: place("ZDALNIE", "Sąd Okręgowy w Lublinie, e-rozprawa"),
          termin: c.at(4, "13:30"),
          ofertyDoTryb: "PO_2H",
          stawka: 280,
        }),
        pub
      ),
      offers: [
        offer("W", 300, "OCZEKUJE", reactAt(pub, "W"), { notatka: "Mogę połączyć się z kancelarii, sprawdzony sprzęt." }),
        offer("S", 250, "OCZEKUJE", reactAt(pub, "S", -100), { fakturaVat: false }),
      ],
    });
  }

  // Po rezygnacji jednej osoby i odwołaniu wyboru drugiej: oferta zgaszona + jedna aktualna
  {
    const pub = warsawToUtc(c.workday(-3), "09:00");
    const fields = published(
      publicFields({
        tytul: "Przesłuchanie świadka w sprawie o ochronę dóbr osobistych",
        czynnosc: "PRZESLUCHANIE",
        dziedzina: "CYWILNA",
        rola: "PELNOMOCNIK_POWODA",
        place: place("SAD", "Sąd Okręgowy w Zamościu", "I Wydział Cywilny"),
        termin: c.at(6, "10:00"),
        kogo: ["ADW", "RADCA", "APL"],
        stawka: 280,
      }),
      pub
    );
    add({
      ref: "K_REZYGNACJA",
      by: "K",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -30 * MIN),
      updatedAt: c.ago(2),
      fields,
      offers: [
        offer("ZM", 280, "ODRZUCONA", reactAt(pub, "ZM")),
        offer("NW", 250, "REZYGNACJA", reactAt(pub, "NW"), { rezygnacjaAt: c.ago(30), rezygnacjaPozno: false }),
        offer("BZ", 300, "OCZEKUJE", reactAt(pub, "BZ"), { notatka: "Dojadę z Krakowa, koszt dojazdu wliczony." }),
      ],
      poufne: { sygnatura: "I C 98/26", strony: "Powód: Piotr S. · Pozwana: redakcja portalu lokalnego", instrukcja: "Pytania do świadka w załączonym piśmie." },
    });
  }

  // Wybrany zastępca (aplikantka) jeszcze nie potwierdził; stawka uzgodniona inna niż w zleceniu
  {
    const pub = c.ago(28);
    const wybranoAt = c.ago(3);
    add({
      by: "K",
      status: "PRZYDZIELONE",
      numberedAt: pub,
      createdAt: plus(pub, -20 * MIN),
      zastepca: "NW",
      fields: {
        ...published(
          publicFields({
            tytul: "Rozprawa karna — pełnomocnik oskarżyciela posiłkowego",
            czynnosc: "ROZPRAWA",
            dziedzina: "KARNA",
            rola: "PELNOMOCNIK_POKRZYWDZONEGO",
            place: SR_SWIDNIK,
            termin: c.at(2, "09:15"),
            kogo: ["ADW", "RADCA", "APL"],
            stawka: 300,
          }),
          pub
        ),
        wybranoAt,
        potwierdzenieDo: plus(wybranoAt, 24 * HOUR),
        stawkaUzgodniona: 280,
        przypomnienieWyslanoAt: c.now,
      },
      offers: [
        offer("NW", 280, "WYBRANA", reactAt(pub, "NW"), { notatka: "Występuję na upoważnienie — wzór jest w szczegółach zlecenia." }),
        offer("ZM", 300, "ODRZUCONA", reactAt(pub, "ZM")),
      ],
      poufne: { sygnatura: "II K 877/25", strony: "Oskarżony: Adam K. · Pokrzywdzona: Maria L.", instrukcja: "Podtrzymać wniosek o naprawienie szkody (art. 46 k.k.)." },
      files: [{ rodzaj: "DOKUMENT", nazwa: "Akt oskarżenia.pdf", who: "K", at: plus(pub, -10 * MIN), source: pdfDoc("Akt oskarżenia (odpis)", ["Sygn. akt II K 877/25.", "Prokurator oskarża o czyn z art. 157 § 1 k.k."], { pages: 2 }) }],
    });
  }

  // Potwierdzone, termin w najbliższy dzień roboczy, komplet danych poufnych i plików
  {
    const pub = warsawToUtc(c.workday(-4), "10:00");
    const wybranoAt = plus(pub, 3 * HOUR);
    add({
      by: "K",
      status: "POTWIERDZONE",
      numberedAt: pub,
      createdAt: plus(pub, -45 * MIN),
      zastepca: "ZM",
      fields: {
        ...published(
          publicFields({
            tytul: "Rozprawa o zapłatę — przesłuchanie świadków pozwanego",
            czynnosc: "ROZPRAWA",
            dziedzina: "CYWILNA",
            rola: "PELNOMOCNIK_POWODA",
            place: SR_LZ("I Wydział Cywilny, sala 105"),
            termin: c.at(1, "10:00"),
            kogo: ["ADW", "RADCA", "APL"],
            stawka: 320,
          }),
          pub
        ),
        wybranoAt,
        potwierdzenieDo: plus(wybranoAt, 24 * HOUR),
        potwierdzonoAt: plus(wybranoAt, 50 * MIN),
        stawkaUzgodniona: 320,
        przypomnienieWyslanoAt: c.now,
      },
      offers: [offer("ZM", 320, "WYBRANA", reactAt(pub, "ZM")), offer("NW", 220, "ODRZUCONA", reactAt(pub, "NW"))],
      poufne: {
        sygnatura: "I C 1234/26",
        strony: "Powód: Marek Z. (Transport-Med) · Pozwany: Bud-Mar sp. z o.o.",
        instrukcja: "Świadkowie pozwanego: kierownik budowy i księgowa.\nPytania pomocnicze w pliku „Instrukcja dla zastępcy”.\nNie cofać wniosku o opinię biegłego.",
      },
      files: [
        { rodzaj: "DOKUMENT", nazwa: "Pozew o zapłatę — odpis.pdf", who: "K", at: plus(pub, -40 * MIN), source: pdfDoc("Pozew o zapłatę", ["Sygn. akt I C 1234/26.", "Powód wnosi o zasądzenie 48 600 zł z odsetkami ustawowymi za opóźnienie."], { pages: 4 }) },
        { rodzaj: "DOKUMENT", nazwa: "Instrukcja dla zastępcy.doc", who: "K", at: plus(pub, -35 * MIN), source: { doc: { title: "Instrukcja dla zastępcy", paragraphs: ["Pytania do kierownika budowy: zakres prac, terminy odbiorów, protokoły.", "Pytania do księgowej: płatności zaliczek, korekty faktur.", "W razie pytań: telefon do zlecającego."] } } },
        { rodzaj: "PELNOMOCNICTWO", nazwa: "Pełnomocnictwo substytucyjne — adw. Zofia Mazur.pdf", who: "K", at: plus(wybranoAt, 2 * HOUR), source: pdfDoc("Pełnomocnictwo substytucyjne", ["Udzielam dalszego pełnomocnictwa (substytucji) adw. Zofii Mazur do zastępowania mnie w sprawie I C 1234/26."]) },
      ],
    });
  }

  // Zapytanie przyjęte bez giełdy; termin już był, zastępca „na miejscu”, raport jeszcze nie przyszedł
  {
    const sentAt = warsawToUtc(c.workday(-3), "15:00");
    const termin = c.pastSlot("09:30", "13:00");
    add({
      by: "K",
      status: "POTWIERDZONE",
      numberedAt: sentAt,
      createdAt: plus(sentAt, -10 * MIN),
      zastepca: "W",
      zapytanieDo: "W",
      fields: {
        ...publicFields({
          tytul: "Rozprawa w Warszawie — spór z ubezpieczycielem",
          czynnosc: "ROZPRAWA",
          dziedzina: "CYWILNA",
          rola: "PELNOMOCNIK_POWODA",
          ktory: "KOLEJNY",
          place: place("SAD", "Sąd Okręgowy w Warszawie", "XXV Wydział Cywilny, sala 309"),
          termin,
          stawka: 400,
        }),
        zapytanieWazneDo: plus(sentAt, 13 * HOUR),
        zapytanieOdpowiedz: "PRZYJETE",
        wybranoAt: plus(sentAt, 40 * MIN),
        potwierdzonoAt: plus(sentAt, 40 * MIN),
        naMiejscuAt: plus(termin, -25 * MIN),
        stawkaUzgodniona: 400,
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
      },
      offers: [offer("W", 400, "WYBRANA", plus(sentAt, 40 * MIN))],
      poufne: { sygnatura: "XXV C 2210/25", strony: "Powód: Krzysztof B. · Pozwany: towarzystwo ubezpieczeń", instrukcja: "Wnieść o dopuszczenie dowodu z opinii uzupełniającej biegłego." },
      files: [{ rodzaj: "DOKUMENT", nazwa: "Pismo przygotowawcze.pdf", who: "K", at: plus(sentAt, -5 * MIN), source: pdfDoc("Pismo przygotowawcze powoda", ["Sygn. akt XXV C 2210/25.", "Powód podtrzymuje żądanie i wnosi o opinię uzupełniającą."]) }],
    });
  }

  // Raport zastępcy czeka na potwierdzenie (licznik automatycznego zamknięcia), załączniki raportu
  {
    const termin = c.at(-1, "09:00");
    const pub = plus(termin, -5 * DAY);
    const wykonanoAt = c.reportAt(termin, 4, 30);
    add({
      ref: "K_RAPORT",
      by: "K",
      status: "WYKONANE",
      numberedAt: pub,
      createdAt: plus(pub, -20 * MIN),
      zastepca: "ZM",
      fields: {
        ...published(
          publicFields({ tytul: "Rozprawa o ustalenie istnienia stosunku pracy", czynnosc: "ROZPRAWA", dziedzina: "PRACY", rola: "PELNOMOCNIK_POWODA", place: SR_LZ("IV Wydział Pracy"), termin, stawka: 300 }),
          pub
        ),
        wybranoAt: plus(pub, 4 * HOUR),
        potwierdzenieDo: plus(pub, 28 * HOUR),
        potwierdzonoAt: plus(pub, 5 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        naMiejscuAt: plus(termin, -15 * MIN),
        wykonanoAt,
        raportPrzebieg: "ODROCZONA",
        raportKolejnyTermin: c.at(25, "11:30"),
        raportNotatka: "Rozprawa odroczona — sąd dopuścił dowód z zeznań dwóch dodatkowych świadków pozwanego.\nZobowiązano powoda do wskazania adresu świadka w 7 dni.\nProtokół i zdjęcie listy obecności w załącznikach.",
        stawkaUzgodniona: 300,
      },
      offers: [offer("ZM", 300, "WYBRANA", reactAt(pub, "ZM"))],
      poufne: { sygnatura: "IV P 88/26", strony: "Powód: Karol D. · Pozwana: Logi-Trans sp. z o.o.", instrukcja: "Wnieść o przesłuchanie powoda w charakterze strony." },
      files: [
        { rodzaj: "DOKUMENT", nazwa: "Pozew o ustalenie stosunku pracy.pdf", who: "K", at: plus(pub, -15 * MIN), source: pdfDoc("Pozew o ustalenie istnienia stosunku pracy", ["Sygn. akt IV P 88/26."], { pages: 2 }) },
        { rodzaj: "RAPORT", nazwa: "Zdjęcie listy obecności.jpg", who: "ZM", at: plus(wykonanoAt, -10 * MIN), source: { copy: "public/images/how-it-works.jpeg" } },
        { rodzaj: "RAPORT", nazwa: "Notatka z rozprawy.pdf", who: "ZM", at: plus(wykonanoAt, -5 * MIN), source: pdfDoc("Notatka z rozprawy", ["Sąd dopuścił dowód z zeznań świadków: Jan P., Anna R.", "Termin kolejnej rozprawy wyznaczono na posiedzeniu."]) },
      ],
    });
  }

  // Raport + zgłoszony problem: bez automatycznego zamknięcia
  {
    const termin = c.at(-2, "10:00");
    const pub = plus(termin, -6 * DAY);
    const wykonanoAt = plus(termin, 3 * HOUR);
    add({
      by: "K",
      status: "WYKONANE",
      numberedAt: pub,
      createdAt: plus(pub, -30 * MIN),
      zastepca: "TK",
      fields: {
        ...published(
          publicFields({ tytul: "Rozprawa przed KIO — zamówienie na dostawę sprzętu", czynnosc: "ROZPRAWA", dziedzina: "KIO", rola: "PELNOMOCNIK_ODWOLUJACEGO", place: place("ZDALNIE", "Krajowa Izba Odwoławcza, rozprawa zdalna"), termin, stawka: 550 }),
          pub
        ),
        wybranoAt: plus(pub, 6 * HOUR),
        potwierdzenieDo: plus(pub, 30 * HOUR),
        potwierdzonoAt: plus(pub, 8 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        wykonanoAt,
        raportPrzebieg: "ZAMKNIETA_WYROK",
        raportNotatka: "Izba zamknęła rozprawę i ogłosiła wyrok oddalający odwołanie.",
        problemZgloszonoAt: plus(wykonanoAt, 20 * HOUR),
        problemOpis: "Zastępca nie zgłosił wniosku dowodowego, o który prosiłem w instrukcji",
        stawkaUzgodniona: 550,
      },
      offers: [offer("TK", 550, "WYBRANA", reactAt(pub, "TK"))],
      poufne: { sygnatura: "KIO 2210/26", strony: "Odwołujący: MedTech S.A. · Zamawiający: szpital wojewódzki", instrukcja: "Zgłosić wniosek o dowód z dokumentacji technicznej (zał. 3 do odwołania)." },
      files: [{ rodzaj: "RAPORT", nazwa: "Protokół rozprawy KIO.pdf", who: "TK", at: plus(wykonanoAt, -20 * MIN), source: pdfDoc("Protokół rozprawy przed KIO", ["Sygn. akt KIO 2210/26.", "Izba ogłosiła wyrok oddalający odwołanie."], { pages: 2 }) }],
    });
  }

  // Zamknięte z oceną i komentarzem (opłacone)
  {
    const termin = c.at(-2, "11:00");
    const pub = plus(termin, -4 * DAY);
    const wykonanoAt = plus(termin, 2 * HOUR);
    add({
      by: "K",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      updatedAt: plus(wykonanoAt, 26 * HOUR),
      zastepca: "ZM",
      fields: {
        ...published(publicFields({ tytul: "Ogłoszenie wyroku w sprawie o podział majątku", czynnosc: "OGLOSZENIE_WYROKU", dziedzina: "RODZINNA", rola: "PELNOMOCNIK_UCZESTNIKA", place: SO_LUBLIN("XI Wydział Rodzinny"), termin, stawka: 200 }), pub),
        wybranoAt: plus(pub, 2 * HOUR),
        potwierdzenieDo: plus(pub, 26 * HOUR),
        potwierdzonoAt: plus(pub, 3 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        wykonanoAt,
        zamknietoAt: plus(wykonanoAt, 4 * HOUR),
        raportPrzebieg: "ZAMKNIETA_WYROK",
        raportNotatka: "Sąd ogłosił postanowienie o podziale majątku zgodnie z wnioskiem uczestnika. Wniosek o uzasadnienie złożony.",
        ocena: 5,
        ocenaKomentarz: "Jak zawsze — konkretnie i na czas.",
        stawkaUzgodniona: 200,
        fakturaStatus: "OPLACONA",
      },
      offers: [offer("ZM", 200, "WYBRANA", reactAt(pub, "ZM"))],
      poufne: { sygnatura: "XI Ns 77/25", strony: "Wnioskodawczyni: Barbara T. · Uczestnik: Roman T.", instrukcja: "Złożyć wniosek o uzasadnienie od razu po ogłoszeniu." },
      files: [{ rodzaj: "RAPORT", nazwa: "Odpis sentencji.png", who: "ZM", at: plus(wykonanoAt, -20 * MIN), source: { copy: "public/images/security-lock.png" } }],
    });
  }

  // Zamknięte bez oceny (można ocenić później), faktura wystawiona
  {
    const termin = c.at(-1, "12:00");
    const pub = plus(termin, -3 * DAY);
    const wykonanoAt = plus(termin, 90 * MIN);
    add({
      by: "K",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: plus(wykonanoAt, 5 * HOUR),
      zastepca: "W",
      fields: {
        ...published(publicFields({ tytul: "Posiedzenie przed sądem gospodarczym w Warszawie", czynnosc: "POSIEDZENIE", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", place: place("SAD", "Sąd Okręgowy w Warszawie", "XVI Wydział Gospodarczy"), termin, stawka: 450 }), pub),
        wybranoAt: plus(pub, 1 * HOUR),
        potwierdzenieDo: plus(pub, 25 * HOUR),
        potwierdzonoAt: plus(pub, 2 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        wykonanoAt,
        zamknietoAt: plus(wykonanoAt, 3 * HOUR),
        raportPrzebieg: "ODBYLA_SIE",
        raportNotatka: "Posiedzenie odbyło się, strony podtrzymały stanowiska. Sąd zamknął posiedzenie i wyznaczy termin rozprawy.",
        stawkaUzgodniona: 450,
        fakturaStatus: "WYSTAWIONA",
      },
      offers: [offer("W", 450, "WYBRANA", reactAt(pub, "W")), offer("TK", 480, "ODRZUCONA", reactAt(pub, "TK"))],
      poufne: { sygnatura: "XVI GC 1021/26", strony: "Powód: Stal-Bud S.A. · Pozwany: klient zlecającego", instrukcja: "" },
      files: [{ rodzaj: "DOKUMENT", nazwa: "Odpowiedź na pozew.pdf", who: "K", at: plus(pub, -5 * MIN), source: pdfDoc("Odpowiedź na pozew", ["Sygn. akt XVI GC 1021/26."], { pages: 2 }) }],
    });
  }

  // Zamknięte automatycznie po 48 h od raportu (aplikantka, bez faktury)
  {
    const termin = c.at(-4, "10:00");
    const pub = plus(termin, -5 * DAY);
    const wykonanoAt = plus(termin, 2 * HOUR);
    add({
      ref: "K_AUTO",
      by: "K",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -20 * MIN),
      updatedAt: plus(wykonanoAt, 48 * HOUR + 3 * MIN),
      zastepca: "NW",
      fields: {
        ...published(publicFields({ tytul: "Posiedzenie w sprawie o zasiedzenie", czynnosc: "POSIEDZENIE", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_UCZESTNIKA", place: SR_PULAWY("I Wydział Cywilny"), termin, kogo: ["ADW", "RADCA", "APL"], stawka: 200, vat: false }), pub),
        wybranoAt: plus(pub, 5 * HOUR),
        potwierdzenieDo: plus(pub, 29 * HOUR),
        potwierdzonoAt: plus(pub, 6 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        wykonanoAt,
        zamknietoAt: plus(wykonanoAt, 48 * HOUR + 3 * MIN),
        zamknietoAutomatycznie: true,
        raportPrzebieg: "ODBYLA_SIE",
        raportNotatka: "Przesłuchano uczestników. Sąd zakreślił termin na złożenie mapy do celów prawnych.",
        stawkaUzgodniona: 200,
        fakturaStatus: "DO_WYSTAWIENIA",
      },
      offers: [offer("NW", 200, "WYBRANA", reactAt(pub, "NW"))],
      poufne: { sygnatura: "I Ns 301/24", strony: "Wnioskodawca: Stanisław P. · Uczestnicy: gmina i sąsiedzi", instrukcja: "Podtrzymać wniosek o oględziny nieruchomości." },
    });
  }

  // Zamknięte dziś/wczoraj, termin „do ustalenia” — trafia do rozliczeń bieżącego miesiąca
  {
    const pub = c.ago(50);
    const zamknietoAt = c.thisMonthAgo(4);
    const wykonanoAt = plus(zamknietoAt, -2 * HOUR);
    add({
      by: "K",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: zamknietoAt,
      zastepca: "NW",
      fields: {
        ...published(publicFields({ tytul: "Fotokopie akt — komplet z ostatnich 3 miesięcy", czynnosc: "FOTOKOPIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", ktory: "NIE_DOTYCZY", place: SR_LZ("I Wydział Cywilny"), termin: null, doUstalenia: true, kogo: ["ADW", "RADCA", "APL"], stawka: 120, vat: false }), pub),
        wybranoAt: plus(pub, 2 * HOUR),
        potwierdzenieDo: plus(pub, 26 * HOUR),
        potwierdzonoAt: plus(pub, 3 * HOUR),
        wykonanoAt,
        zamknietoAt,
        raportPrzebieg: "INNE",
        raportNotatka: "Wykonano 126 fotokopii (k. 210–336), przesłane w PDF.",
        ocena: 5,
        stawkaUzgodniona: 120,
        fakturaStatus: "DO_WYSTAWIENIA",
      },
      offers: [offer("NW", 120, "WYBRANA", reactAt(pub, "NW"))],
      poufne: { sygnatura: "I C 1502/25", strony: "", instrukcja: "Skopiować wszystkie karty od ostatniego posiedzenia." },
    });
  }

  // Wygasło — termin minął bez zastępcy
  {
    const termin = c.at(-3, "13:00");
    const pub = plus(termin, -4 * DAY);
    add({
      by: "K",
      status: "WYGASLO",
      numberedAt: pub,
      createdAt: plus(pub, -30 * MIN),
      updatedAt: plus(termin, 5 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa w Chełmie — sprawa o alimenty", czynnosc: "ROZPRAWA", dziedzina: "RODZINNA", rola: "PELNOMOCNIK_POZWANEGO", place: place("SAD", "Sąd Rejonowy w Chełmie", "III Wydział Rodzinny"), termin, stawka: 180, vat: false }), pub),
    });
  }

  // Anulowane przed wyborem (zgłoszeni dostali informację)
  {
    const pub = c.ago(4 * 24 + 6);
    add({
      by: "K",
      status: "ANULOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: c.ago(4 * 24),
      fields: {
        ...published(publicFields({ tytul: "Rozprawa o zapłatę z faktur", czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", place: SR_LZ("VIII Wydział Gospodarczy"), termin: c.at(4, "12:30"), stawka: 260 }), pub),
        anulowanoAt: c.ago(4 * 24),
        powodAnulowania: "Klient cofnął pełnomocnictwo.",
      },
      offers: [offer("ZM", 260, "ODRZUCONA", reactAt(pub, "ZM")), offer("W", 300, "ODRZUCONA", reactAt(pub, "W"))],
    });
  }

  // Anulowane po wyborze aplikantki (ona widzi kartę bez danych sprawy)
  {
    const pub = c.ago(6 * 24);
    const anulowanoAt = c.ago(2 * 24 + 3);
    add({
      ref: "K_ANUL_PO_WYBORZE",
      by: "K",
      status: "ANULOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -20 * MIN),
      updatedAt: anulowanoAt,
      zastepca: "NW",
      fields: {
        ...published(publicFields({ tytul: "Przeglądanie akt w sprawie spadkowej", czynnosc: "PRZEGLADANIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_UCZESTNIKA", ktory: "NIE_DOTYCZY", place: SR_LZ("I Wydział Cywilny"), termin: c.at(2, "10:00"), kogo: ["ADW", "RADCA", "APL"], stawka: 150, vat: false }), pub),
        wybranoAt: plus(pub, 6 * HOUR),
        potwierdzenieDo: plus(pub, 30 * HOUR),
        potwierdzonoAt: plus(pub, 7 * HOUR),
        anulowanoAt,
        powodAnulowania: "Termin został zdjęty z wokandy.",
        stawkaUzgodniona: 150,
      },
      offers: [offer("NW", 150, "ODRZUCONA", reactAt(pub, "NW"))],
      poufne: { sygnatura: "I Ns 1100/25", strony: "Wnioskodawca: Halina G.", instrukcja: "Sprawdzić, czy wpłynął spis inwentarza." },
      files: [{ rodzaj: "DOKUMENT", nazwa: "Wniosek o stwierdzenie nabycia spadku.pdf", who: "K", at: plus(pub, -15 * MIN), source: pdfDoc("Wniosek o stwierdzenie nabycia spadku", ["Sygn. akt I Ns 1100/25."]) }],
    });
  }

  // Zarchiwizowane anulowane (widać po „Pokaż zarchiwizowane”)
  {
    const pub = c.ago(22 * 24);
    add({
      by: "K",
      status: "ANULOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: c.ago(20 * 24),
      fields: {
        ...published(publicFields({ tytul: "Przesłuchanie w Komendzie Miejskiej Policji", czynnosc: "PRZESLUCHANIE", dziedzina: "KARNA", rola: "OBRONCA", place: place("POLICJA", "Komenda Miejska Policji w Lublinie"), termin: plus(pub, 3 * DAY), stawka: 250 }), pub),
        anulowanoAt: c.ago(21 * 24),
        powodAnulowania: "Znalazłem zastępstwo w kancelarii.",
        zarchiwizowane: true,
      },
    });
  }

  // Na giełdzie po odmowie zapytanej osoby — oferty od aplikantki i radcy
  {
    const sentAt = c.ago(26);
    const pub = c.ago(24);
    add({
      by: "K",
      status: "OPUBLIKOWANE",
      numberedAt: sentAt,
      createdAt: plus(sentAt, -15 * MIN),
      zapytanieDo: "W",
      fields: {
        ...published(publicFields({ tytul: "Posiedzenie w sprawie o zapłatę — Warszawa", czynnosc: "POSIEDZENIE", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", place: place("SAD", "Sąd Rejonowy dla Warszawy-Mokotowa w Warszawie", "II Wydział Cywilny"), termin: c.at(7, "09:30"), kogo: ["ADW", "RADCA", "APL"], stawka: 260 }), pub),
        zapytanieWazneDo: plus(sentAt, 13 * HOUR),
        zapytanieOdpowiedz: "ODRZUCONE",
      },
      offers: [offer("JK", 200, "OCZEKUJE", reactAt(pub, "JK"), { notatka: "Aplikantka 2. roku, sąd znam z praktyk." }), offer("TK", 260, "OCZEKUJE", reactAt(pub, "TK"))],
    });
  }

  // „Kto pierwszy”, termin do ustalenia, świeżo opublikowane
  {
    const pub = c.ago(0.5);
    add({
      by: "K",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -8 * MIN),
      fields: published(publicFields({ tytul: "Przeglądanie akt i notatka dla klienta", czynnosc: "PRZEGLADANIE_AKT", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", ktory: "NIE_DOTYCZY", place: SO_LUBLIN("IX Wydział Gospodarczy"), termin: null, doUstalenia: true, tryb: "PIERWSZY", kogo: ["ADW", "RADCA", "APL"], stawka: 150 }), pub),
    });
  }

  // ==========================================================================
  // K jako zastępca — „Przyjęte przeze mnie”
  // ==========================================================================

  // Wybrano K — trzeba potwierdzić przyjęcie
  {
    const pub = c.ago(20);
    const wybranoAt = c.ago(2);
    add({
      ref: "P_WYBRANO",
      by: "W",
      status: "PRZYDZIELONE",
      numberedAt: pub,
      createdAt: plus(pub, -20 * MIN),
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa w Lublinie — powództwo o zachowek", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", place: SO_LUBLIN("I Wydział Cywilny, sala 214"), termin: c.at(3, "11:00"), stawka: 350 }), pub),
        wybranoAt,
        potwierdzenieDo: plus(wybranoAt, 24 * HOUR),
        stawkaUzgodniona: 350,
        przypomnienieWyslanoAt: c.now,
      },
      offers: [offer("K", 350, "WYBRANA", reactAt(pub, "K"), { notatka: "Mogę też złożyć pismo na biurze podawczym przy okazji." }), offer("ZM", 340, "ODRZUCONA", reactAt(pub, "ZM"))],
      poufne: { sygnatura: "I C 760/26", strony: "Powódka: Irena W. · Pozwany: Jacek W.", instrukcja: "Kwestionować wycenę nieruchomości — wniosek o biegłego w odpowiedzi na pozew." },
      files: [
        { rodzaj: "DOKUMENT", nazwa: "Akta sprawy — wybrane pisma.pdf", who: "W", at: plus(pub, -10 * MIN), source: pdfDoc("Akta sprawy — wybrane pisma", ["Sygn. akt I C 760/26.", "Pozew, odpowiedź na pozew, postanowienie dowodowe."], { pages: 6 }) },
        { rodzaj: "PELNOMOCNICTWO", nazwa: "Substytucja — r.pr. Krystian Kuźmiński.pdf", who: "W", at: plus(wybranoAt, 20 * MIN), source: pdfDoc("Pełnomocnictwo substytucyjne", ["Udzielam substytucji r.pr. Krystianowi Kuźmińskiemu w sprawie I C 760/26."]) },
      ],
    });
  }

  // Potwierdzone, termin w najbliższy dzień roboczy (rezygnacja może być „późna”), miejsce bez adresu w wykazie
  {
    const pub = c.ago(3 * 24);
    add({
      by: "TK",
      status: "POTWIERDZONE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa przed WSA — skarga na decyzję o warunkach zabudowy", czynnosc: "ROZPRAWA", dziedzina: "ADMINISTRACYJNA", rola: "PELNOMOCNIK_UCZESTNIKA", place: place("SAD", "Wojewódzki Sąd Administracyjny w Lublinie", "Wydział II, sala A"), termin: c.at(1, "09:30"), stawka: 380 }), pub),
        wybranoAt: plus(pub, 5 * HOUR),
        potwierdzenieDo: plus(pub, 29 * HOUR),
        potwierdzonoAt: plus(pub, 6 * HOUR),
        stawkaUzgodniona: 380,
        przypomnienieWyslanoAt: c.now,
      },
      offers: [offer("K", 380, "WYBRANA", reactAt(pub, "K"))],
      poufne: { sygnatura: "II SA/Lu 315/26", strony: "Skarżący: spółdzielnia mieszkaniowa · Organ: SKO w Lublinie", instrukcja: "" },
      files: [{ rodzaj: "DOKUMENT", nazwa: "Skarga do WSA.pdf", who: "TK", at: plus(pub, -10 * MIN), source: pdfDoc("Skarga do Wojewódzkiego Sądu Administracyjnego", ["Sygn. akt II SA/Lu 315/26."], { pages: 3 }) }],
    });
  }

  // Termin był, K oznaczył „na miejscu”, raport do wysłania (licznik w menu „Przyjęte”)
  {
    const termin = c.pastSlot("10:30", "14:30");
    const pub = plus(termin, -6 * DAY);
    add({
      by: "AK",
      status: "POTWIERDZONE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa o podwyższenie alimentów", czynnosc: "ROZPRAWA", dziedzina: "RODZINNA", rola: "PELNOMOCNIK_POZWANEGO", place: SR_LZ("III Wydział Rodzinny"), termin, stawka: 300 }), pub),
        wybranoAt: plus(pub, 3 * HOUR),
        potwierdzenieDo: plus(pub, 27 * HOUR),
        potwierdzonoAt: plus(pub, 4 * HOUR),
        naMiejscuAt: plus(termin, -20 * MIN),
        stawkaUzgodniona: 300,
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
      },
      offers: [offer("K", 300, "WYBRANA", reactAt(pub, "K"))],
      poufne: { sygnatura: "III RC 412/26", strony: "Powódka: małoletnia Zuzanna K. · Pozwany: Rafał K.", instrukcja: "Wnosić o oddalenie powództwa ponad 900 zł miesięcznie." },
      files: [{ rodzaj: "RAPORT", nazwa: "Protokół — zdjęcie.png", who: "K", at: plus(termin, 2 * HOUR), source: { copy: "public/images/logo-mail.png" } }],
    });
  }

  // K wysłał raport, czeka na potwierdzenie zlecającego
  {
    const termin = c.at(-1, "10:00");
    const pub = plus(termin, -4 * DAY);
    const wykonanoAt = c.reportAt(termin, 3, 40);
    add({
      by: "BZ",
      status: "WYKONANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa o zadośćuczynienie za błąd medyczny", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", place: SO_LUBLIN("II Wydział Cywilny"), termin, stawka: 420 }), pub),
        wybranoAt: plus(pub, 2 * HOUR),
        potwierdzenieDo: plus(pub, 26 * HOUR),
        potwierdzonoAt: plus(pub, 3 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        wykonanoAt,
        raportPrzebieg: "ODBYLA_SIE",
        raportKolejnyTermin: c.at(30, "09:00"),
        raportNotatka: "Przesłuchano biegłego. Strona pozwana wniosła o opinię uzupełniającą — sąd postanowi na posiedzeniu niejawnym.",
        stawkaUzgodniona: 420,
      },
      offers: [offer("K", 420, "WYBRANA", reactAt(pub, "K"))],
      poufne: { sygnatura: "II C 640/25", strony: "Powódka: Monika J. · Pozwany: szpital powiatowy", instrukcja: "Pytania do biegłego w piśmie z 12 strony akt." },
      files: [{ rodzaj: "RAPORT", nazwa: "Notatka z przesłuchania biegłego.pdf", who: "K", at: plus(wykonanoAt, -5 * MIN), source: pdfDoc("Notatka z przesłuchania biegłego", ["Biegły podtrzymał opinię główną.", "Pełnomocnik pozwanego zgłosił zastrzeżenia do metodologii."]) }],
    });
  }

  // Zamknięte w tym miesiącu, ocenione na 4, faktura do wystawienia
  {
    const termin = c.at(-1, "09:00");
    const pub = plus(termin, -3 * DAY);
    const wykonanoAt = plus(termin, 2 * HOUR);
    add({
      by: "W",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      updatedAt: plus(wykonanoAt, 6 * HOUR),
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa o rozwiązanie umowy najmu", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", place: SR_LZ("I Wydział Cywilny, sala 12"), termin, stawka: 300 }), pub),
        wybranoAt: plus(pub, 1 * HOUR),
        potwierdzenieDo: plus(pub, 25 * HOUR),
        potwierdzonoAt: plus(pub, 2 * HOUR),
        przypomnienieWyslanoAt: warsawToUtc(shiftDay(warsawDay(termin), -1), "18:00"),
        naMiejscuAt: plus(termin, -15 * MIN),
        wykonanoAt,
        zamknietoAt: plus(wykonanoAt, 6 * HOUR),
        raportPrzebieg: "ODBYLA_SIE",
        raportNotatka: "Rozprawa odbyła się. Pozwany uznał powództwo co do zaległego czynszu.",
        ocena: 4,
        ocenaKomentarz: "Raport mógłby być bardziej szczegółowy, ale wszystko w porządku.",
        stawkaUzgodniona: 300,
        fakturaStatus: "DO_WYSTAWIENIA",
      },
      offers: [offer("K", 300, "WYBRANA", reactAt(pub, "K"))],
      poufne: { sygnatura: "I C 1888/25", strony: "Powód: Wspólnota Mieszkaniowa · Pozwany: najemca lokalu", instrukcja: "" },
    });
  }

  // Zamknięte, zdalne (KIO), termin do ustalenia wykonania — faktura wystawiona
  {
    const pub = c.ago(3 * 24);
    const zamknietoAt = c.thisMonthAgo(6);
    const wykonanoAt = plus(zamknietoAt, -3 * HOUR);
    add({
      by: "AK",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      updatedAt: zamknietoAt,
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Fotokopie akt sprawy apelacyjnej", czynnosc: "FOTOKOPIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", ktory: "NIE_DOTYCZY", place: place("SAD", "Sąd Apelacyjny w Lublinie", "I Wydział Cywilny"), termin: null, doUstalenia: true, stawka: 150 }), pub),
        wybranoAt: plus(pub, 3 * HOUR),
        potwierdzenieDo: plus(pub, 27 * HOUR),
        potwierdzonoAt: plus(pub, 4 * HOUR),
        wykonanoAt,
        zamknietoAt,
        raportPrzebieg: "INNE",
        raportNotatka: "Fotokopie wykonane i przesłane mailem (212 stron).",
        stawkaUzgodniona: 150,
        fakturaStatus: "WYSTAWIONA",
      },
      offers: [offer("K", 150, "WYBRANA", reactAt(pub, "K"))],
      poufne: { sygnatura: "I ACa 102/26", strony: "", instrukcja: "Skopiować tom II akt." },
    });
  }

  // Zamknięte w tym miesiącu i od razu opłacone — w rozliczeniach widać wszystkie trzy statusy faktury
  {
    const pub = c.ago(4 * 24);
    const zamknietoAt = c.thisMonthAgo(20);
    const wykonanoAt = plus(zamknietoAt, -5 * HOUR);
    add({
      by: "ZM",
      status: "ZAMKNIETE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: plus(zamknietoAt, 2 * HOUR),
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Przeglądanie akt — sprawa o zachowek", czynnosc: "PRZEGLADANIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", ktory: "NIE_DOTYCZY", place: SO_LUBLIN("I Wydział Cywilny"), termin: null, doUstalenia: true, stawka: 200 }), pub),
        wybranoAt: plus(pub, 1 * HOUR),
        potwierdzenieDo: plus(pub, 25 * HOUR),
        potwierdzonoAt: plus(pub, 90 * MIN),
        wykonanoAt,
        zamknietoAt,
        raportPrzebieg: "INNE",
        raportNotatka: "Akta przejrzane. Pozwany złożył nowe pismo z wnioskami dowodowymi — skan w mailu.",
        ocena: 5,
        stawkaUzgodniona: 200,
        fakturaStatus: "OPLACONA",
      },
      offers: [offer("K", 200, "WYBRANA", reactAt(pub, "K"))],
      poufne: { sygnatura: "I C 2045/25", strony: "Powódka: Teresa N. · Pozwany: Andrzej N.", instrukcja: "Sprawdzić, czy wpłynęła opinia biegłego." },
    });
  }

  // Zastępstwo anulowane przez zlecającego po wyborze K — karta bez danych sprawy
  {
    const pub = c.ago(5 * 24);
    const anulowanoAt = c.ago(2 * 24);
    add({
      ref: "P_ANULOWANE",
      by: "TK",
      status: "ANULOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      updatedAt: anulowanoAt,
      zastepca: "K",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa gospodarcza — spór o wynagrodzenie za wdrożenie", czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", place: SO_LUBLIN("IX Wydział Gospodarczy"), termin: c.at(3, "13:00"), stawka: 450 }), pub),
        wybranoAt: plus(pub, 4 * HOUR),
        potwierdzenieDo: plus(pub, 28 * HOUR),
        potwierdzonoAt: plus(pub, 5 * HOUR),
        anulowanoAt,
        powodAnulowania: "Sprawa zakończyła się ugodą pozasądową.",
        stawkaUzgodniona: 450,
      },
      offers: [offer("K", 450, "ODRZUCONA", reactAt(pub, "K"))],
      poufne: { sygnatura: "IX GC 744/26", strony: "Powód: TechLaw Solutions · Pozwany: software house", instrukcja: "Tajne — po anulowaniu zastępca nie powinien tego widzieć." },
    });
  }

  // ==========================================================================
  // Giełda (zlecenia innych, które widzi K) — pasujące, niepasujące i z ofertą K
  // ==========================================================================

  // Pilne, jutro, pasuje (Lublin)
  {
    const pub = c.ago(0.8);
    add({
      ref: "G_PILNE",
      by: "AK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Ogłoszenie wyroku — sprawa o rozwód", czynnosc: "OGLOSZENIE_WYROKU", dziedzina: "RODZINNA", rola: "PELNOMOCNIK_POZWANEGO", ktory: "NIE_DOTYCZY", place: SO_LUBLIN("VI Wydział Rodzinny"), termin: c.at(1, "14:00"), ofertyDoTryb: "DO_TERMINU", stawka: 250, pilne: true }), pub),
    });
  }

  // Zdalne KIO z długim opisem, oferta K i S
  {
    const pub = c.ago(7);
    add({
      by: "TK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -25 * MIN),
      fields: published(
        publicFields({
          tytul: "Rozprawa przed KIO — odwołanie od wyboru oferty w przetargu na roboty",
          czynnosc: "ROZPRAWA",
          dziedzina: "KIO",
          rola: "PELNOMOCNIK_ODWOLUJACEGO",
          opis: "Odwołanie od wyboru najkorzystniejszej oferty w przetargu na przebudowę drogi wojewódzkiej. Zarzuty dotyczą rażąco niskiej ceny i niewykazania doświadczenia przez wybranego wykonawcę.\n\nRozprawa zdalna przez platformę Izby, link przyjdzie dzień wcześniej. Odwołanie i odpowiedź zamawiającego udostępnię po wyborze.\n\nMile widziane doświadczenie w sprawach KIO.",
          place: place("ZDALNIE", "Krajowa Izba Odwoławcza, rozprawa zdalna"),
          termin: c.at(4, "10:00"),
          stawka: 600,
        }),
        pub
      ),
      offers: [
        offer("K", 600, "OCZEKUJE", reactAt(pub, "K"), { notatka: "Prowadziłem kilkanaście spraw przed KIO." }),
        offer("S", 550, "OCZEKUJE", reactAt(pub, "S"), { fakturaVat: true }),
      ],
    });
  }

  // Tylko dla adwokatów (obrońca) — K jako radca w ogóle go nie widzi
  {
    const pub = c.ago(9);
    add({
      by: "W",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Obrona na rozprawie karnej — zarzut oszustwa", czynnosc: "ROZPRAWA", dziedzina: "KARNA", rola: "OBRONCA", ktory: "KOLEJNY", place: place("SAD", "Sąd Rejonowy dla Warszawy-Mokotowa w Warszawie", "III Wydział Karny, sala 202"), termin: c.at(3, "13:00"), kogo: ["ADW"], stawka: 400 }), pub),
    });
  }

  // „Kto pierwszy”, termin bez godziny, bez faktury, daleko (Poznań)
  {
    const pub = c.ago(2);
    add({
      by: "S",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -5 * MIN),
      fields: published(publicFields({ tytul: "Fotokopie akt — do środy", czynnosc: "FOTOKOPIE_AKT", dziedzina: "PRACY", rola: "PELNOMOCNIK_POWODA", ktory: "NIE_DOTYCZY", place: place("SAD", "Sąd Okręgowy w Poznaniu", "VIII Wydział Pracy"), termin: c.at(3, "00:00"), godzina: false, tryb: "PIERWSZY", kogo: ["ADW", "RADCA", "APL"], stawka: 120, vat: false }), pub),
    });
  }

  // Prokuratura, sprawa karna — K złożył ofertę, choć dziedzina nie pasuje do jego ustawień
  {
    const pub = c.ago(10);
    add({
      by: "ZM",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      fields: published(publicFields({ tytul: "Przesłuchanie pokrzywdzonego w prokuraturze okręgowej", czynnosc: "PRZESLUCHANIE", dziedzina: "KARNA", rola: "PELNOMOCNIK_POKRZYWDZONEGO", place: place("PROKURATURA", "Prokuratura Okręgowa w Lublinie", "pokój 214"), termin: c.at(2, "10:00"), kogo: ["ADW", "RADCA", "APL"], stawka: 300 }), pub),
      offers: [offer("K", 280, "OCZEKUJE", reactAt(pub, "K"), { notatka: "Proponuję nieco niższą stawkę — mam w tym dniu inne czynności w prokuraturze." }), offer("NW", 220, "OCZEKUJE", reactAt(pub, "NW"))],
    });
  }

  // Zakład karny, „Inna czynność”, karna wykonawcza — nie pasuje do ustawień K
  {
    const pub = c.ago(12);
    add({
      by: "BZ",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -20 * MIN),
      fields: published(publicFields({ tytul: "Udział w posiedzeniu penitencjarnym w areszcie", czynnosc: "INNA", dziedzina: "KARNA_WYKONAWCZA", rola: "OBRONCA", ktory: "NIE_DOTYCZY", place: place("ZAKLAD_KARNY", "Areszt Śledczy w Lublinie"), termin: c.at(5, "09:00"), stawka: 200 }), pub),
    });
  }

  // Sąd Najwyższy — aplikanci go nie widzą, nawet gdy zlecający ich dopuścił
  {
    const pub = c.ago(20);
    add({
      by: "W",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa kasacyjna w Izbie Cywilnej", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", place: place("SAD", "Sąd Najwyższy", "Izba Cywilna, sala C"), termin: c.at(8, "11:00"), kogo: ["ADW", "RADCA", "APL"], stawka: 900 }), pub),
    });
  }

  // „Czekam na propozycje”, oferty przez 12 h, Kraków, dopuszczeni aplikanci
  {
    const pub = c.ago(3);
    add({
      by: "AK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Posiedzenie mediacyjne w sprawie gospodarczej", czynnosc: "POSIEDZENIE", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", place: place("SAD", "Sąd Rejonowy dla Krakowa-Śródmieścia w Krakowie", "V Wydział Gospodarczy"), termin: c.at(5, "12:00"), ofertyDoTryb: "PO_12H", kogo: ["ADW", "RADCA", "APL"], stawka: null }), pub),
    });
  }

  // Oferty do samego terminu; K wycofał swoją ofertę (może zgłosić się ponownie)
  {
    const pub = c.ago(30);
    add({
      by: "TK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      fields: published(publicFields({ tytul: "Końcowe zaznajomienie z aktami postępowania", czynnosc: "ZAZNAJOMIENIE_Z_AKTAMI", dziedzina: "KARNA", rola: "OBRONCA", ktory: "NIE_DOTYCZY", place: place("PROKURATURA", "Prokuratura Regionalna w Lublinie"), termin: c.at(8, "10:00"), ofertyDoTryb: "DO_TERMINU", stawka: 350 }), pub),
      offers: [offer("K", 350, "WYCOFANA", reactAt(pub, "K"))],
    });
  }

  // K zrezygnował wcześniej (nie później niż 24 h przed terminem) — zlecenie wróciło na giełdę
  {
    const pub = c.ago(4 * 24);
    add({
      by: "W",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: c.ago(20),
      fields: published(publicFields({ tytul: "Rozprawa w Puławach — sprawa o dział spadku", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_UCZESTNIKA", place: SR_PULAWY("I Wydział Cywilny"), termin: c.at(5, "12:00"), stawka: 300 }), pub),
      offers: [offer("K", 300, "REZYGNACJA", reactAt(pub, "K"), { rezygnacjaAt: c.ago(20), rezygnacjaPozno: false }), offer("ZM", 320, "OCZEKUJE", reactAt(pub, "ZM"))],
    });
  }

  // Termin do ustalenia, pasuje
  {
    const pub = c.ago(16);
    add({
      by: "AK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Przeglądanie akt — sprawa o odszkodowanie", czynnosc: "PRZEGLADANIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", ktory: "NIE_DOTYCZY", place: place("SAD", "Sąd Apelacyjny w Lublinie", "I Wydział Cywilny"), termin: null, doUstalenia: true, stawka: 200 }), pub),
    });
  }

  // Stawka poniżej minimum K — nie pasuje
  {
    const pub = c.ago(5);
    add({
      by: "BZ",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa o zapłatę — drobne roszczenie", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", place: place("SAD", "Sąd Rejonowy Lublin-Wschód w Lublinie z siedzibą w Świdniku", "I Wydział Cywilny"), termin: c.at(4, "09:00"), stawka: 150, vat: false }), pub),
    });
  }

  // Zamość — poza promieniem, ale w sądach wybranych przez K (pasuje); oferta ZM
  {
    const pub = c.ago(8);
    add({
      by: "BZ",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -15 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa o odszkodowanie z OC sprawcy", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", place: place("SAD", "Sąd Okręgowy w Zamościu", "I Wydział Cywilny"), termin: c.at(6, "09:30"), stawka: 300 }), pub),
      offers: [offer("ZM", 320, "OCZEKUJE", reactAt(pub, "ZM"))],
    });
  }

  // Termin w dniu niedostępności K — nie pasuje
  {
    const pub = c.ago(11);
    add({
      by: "W",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa w Lublinie — spór o wynagrodzenie", czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", place: SO_LUBLIN("IX Wydział Gospodarczy"), termin: c.at(16, "10:00"), stawka: 350 }), pub),
    });
  }

  // Tylko dla aplikantów — radcy i adwokaci go nie widzą
  {
    const pub = c.ago(6);
    add({
      by: "ZM",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Przeglądanie akt — zadanie dla aplikanta", czynnosc: "PRZEGLADANIE_AKT", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POZWANEGO", ktory: "NIE_DOTYCZY", place: SR_LZ("I Wydział Cywilny"), termin: c.at(2, "00:00"), godzina: false, kogo: ["APL"], stawka: 100, vat: false }), pub),
    });
  }

  // Chełm — tuż poza promieniem 60 km (nie pasuje)
  {
    const pub = c.ago(13);
    add({
      by: "TK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa o zapłatę — leasing maszyn", czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", place: place("SAD", "Sąd Rejonowy w Chełmie", "V Wydział Gospodarczy"), termin: c.at(4, "11:30"), stawka: 260 }), pub),
    });
  }

  // Termin ofert minął, a K wciąż ma ofertę „czeka na decyzję”
  {
    const pub = c.ago(5);
    add({
      by: "TK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa — roszczenia z umowy wdrożeniowej", czynnosc: "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", place: SO_LUBLIN("IX Wydział Gospodarczy, sala 6"), termin: c.at(3, "10:30"), ofertyDoTryb: "PO_2H", stawka: 420 }), pub),
      offers: [offer("K", 420, "OCZEKUJE", reactAt(pub, "K"))],
    });
  }

  // Organ spoza listy (wpisany ręcznie)
  {
    const pub = c.ago(14);
    add({
      by: "AK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Udział w czynnościach kontroli podatkowej", czynnosc: "INNA", dziedzina: "ADMINISTRACYJNA", rola: "PELNOMOCNIK_UCZESTNIKA", ktory: "NIE_DOTYCZY", place: customPlace("ORGAN", "Urząd Skarbowy w Puławach", "Puławy", "lubelskie", "pokój 108"), termin: c.at(6, "08:30"), stawka: 280 }), pub),
    });
  }

  // ==========================================================================
  // Zapytania imienne do K (banery nad giełdą)
  // ==========================================================================

  // Od ZM — współpracowali już dwa razy
  {
    const sentAt = c.ago(6);
    add({
      ref: "D_ZM",
      by: "ZM",
      status: "ZAPYTANIE",
      numberedAt: sentAt,
      createdAt: plus(sentAt, -10 * MIN),
      zapytanieDo: "K",
      fields: {
        ...publicFields({ tytul: "Rozprawa rozwodowa z orzekaniem o winie", czynnosc: "ROZPRAWA", dziedzina: "RODZINNA", rola: "PELNOMOCNIK_POZWANEGO", place: SO_LUBLIN("VI Wydział Rodzinny"), termin: c.at(2, "13:00"), stawka: 320 }),
        zapytanieWazneDo: c.later(7),
      },
      poufne: { sygnatura: "VI RC 588/26", strony: "Powódka: Agnieszka R. · Pozwany: Michał R.", instrukcja: "" },
    });
  }

  // Od S — pierwsza współpraca, mało czasu na odpowiedź, bez faktury
  {
    const sentAt = c.ago(12.2);
    add({
      by: "S",
      status: "ZAPYTANIE",
      numberedAt: sentAt,
      createdAt: plus(sentAt, -5 * MIN),
      zapytanieDo: "K",
      fields: {
        ...publicFields({ tytul: "Rozprawa w sprawie o przywrócenie do pracy", czynnosc: "ROZPRAWA", dziedzina: "PRACY", rola: "PELNOMOCNIK_POWODA", place: SR_PULAWY("IV Wydział Pracy"), termin: c.at(2, "12:00"), stawka: 280, vat: false }),
        zapytanieWazneDo: plus(sentAt, 13 * HOUR),
      },
    });
  }

  // ==========================================================================
  // Aplikantka JK (Warszawa) — przyjęte na upoważnienie i oferta na giełdzie
  // ==========================================================================

  {
    const pub = c.ago(4 * 24);
    add({
      ref: "J_POTWIERDZONE",
      by: "W",
      status: "POTWIERDZONE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      zastepca: "JK",
      fields: {
        ...published(publicFields({ tytul: "Rozprawa o zapłatę — pełnomocnik powoda", czynnosc: "ROZPRAWA", dziedzina: "CYWILNA", rola: "PELNOMOCNIK_POWODA", place: place("SAD", "Sąd Rejonowy dla Warszawy-Mokotowa w Warszawie", "I Wydział Cywilny, sala 105"), termin: c.at(2, "10:00"), kogo: ["ADW", "RADCA", "APL"], stawka: 180, vat: false }), pub),
        wybranoAt: plus(pub, 2 * HOUR),
        potwierdzenieDo: plus(pub, 26 * HOUR),
        potwierdzonoAt: plus(pub, 2 * HOUR + 15 * MIN),
        stawkaUzgodniona: 180,
        przypomnienieWyslanoAt: c.now,
      },
      offers: [offer("JK", 180, "WYBRANA", reactAt(pub, "JK")), offer("TK", 300, "ODRZUCONA", reactAt(pub, "TK"))],
      poufne: { sygnatura: "I C 3301/26", strony: "Powód: klient zlecającego · Pozwany: firma windykacyjna", instrukcja: "Podtrzymać pozew. W razie propozycji ugody — telefon do mnie." },
      files: [{ rodzaj: "PELNOMOCNICTWO", nazwa: "Upoważnienie dla aplikantki.pdf", who: "W", at: plus(pub, 3 * HOUR), source: pdfDoc("Upoważnienie", ["Upoważniam aplikantkę adwokacką Julię Kamińską do zastępowania mnie w sprawie I C 3301/26."]) }],
    });
  }

  {
    const pub = c.ago(9);
    add({
      by: "TK",
      status: "OPUBLIKOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      fields: published(publicFields({ tytul: "Przeglądanie akt sprawy licencyjnej", czynnosc: "PRZEGLADANIE_AKT", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POZWANEGO", ktory: "NIE_DOTYCZY", place: place("SAD", "Sąd Okręgowy w Warszawie", "XXII Wydział Własności Intelektualnej"), termin: c.at(3, "00:00"), godzina: false, kogo: ["ADW", "RADCA", "APL"], stawka: 150, vat: false }), pub),
      offers: [offer("JK", 150, "OCZEKUJE", reactAt(pub, "JK"))],
    });
  }

  // Anulowane zlecenia TK (statystyka zlecającego: „x zleceń, 2 anulowane”)
  for (const [index, days] of [18, 34].entries()) {
    const pub = c.ago(days * 24);
    add({
      by: "TK",
      status: "ANULOWANE",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: plus(pub, 20 * HOUR),
      fields: {
        ...published(publicFields({ tytul: index === 0 ? "Posiedzenie w sprawie o zapłatę" : "Rozprawa — spór o znak towarowy", czynnosc: index === 0 ? "POSIEDZENIE" : "ROZPRAWA", dziedzina: "GOSPODARCZA", rola: "PELNOMOCNIK_POWODA", place: place("SAD", "Sąd Okręgowy w Warszawie", "XX Wydział Gospodarczy"), termin: plus(pub, 3 * DAY), stawka: 400 }), pub),
        anulowanoAt: plus(pub, 20 * HOUR),
        powodAnulowania: index === 0 ? "Klient zawarł ugodę." : "Termin został przesunięty.",
      },
    });
  }

  // Wygasłe zlecenie S bez ofert
  {
    const termin = c.at(-6, "10:00");
    const pub = plus(termin, -3 * DAY);
    add({
      by: "S",
      status: "WYGASLO",
      numberedAt: pub,
      createdAt: plus(pub, -10 * MIN),
      updatedAt: plus(termin, 5 * MIN),
      fields: published(publicFields({ tytul: "Rozprawa w Poznaniu — odprawa pieniężna", czynnosc: "ROZPRAWA", dziedzina: "PRACY", rola: "PELNOMOCNIK_POWODA", place: place("SAD", "Sąd Okręgowy w Poznaniu", "VIII Wydział Pracy"), termin, stawka: 250 }), pub),
    });
  }

  return orders;
}

// ---------------------------------------------------------------------------
// Powiadomienia (dzwonek) — te same treści, które wysyła moduł
// ---------------------------------------------------------------------------

interface NotificationSpec {
  who: Who;
  ref: string;
  at: (order: SeededOrder) => Date;
  tytul: (order: SeededOrder) => string;
  tresc: (order: SeededOrder) => string;
  link: (order: SeededOrder) => string;
  przeczytane: boolean;
}

interface SeededOrder {
  id: string;
  numer: string | null;
  spec: OrderSpec;
}

function notifications(c: Clock, name: (who: Who) => string): NotificationSpec[] {
  const term = (o: SeededOrder) => formatTermin(o.spec.fields.termin as Date | null, o.spec.fields.terminMaGodzine ?? true, o.spec.fields.terminDoUstalenia ?? false);
  const own = (o: SeededOrder) => `${PANEL}/moje/${o.id}`;
  const accepted = (o: SeededOrder) => `${PANEL}/przyjete?zlecenie=${o.id}`;
  const fresh = (date: Date | undefined) => date ?? c.now;
  return [
    { who: "K", ref: "K_OFERTY", przeczytane: false, at: (o) => fresh(o.spec.offers?.[0]?.at), tytul: (o) => `Nowa oferta do ${o.numer}`, tresc: () => `${name("W")}, 400 zł netto, faktura VAT`, link: own },
    { who: "K", ref: "D_ZM", przeczytane: false, at: (o) => o.spec.numberedAt!, tytul: () => `${name("ZM")} prosi Cię o zastępstwo`, tresc: (o) => `${o.spec.fields.tytul} · ${czynnoscLabel(o.spec.fields.czynnosc)} · ${o.spec.fields.miejsce} · ${term(o)} · ${o.spec.fields.stawka} zł netto. Odpowiedz do ${formatShort(o.spec.fields.zapytanieWazneDo as Date)}.`, link: () => PANEL },
    { who: "K", ref: "K_RAPORT", przeczytane: false, at: (o) => o.spec.fields.wykonanoAt as Date, tytul: (o) => `Raport z zastępstwa ${o.numer}`, tresc: () => `${name("ZM")}: Odroczona. Potwierdź wykonanie w ciągu 48 h.`, link: own },
    { who: "K", ref: "P_WYBRANO", przeczytane: false, at: (o) => o.spec.fields.wybranoAt as Date, tytul: (o) => `Wybrano Cię do zastępstwa ${o.numer}`, tresc: (o) => `${o.spec.fields.tytul} · ${term(o)}. Potwierdź przyjęcie do ${formatShort(o.spec.fields.potwierdzenieDo as Date)}.`, link: accepted },
    { who: "K", ref: "K_REZYGNACJA", przeczytane: true, at: () => c.ago(30), tytul: (o) => `${name("NW")} rezygnuje z ${o.numer}`, tresc: (o) => `${o.spec.fields.tytul} · ${term(o)}. Wybierz innego zastępcę.`, link: own },
    { who: "K", ref: "G_PILNE", przeczytane: true, at: (o) => o.spec.numberedAt!, tytul: () => "Pilne zastępstwo w Twojej okolicy", tresc: (o) => `${o.spec.fields.tytul} · ${czynnoscLabel(o.spec.fields.czynnosc)} · ${o.spec.fields.miejsce} · ${term(o)}`, link: (o) => `${PANEL}?zlecenie=${o.id}` },
    { who: "K", ref: "K_AUTO", przeczytane: true, at: (o) => o.spec.fields.zamknietoAt as Date, tytul: (o) => `Zlecenie ${o.numer} zamknięte automatycznie`, tresc: (o) => `${o.spec.fields.tytul} · minęło 48 h od raportu zastępcy. Możesz jeszcze ocenić współpracę.`, link: own },
    { who: "K", ref: "P_ANULOWANE", przeczytane: true, at: (o) => o.spec.fields.anulowanoAt as Date, tytul: (o) => `Zlecenie ${o.numer} zostało anulowane`, tresc: (o) => `${o.spec.fields.tytul} · powód: ${o.spec.fields.powodAnulowania}`, link: accepted },
    { who: "ZM", ref: "K_ZAPYTANIE", przeczytane: false, at: (o) => o.spec.numberedAt!, tytul: () => `${name("K")} prosi Cię o zastępstwo`, tresc: (o) => `${o.spec.fields.tytul} · ${czynnoscLabel(o.spec.fields.czynnosc)} · ${o.spec.fields.miejsce} · ${term(o)} · ${o.spec.fields.stawka} zł netto. Odpowiedz do ${formatShort(o.spec.fields.zapytanieWazneDo as Date)}.`, link: () => PANEL },
    { who: "JK", ref: "J_POTWIERDZONE", przeczytane: true, at: (o) => o.spec.fields.wybranoAt as Date, tytul: (o) => `Wybrano Cię do zastępstwa ${o.numer}`, tresc: (o) => `${o.spec.fields.tytul} · ${term(o)}. Potwierdź przyjęcie do ${formatShort(o.spec.fields.potwierdzenieDo as Date)}.`, link: accepted },
    { who: "W", ref: "J_POTWIERDZONE", przeczytane: false, at: (o) => o.spec.fields.potwierdzonoAt as Date, tytul: (o) => `${name("JK")} potwierdza przyjęcie ${o.numer}`, tresc: (o) => `${o.spec.fields.tytul} · ${term(o)}.`, link: own },
  ];
}

// ---------------------------------------------------------------------------
// Główna funkcja
// ---------------------------------------------------------------------------

/** Pola, które mogą wskazywać przyszłość — reszta dat to zdarzenia, które już zaszły. */
const FUTURE_FIELDS = new Set(["termin", "ofertyDo", "potwierdzenieDo", "zapytanieWazneDo", "raportKolejnyTermin"]);

export async function seedSubstitutions(prisma: PrismaClient, now = new Date()) {
  console.log("Seeding zastępstw procesowych (konta aplikantów, ustawienia, zlecenia, oferty, pliki, powiadomienia)...");
  const c = makeClock(now);

  await clearSubstitutions(prisma);
  await ensureNewAccounts(prisma, now);
  const firms = await loadFirms(prisma);
  const idOf = (who: Who) => firms[who].id;
  const name = (who: Who) => displayName(firms[who]);

  // Ustawienia zastępców
  const settings = settingsFor(c);
  for (const [who, data] of Object.entries(settings) as [Who, NonNullable<(typeof settings)[Who]>][]) {
    await prisma.substitutionSettings.create({ data: { ...data, lawFirmId: idOf(who) } });
  }

  // Zlecenia: numery nadajemy chronologicznie, osobno w każdym roku (jak nextSubstitutionNumber)
  const specs = [...history().map((h, i) => historyOrder(c, h, i)), ...currentOrders(c)];
  for (const spec of specs) {
    const offerers = (spec.offers ?? []).map((o) => o.who);
    if (new Set(offerers).size !== offerers.length) throw new Error(`[seed zastępstw] Powtórzona oferta w „${spec.fields.tytul}”`);
    if (offerers.includes(spec.by)) throw new Error(`[seed zastępstw] Oferta zlecającego we własnym zleceniu „${spec.fields.tytul}”`);
    const events = [
      spec.numberedAt,
      spec.createdAt,
      spec.updatedAt,
      ...(spec.offers ?? []).flatMap((o) => [o.at, o.rezygnacjaAt]),
      ...(spec.files ?? []).map((f) => f.at),
      ...Object.entries(spec.fields).filter(([key]) => !FUTURE_FIELDS.has(key)).map(([, value]) => value),
    ];
    if (events.some((value) => value instanceof Date && value > now)) {
      throw new Error(`[seed zastępstw] Zdarzenie z przyszłości w „${spec.fields.tytul}”`);
    }
  }

  const numbered = specs.filter((s) => s.numberedAt).sort((a, b) => a.numberedAt!.getTime() - b.numberedAt!.getTime());
  const counters = new Map<string, number>();
  const numbers = new Map<OrderSpec, string>();
  for (const spec of numbered) {
    const year = warsawDay(spec.numberedAt!).slice(0, 4);
    const next = (counters.get(year) ?? 0) + 1;
    counters.set(year, next);
    numbers.set(spec, `ZAS/${year}/${String(next).padStart(4, "0")}`);
  }

  const seeded: SeededOrder[] = [];
  let fileCount = 0;
  for (const spec of [...numbered, ...specs.filter((s) => !s.numberedAt)]) {
    const created = await prisma.substitution.create({
      data: {
        ...spec.fields,
        numer: numbers.get(spec) ?? null,
        status: spec.status,
        zlecajacyId: idOf(spec.by),
        zastepcaId: spec.zastepca ? idOf(spec.zastepca) : null,
        zapytanieDoId: spec.zapytanieDo ? idOf(spec.zapytanieDo) : null,
        createdAt: spec.createdAt,
        updatedAt: spec.updatedAt ?? spec.createdAt,
        poufne: spec.poufne ? { create: sealConfidential(spec.poufne) } : undefined,
        oferty: spec.offers?.length
          ? {
              create: spec.offers.map((o) => ({
                lawFirmId: idOf(o.who),
                stawka: o.stawka,
                notatka: o.notatka ?? null,
                fakturaVat: o.fakturaVat ?? false,
                status: o.status,
                rezygnacjaAt: o.rezygnacjaAt ?? null,
                rezygnacjaPozno: o.rezygnacjaPozno ?? false,
                createdAt: o.at,
                updatedAt: o.rezygnacjaAt ?? o.at,
              })),
            }
          : undefined,
      },
      select: { id: true, numer: true },
    });

    for (const file of spec.files ?? []) {
      const stored = await materializeFile(created.id, file);
      if (!stored) continue;
      await prisma.substitutionFile.create({
        data: { substitutionId: created.id, dodalId: idOf(file.who), rodzaj: file.rodzaj, nazwa: file.nazwa, createdAt: file.at, ...stored },
      });
      fileCount++;
    }
    seeded.push({ id: created.id, numer: created.numer, spec });
  }

  // Powiadomienia w dzwonku
  let notificationCount = 0;
  for (const n of notifications(c, name)) {
    const order = seeded.find((o) => o.spec.ref === n.ref);
    if (!order) continue;
    await prisma.notification.create({
      data: {
        userId: firms[n.who].userId,
        typ: "ZASTEPSTWO",
        tytul: n.tytul(order),
        tresc: n.tresc(order),
        linkUrl: n.link(order),
        przeczytane: n.przeczytane,
        createdAt: n.at(order),
      },
    });
    notificationCount++;
  }

  const byStatus = seeded.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.spec.status]: (acc[o.spec.status] ?? 0) + 1 }), {});
  console.log(
    `✓ Zastępstwa: ${seeded.length} zleceń (${Object.entries(byStatus).map(([s, n]) => `${s} ${n}`).join(", ")}), ` +
      `${seeded.reduce((sum, o) => sum + (o.spec.offers?.length ?? 0), 0)} ofert, ${fileCount} plików, ` +
      `${Object.keys(settings).length} ustawień zastępców, ${notificationCount} powiadomień`
  );

  return { orders: seeded.length, files: fileCount, notifications: notificationCount };
}
