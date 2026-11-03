"use client"

import { CancelDialog } from "@/components/zastepstwa/CancelDialog"
import { ConfidentialCard } from "@/components/zastepstwa/ConfidentialCard"
import { OrderFiles } from "@/components/zastepstwa/Files"
import { OfferCard, StarRating } from "@/components/zastepstwa/OfferCard"
import {
  Countdown,
  DefinitionList,
  EmptyState,
  IdBadge,
  InfoBox,
  LoadingState,
  Panel,
  PanelTitle,
  StatusPill,
  Timeline,
  ToggleChip,
  UrgentPill,
  type TimelineItem,
} from "@/components/zastepstwa/ui"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/sonner"
import { apiFetch, errorMessage, notifySubstitutionsChanged, PANEL, postJson, zl } from "@/lib/substitutions/client"
import {
  AUTO_CLOSE_HOURS,
  czynnoscLabel,
  dziedzinaLabel,
  ktoryTerminText,
  przebiegLabel,
  rolaLabel,
} from "@/lib/substitutions/constants"
import { formatShort, formatTermin } from "@/lib/substitutions/time"
import type { OfferDTO, OwnerOrderDTO } from "@/lib/substitutions/types"
import { formatOffersCount } from "@/lib/format"
import {
  ArrowLeft,
  Archive,
  Bell,
  CircleCheck,
  Clock,
  FileText,
  Hourglass,
  Loader2,
  Lock,
  Mail,
  MapPinCheck,
  Pencil,
  Phone,
  Send,
  ShieldCheck,
  Star,
  X,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

type SortKey = "stawka" | "ocena" | "zastepstwa"

function timeline(o: OwnerOrderDTO): TimelineItem[] {
  const substitute = o.zastepca?.nazwa
  const steps = [
    {
      title: o.zapytanieDo ? `Zapytanie do: ${o.zapytanieDo.nazwa}` : "Opublikowane",
      note: o.status === "ZAPYTANIE" && o.zapytanieWazneDo
        ? `odpowiedź do ${formatShort(o.zapytanieWazneDo)}`
        : o.opublikowanoAt
          ? `${o.zapytanieDo ? "na giełdzie od " : ""}${formatShort(o.opublikowanoAt)}`
          : o.zapytanieDo && o.zapytanieOdpowiedz === "PRZYJETE"
            ? "przyjęte bez giełdy"
            : null,
    },
    { title: "Oferty", note: o.liczbaOfert ? formatOffersCount(o.liczbaOfert) : "czekamy na pierwszą" },
    { title: "Wybór zastępcy", note: o.wybranoAt ? `${substitute ?? ""}, ${formatShort(o.wybranoAt)}` : "decydujesz Ty" },
    { title: "Potwierdzenie przyjęcia", note: o.potwierdzonoAt ? formatShort(o.potwierdzonoAt) : "zastępca klika „Potwierdzam przyjęcie”" },
    { title: "Raport po czynności", note: o.raport?.wykonanoAt ? formatShort(o.raport.wykonanoAt) : "przebieg, kolejny termin, notatka" },
    {
      title: "Zamknięte",
      note: o.zamknietoAt
        ? `${formatShort(o.zamknietoAt)}${o.zamknietoAutomatycznie ? ", automatycznie po 48 h" : ""}`
        : "po Twoim potwierdzeniu albo po 48 h",
    },
  ]
  const reached = o.zamknietoAt ? 6 : o.raport?.wykonanoAt ? 5 : o.potwierdzonoAt ? 4 : o.wybranoAt ? 3 : o.liczbaOfert ? 2 : o.opublikowanoAt || o.status === "ZAPYTANIE" ? 1 : 0
  const position =
    { SZKIC: 0, ZAPYTANIE: 0, OPUBLIKOWANE: o.liczbaOfert ? 2 : 1, PRZYDZIELONE: 3, POTWIERDZONE: 4, WYKONANE: 5, ZAMKNIETE: 6 }[
      o.status as string
    ] ?? reached

  const items: TimelineItem[] = steps.map((step, index) => ({
    ...step,
    state: index < position ? "ok" : index === position ? "teraz" : "przyszle",
  }))
  if (o.status === "ANULOWANE" || o.status === "WYGASLO") {
    return [
      ...items.slice(0, reached).map((i) => ({ ...i, state: "ok" as const })),
      {
        state: "teraz",
        title: o.status === "ANULOWANE" ? "Anulowane" : "Wygasło",
        note: o.status === "ANULOWANE" ? `${o.anulowanoAt ? formatShort(o.anulowanoAt) : ""}${o.powodAnulowania ? ` · ${o.powodAnulowania}` : ""}` : "termin minął bez zastępcy",
      },
    ]
  }
  return items
}

export default function OwnerOrderPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OwnerOrderDTO | null>(null)
  const [sort, setSort] = useState<SortKey>("stawka")
  const [choosing, setChoosing] = useState<OfferDTO | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [problemOpen, setProblemOpen] = useState(false)
  const [problemText, setProblemText] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const view = await apiFetch<{ widok: string; zlecenie: OwnerOrderDTO }>(`/api/substitutions/${id}`)
      if (view.widok === "substitute") {
        router.replace(`${PANEL}/przyjete?zlecenie=${id}`)
        return
      }
      if (view.widok !== "owner") {
        router.replace(`${PANEL}?zlecenie=${id}`)
        return
      }
      if (view.zlecenie.status === "SZKIC") {
        router.replace(`${PANEL}/dodaj?zlecenie=${id}`)
        return
      }
      setOrder(view.zlecenie)
    } catch (e) {
      toast.error(errorMessage(e))
      router.replace(`${PANEL}/moje`)
    }
  }, [id, router])

  useEffect(() => {
    const run = async () => {
      await load()
    }
    run()
  }, [load])

  const act = async (key: string, body: Record<string, unknown>) => {
    setBusy(key)
    try {
      const result = await postJson(`/api/substitutions/${id}/actions`, body)
      toast.success(result.message)
      notifySubstitutionsChanged()
      await load()
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    } finally {
      setBusy(null)
    }
  }

  const offers = useMemo(() => {
    const list = [...(order?.oferty ?? [])].filter((o) => o.status === "OCZEKUJE" || o.status === "ODRZUCONA")
    return list.sort((a, b) => {
      if (sort === "stawka") return a.stawka - b.stawka
      if (sort === "ocena") return (b.osoba.statystyki.ocena ?? 0) - (a.osoba.statystyki.ocena ?? 0)
      return b.osoba.statystyki.zastepstwa - a.osoba.statystyki.zastepstwa
    })
  }, [order, sort])

  if (!order) return <LoadingState text="Wczytywanie zlecenia..." />

  const selectedOffer = order.oferty.find((o) => o.status === "WYBRANA")
  const editable = ["ZAPYTANIE", "OPUBLIKOWANE"].includes(order.status)
  const cancellable = ["ZAPYTANIE", "OPUBLIKOWANE", "PRZYDZIELONE", "POTWIERDZONE"].includes(order.status)
  const final = ["ZAMKNIETE", "WYGASLO", "ANULOWANE"].includes(order.status)
  const confidentialEditable = !final && order.status !== "WYKONANE"
  const isAplikant = order.zastepca?.rola === "APLIKANT"
  const autoCloseAt = order.raport?.wykonanoAt
    ? new Date(new Date(order.raport.wykonanoAt).getTime() + AUTO_CLOSE_HOURS * 3600_000).toISOString()
    : null
  const term = formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia)
  const pending = order.oferty.filter((o) => o.status === "OCZEKUJE")

  const contact = order.zastepca && (
    <div className="mt-3.5 flex flex-wrap gap-2">
      {order.zastepca.kontakt.telefon && (
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${order.zastepca.kontakt.telefon}`}>
            <Phone className="mr-1.5 h-3.5 w-3.5" />
            {order.zastepca.kontakt.telefon}
          </a>
        </Button>
      )}
      {order.zastepca.kontakt.email && (
        <Button asChild variant="outline" size="sm">
          <a href={`mailto:${order.zastepca.kontakt.email}?subject=${encodeURIComponent(`Zastępstwo ${order.numer ?? ""}`)}`}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Napisz do zastępcy
          </a>
        </Button>
      )}
    </div>
  )

  const selectedCard = selectedOffer && (
    <OfferCard offer={selectedOffer} state="wybrana" />
  )

  return (
    <div className="relative space-y-5">
      <Link href={`${PANEL}/moje`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Moje zlecenia
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <IdBadge numer={order.numer} />
            <StatusPill status={order.status} liczbaOfert={pending.length} />
            {order.pilne && <UrgentPill />}
          </div>
          <h1 className="mt-2 font-playfair text-2xl font-semibold">{order.tytul}</h1>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {editable && (
            <Button asChild variant="ghost">
              <Link href={`${PANEL}/dodaj?zlecenie=${order.id}`}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edytuj
              </Link>
            </Button>
          )}
          {cancellable && (
            <Button variant="outline" className="border-error/50 text-error hover:bg-error/10 hover:text-error" onClick={() => setCancelOpen(true)}>
              <X className="mr-1.5 h-4 w-4" />
              Anuluj zlecenie
            </Button>
          )}
          {final && (
            <Button variant="outline" onClick={() => act("archive", { action: "archive", zarchiwizowane: !order.zarchiwizowane })}>
              <Archive className="mr-1.5 h-4 w-4" />
              {order.zarchiwizowane ? "Przywróć z archiwum" : "Archiwizuj"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {order.status === "ZAPYTANIE" && order.zapytanieDo && (
            <Panel>
              <PanelTitle
                right={
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary">
                    <Clock className="h-3.5 w-3.5" />
                    Na odpowiedź: <Countdown to={order.zapytanieWazneDo} />
                  </span>
                }
              >
                Zapytanie wysłane
              </PanelTitle>
              <OfferCard offer={{ stawka: order.stawka ?? 0, fakturaVat: order.fakturaVat, notatka: null, email: null, osoba: order.zapytanieDo }} />
              <InfoBox icon={Hourglass} className="mt-3.5">
                Czekamy na odpowiedź. Jeśli {order.zapytanieDo.nazwa} odmówi albo nie odpowie, zlecenie samo trafi na giełdę i
                powiadomimy pasujących prawników.
              </InfoBox>
            </Panel>
          )}

          {order.status === "OPUBLIKOWANE" && (
            <Panel>
              <PanelTitle
                right={
                  order.przyjmujeOferty ? (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary">
                      <Clock className="h-3.5 w-3.5" />
                      Oferty do {order.ofertyDo ? formatShort(order.ofertyDo) : "—"}: <Countdown to={order.ofertyDo} />
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Termin ofert minął — możesz jeszcze wybrać z listy</span>
                  )
                }
              >
                Oferty ({pending.length})
              </PanelTitle>
              {pending.length === 0 ? (
                <EmptyState icon={Hourglass} title="Czekamy na pierwsze oferty">
                  Powiadomiliśmy pasujących prawników. Każdą ofertę zobaczysz tutaj, a o każdej dostaniesz maila.
                </EmptyState>
              ) : (
                <>
                  <div className="mb-3.5 flex flex-wrap gap-2">
                    <ToggleChip active={sort === "stawka"} onClick={() => setSort("stawka")}>
                      Najniższa stawka
                    </ToggleChip>
                    <ToggleChip active={sort === "ocena"} onClick={() => setSort("ocena")}>
                      Najwyżej oceniani
                    </ToggleChip>
                    <ToggleChip active={sort === "zastepstwa"} onClick={() => setSort("zastepstwa")}>
                      Najwięcej zastępstw
                    </ToggleChip>
                  </div>
                  <div className="space-y-3">
                    {offers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        state={offer.status === "OCZEKUJE" ? undefined : "zgaszona"}
                        onChoose={offer.status === "OCZEKUJE" ? () => setChoosing(offer) : undefined}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Zgłaszający nie widzą siebie nawzajem ani danych sprawy. Po wyborze pozostali dostaną wiadomość, że zlecenie
                    jest obsadzone.
                  </p>
                </>
              )}
            </Panel>
          )}

          {order.status === "PRZYDZIELONE" && (
            <Panel>
              <PanelTitle>Wybrany zastępca</PanelTitle>
              {selectedCard}
              <InfoBox icon={Hourglass} className="mt-3.5">
                Czekamy, aż {order.zastepca?.nazwa} potwierdzi przyjęcie.
                {order.potwierdzenieDo &&
                  ` Jeśli nie zrobi tego do ${formatShort(order.potwierdzenieDo)}, wrócisz do pozostałych ofert jednym kliknięciem.`}
              </InfoBox>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => act("remind", { action: "remind" })} disabled={!!busy}>
                  {busy === "remind" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Bell className="mr-1.5 h-4 w-4" />}
                  Przypomnij
                </Button>
                <Button variant="ghost" onClick={() => act("unassign", { action: "unassign" })} disabled={!!busy}>
                  {busy === "unassign" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Zmień zastępcę
                </Button>
              </div>
              {contact}
            </Panel>
          )}

          {order.status === "POTWIERDZONE" && (
            <Panel>
              <PanelTitle>Zastępca</PanelTitle>
              {selectedCard}
              <InfoBox variant="success" icon={ShieldCheck} className="mt-3.5">
                {order.zastepca?.nazwa} potwierdził(a) przyjęcie{order.potwierdzonoAt ? ` ${formatShort(order.potwierdzonoAt)}` : ""}. Po
                czynności dostaniesz raport z przebiegiem i kolejnym terminem.
              </InfoBox>
              {order.naMiejscuAt && (
                <InfoBox icon={MapPinCheck} className="mt-2.5">
                  Zastępca jest na miejscu od {formatShort(order.naMiejscuAt)}.
                </InfoBox>
              )}
              {contact}
            </Panel>
          )}

          {(order.status === "WYKONANE" || (order.status === "ZAMKNIETE" && order.raport)) && order.raport && (
            <Panel>
              <PanelTitle
                right={
                  order.status === "WYKONANE" && !order.problemZgloszonoAt ? (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary">
                      <Clock className="h-3.5 w-3.5" />
                      Automatyczne zamknięcie za: <Countdown to={autoCloseAt} />
                    </span>
                  ) : null
                }
              >
                Raport zastępcy
              </PanelTitle>
              {order.zastepca && (
                <div className="mb-3.5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full text-[13px] font-bold text-white/90" style={{ backgroundColor: order.zastepca.kolor }}>
                    {order.zastepca.inicjaly}
                  </div>
                  <div>
                    <b>{order.zastepca.nazwa}</b>
                    <div className="text-xs text-muted-foreground">
                      oznaczył(a) jako wykonane {order.raport.wykonanoAt ? formatShort(order.raport.wykonanoAt) : ""}
                    </div>
                  </div>
                </div>
              )}
              <DefinitionList
                items={[
                  ["Przebieg", przebiegLabel(order.raport.przebieg)],
                  ["Kolejny termin", order.raport.kolejnyTermin ? formatTermin(order.raport.kolejnyTermin, true, false) : null],
                ]}
              />
              {order.raport.notatka && (
                <div className="mt-3 whitespace-pre-line rounded-lg border-l-[3px] border-primary bg-background/40 px-3 py-2.5 text-[13.5px] text-foreground/80">
                  {order.raport.notatka}
                </div>
              )}
              <OrderFiles orderId={order.id} files={order.pliki.filter((f) => f.rodzaj === "RAPORT")} />

              {order.problemZgloszonoAt && (
                <InfoBox variant="warn" className="mt-3.5">
                  Zgłosiłeś problem {formatShort(order.problemZgloszonoAt)}: {order.problemOpis}. Opiekun się z Wami skontaktuje — zlecenie
                  nie zamknie się automatycznie.
                </InfoBox>
              )}

              {(order.status === "WYKONANE" || order.ocena == null) && (
                <>
                  <div className="mb-2.5 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Star className="h-3.5 w-3.5" />
                    Oceń współpracę
                  </div>
                  <StarRating value={rating} onChange={setRating} />
                  <Textarea
                    className="mt-2.5"
                    rows={2}
                    maxLength={1000}
                    placeholder="Krótki komentarz, widoczny tylko dla prawników w module (opcjonalnie)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="mt-3.5 flex flex-wrap justify-end gap-2">
                    {order.status === "WYKONANE" && !order.problemZgloszonoAt && (
                      <Button variant="outline" className="border-error/50 text-error hover:bg-error/10 hover:text-error" onClick={() => setProblemOpen(true)}>
                        Zgłoś problem
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        act("complete", { action: "complete", ocena: rating || null, komentarz: comment.trim() || null })
                      }
                      disabled={!!busy || (order.status === "ZAMKNIETE" && !rating)}
                    >
                      {busy === "complete" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CircleCheck className="mr-1.5 h-4 w-4" />}
                      {order.status === "WYKONANE" ? "Potwierdzam wykonanie" : "Zapisz ocenę"}
                    </Button>
                  </div>
                </>
              )}
              {order.status === "ZAMKNIETE" && order.ocena != null && (
                <div className="mt-4 flex items-center gap-3">
                  <StarRating value={order.ocena} />
                  {order.ocenaKomentarz && <span className="text-[13px] text-muted-foreground">„{order.ocenaKomentarz}”</span>}
                </div>
              )}
            </Panel>
          )}

          {order.status === "ZAMKNIETE" && (
            <InfoBox variant="success" icon={CircleCheck}>
              Zlecenie zamknięte{order.zamknietoAt ? ` ${formatShort(order.zamknietoAt)}` : ""}
              {order.zamknietoAutomatycznie ? " automatycznie po 48 h" : ""}. Trafiło do{" "}
              <Link href={`${PANEL}/rozliczenia`} className="font-semibold text-primary hover:underline">
                rozliczeń
              </Link>
              .
            </InfoBox>
          )}
          {order.status === "WYGASLO" && <InfoBox variant="warn">Termin minął bez wybranego zastępcy. Zlecenie wygasło.</InfoBox>}
          {order.status === "ANULOWANE" && (
            <InfoBox variant="warn">
              Zlecenie anulowane{order.anulowanoAt ? ` ${formatShort(order.anulowanoAt)}` : ""}. Powód: {order.powodAnulowania}
            </InfoBox>
          )}
        </div>

        <div className="space-y-5">
          <Panel>
            <h2 className="mb-3 font-playfair text-base font-semibold">Podsumowanie</h2>
            <DefinitionList
              labelWidth="110px"
              items={[
                ["Miejsce", [order.miejsce, order.wydzial].filter(Boolean).join(", ")],
                ["Termin", term],
                ["Czynność", [czynnoscLabel(order.czynnosc), ktoryTerminText(order.ktoryTermin)].filter(Boolean).join(", ")],
                ["Dziedzina", dziedzinaLabel(order.dziedzina)],
                ["Rola", rolaLabel(order.rolaZastepcy)],
                [
                  "Wynagrodz.",
                  `${order.stawkaUzgodniona ? `${zl(order.stawkaUzgodniona)} netto (uzgodnione)` : order.stawka ? `${zl(order.stawka)} netto` : "czekam na propozycje"}${order.fakturaVat ? ", faktura VAT" : ""}`,
                ],
                ["Wybór", order.trybWyboru === "WYBIERAM" ? "wybieram sam" : "pierwszy, kto przyjmie"],
                ["Pilne", order.pilne ? `tak${order.pilnePunkty ? `, ${order.pilnePunkty} pkt` : ""}` : null],
              ]}
            />
          </Panel>
          <Panel>
            <h2 className="mb-3.5 font-playfair text-base font-semibold">Przebieg</h2>
            <Timeline items={timeline(order)} />
          </Panel>
          <ConfidentialCard
            orderId={order.id}
            data={order.poufne}
            files={order.pliki.filter((f) => f.rodzaj !== "RAPORT")}
            editable={confidentialEditable}
            note={
              order.zastepca && order.status !== "ANULOWANE"
                ? "Widzisz Ty i wybrany zastępca."
                : final
                  ? "Widzisz tylko Ty."
                  : "Widzisz tylko Ty. Odsłonimy je osobie, którą wybierzesz."
            }
            onSaved={(poufne) => setOrder({ ...order, poufne })}
            onFilesChange={(files) => setOrder({ ...order, pliki: [...files, ...order.pliki.filter((f) => f.rodzaj === "RAPORT")] })}
            powerOfAttorneyLabel={isAplikant ? "Wzór upoważnienia dla aplikanta" : "Wzór pełnomocnictwa substytucyjnego"}
          />
        </div>
      </div>

      <Dialog open={!!choosing} onOpenChange={(open) => !open && setChoosing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wybierasz: {choosing?.osoba.nazwa}</DialogTitle>
            <DialogDescription>
              Stawka {zl(choosing?.stawka)} netto{choosing?.fakturaVat ? ", faktura VAT" : ""}.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2.5 text-[13.5px] text-foreground/80">
            <li className="flex gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 flex-none text-primary" />
              Odsłonimy sygnaturę, dane stron, Twoją instrukcję i pliki.
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-primary" />
              Poprosimy o potwierdzenie przyjęcia{choosing?.osoba.rola === "APLIKANT" ? "." : " substytucji."}
            </li>
            <li className="flex gap-2.5">
              <Send className="mt-0.5 h-4 w-4 flex-none text-primary" />
              Pozostałe osoby dostaną wiadomość, że zlecenie jest obsadzone.
            </li>
            <li className="flex gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 flex-none text-primary" />
              {choosing?.osoba.rola === "APLIKANT"
                ? "Upoważnienie dla aplikanta wystawiasz sam. W zestawie jest wzór."
                : "Pełnomocnictwo substytucyjne wystawiasz sam. W zestawie jest wzór."}
            </li>
          </ul>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setChoosing(null)}>
              Wróć
            </Button>
            <Button
              onClick={async () => {
                if (!choosing) return
                const ok = await act("select", { action: "select", offerId: choosing.id })
                if (ok) setChoosing(null)
              }}
              disabled={!!busy}
            >
              {busy === "select" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CircleCheck className="mr-1.5 h-4 w-4" />}
              Wybieram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={problemOpen} onOpenChange={setProblemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zgłoś problem z zastępstwem</DialogTitle>
            <DialogDescription>
              Zgłoszenie trafi do opiekuna, a zlecenie nie zamknie się automatycznie. Zastępca dostanie informację.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="problem" className="mb-1.5 block text-[12.5px]">
              Co się stało? <span className="text-error">*</span>
            </Label>
            <Textarea id="problem" rows={4} maxLength={2000} value={problemText} onChange={(e) => setProblemText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProblemOpen(false)}>
              Wróć
            </Button>
            <Button
              variant="destructive"
              disabled={!!busy}
              onClick={async () => {
                const ok = await act("problem", { action: "problem", opis: problemText.trim() })
                if (ok) {
                  setProblemOpen(false)
                  setProblemText("")
                }
              }}
            >
              {busy === "problem" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Zgłoś problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CancelDialog
        order={cancelOpen ? { id: order.id, numer: order.numer, tytul: order.tytul, hasSubstitute: !!order.zastepca } : null}
        onClose={() => setCancelOpen(false)}
        onDone={() => {
          setCancelOpen(false)
          load()
        }}
      />
    </div>
  )
}
