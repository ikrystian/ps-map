"use client"

import "mapbox-gl/dist/mapbox-gl.css"

import {
  Award,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import MapboxMap, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/mapbox"
import Supercluster from "supercluster"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface MapExpert {
  id: string
  nazwa: string
  slug: string
  avatar: string | null
  opis: string | null
  bieglySadowy: boolean
  stronaWww: string | null
  telefon: string | null
  adres: string | null
  kodPocztowy: string | null
  miasto: string | null
  voivodeship: string | null
  lat: number
  lng: number
  mainCategory: string | null
  categories: string[]
  liczbaOpinii: number
  sredniaOcen: number | null
}

// Środek kraju i zoom obejmujący całą Polskę.
const POLAND_CENTER = { longitude: 19.48, latitude: 52.07 }
const POLAND_ZOOM = 5.4

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

// Styl dobierany do motywu aplikacji — jasna mapa na ciemnej stronie razi.
const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11"
const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11"

/** Bounding box widocznego fragmentu mapy, w formacie oczekiwanym przez supercluster. */
type Bbox = [number, number, number, number]

/** Właściwości punktu w indeksie klastrów — reszta danych zostaje w `experts`. */
type PointProps = { expertId: string }

function initials(nazwa: string) {
  return nazwa
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

/** Avatar eksperta w formie pinezki. */
function ExpertPin({
  expert,
  active,
}: {
  expert: MapExpert
  active: boolean
}) {
  return (
    <div
      className={`relative transition-transform duration-200 cursor-pointer ${
        active ? "scale-110 z-10" : "hover:scale-105"
      }`}
      title={expert.nazwa}
    >
      <div
        className={`h-12 w-12 rounded-full overflow-hidden border-2 shadow-lg bg-background flex items-center justify-center ${
          active ? "border-primary ring-4 ring-primary/30" : "border-white"
        }`}
      >
        {expert.avatar ? (
          // Logo pochodzi z zewnętrznego serwisu uploadu — <img> omija
          // konfigurację remotePatterns next/image dla dowolnych domen.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={expert.avatar}
            alt={expert.nazwa}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-semibold text-primary">
            {initials(expert.nazwa)}
          </span>
        )}
      </div>
      {/* Dzióbek pinezki */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-3 w-3 rotate-45 border-b-2 border-r-2 bg-background ${
          active ? "border-primary" : "border-white"
        }`}
      />
      {expert.bieglySadowy && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center shadow">
          <Award className="h-2.5 w-2.5 text-primary-foreground" />
        </span>
      )}
    </div>
  )
}

/** Bąbelek zastępujący grupę pinezek przy oddaleniu. */
function ClusterPin({ count }: { count: number }) {
  // Bąbelek rośnie z liczbą ekspertów, ale nie w nieskończoność.
  const size = Math.min(64, 36 + Math.log2(count + 1) * 8)

  return (
    <div
      className="rounded-full bg-primary text-primary-foreground font-semibold
                 flex items-center justify-center shadow-lg cursor-pointer
                 ring-4 ring-primary/25 transition-transform hover:scale-105"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {count}
    </div>
  )
}

/** Panel ze szczegółami wybranego eksperta. */
function ExpertDetails({
  expert,
  onClose,
}: {
  expert: MapExpert
  onClose: () => void
}) {
  const adresPelny = [
    expert.adres,
    [expert.kodPocztowy, expert.miasto].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <aside
      className="absolute z-20 bg-background border border-border shadow-2xl overflow-y-auto
                 inset-x-0 bottom-0 max-h-[65%] rounded-t-2xl
                 md:inset-y-4 md:right-4 md:left-auto md:w-[380px] md:max-h-none md:rounded-2xl"
      aria-label={`Szczegóły: ${expert.nazwa}`}
    >
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
          {expert.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={expert.avatar}
              alt={expert.nazwa}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-primary">
              {initials(expert.nazwa)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-playfair text-lg font-bold leading-tight text-foreground">
            {expert.nazwa}
          </h2>
          {(expert.miasto || expert.voivodeship) && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {[expert.miasto, expert.voivodeship].filter(Boolean).join(", ")}
            </p>
          )}
          {expert.sredniaOcen !== null && (
            <p className="text-xs mt-1 flex items-center gap-1 text-foreground/80">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="font-semibold">{expert.sredniaOcen}</span>
              <span className="text-muted-foreground">
                ({expert.liczbaOpinii}{" "}
                {expert.liczbaOpinii === 1 ? "opinia" : "opinii"})
              </span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij szczegóły"
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {expert.bieglySadowy && (
          <Badge variant="secondary" className="gap-1">
            <Award className="h-3 w-3" />
            Biegły sądowy
          </Badge>
        )}

        {expert.opis && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {expert.opis}
            {expert.opis.length >= 220 && "…"}
          </p>
        )}

        {(expert.mainCategory || expert.categories.length > 0) && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Specjalizacje
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {expert.mainCategory && (
                <Badge variant="default" className="text-xs">
                  {expert.mainCategory}
                </Badge>
              )}
              {expert.categories
                .filter((c) => c !== expert.mainCategory)
                .map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {(adresPelny || expert.telefon || expert.stronaWww) && (
          <div className="space-y-2 text-sm">
            {adresPelny && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>{adresPelny}</span>
              </p>
            )}
            {expert.telefon && (
              <a
                href={`tel:${expert.telefon.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {expert.telefon}
              </a>
            )}
            {expert.stronaWww && (
              <a
                href={expert.stronaWww}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors break-all"
              >
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                {expert.stronaWww.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button asChild className="flex-1">
            <Link href={`/ekspert/${expert.slug}`}>Zobacz profil</Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                adresPelny ? `${adresPelny}, Polska` : `${expert.lat},${expert.lng}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Dojazd
            </a>
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default function MapClientPage() {
  const [experts, setExperts] = useState<MapExpert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<MapExpert | null>(null)

  const mapRef = useRef<MapRef>(null)
  const { resolvedTheme } = useTheme()

  // Klastry liczymy dla aktualnego kadru, więc trzymamy bbox i zoom w stanie.
  const [viewport, setViewport] = useState<{ bbox: Bbox; zoom: number }>({
    bbox: [14, 48.9, 24.2, 55],
    zoom: POLAND_ZOOM,
  })

  useEffect(() => {
    let cancelled = false

    fetch("/api/experts/map")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { experts: MapExpert[] }) => {
        if (!cancelled) setExperts(data.experts ?? [])
      })
      .catch(() => {
        if (!cancelled) setError("Nie udało się wczytać ekspertów.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const expertsById = useMemo(
    () => new Map(experts.map((expert) => [expert.id, expert])),
    [experts]
  )

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<PointProps>({ radius: 60, maxZoom: 14 })
    index.load(
      experts.map((expert) => ({
        type: "Feature" as const,
        properties: { expertId: expert.id },
        geometry: {
          type: "Point" as const,
          coordinates: [expert.lng, expert.lat],
        },
      }))
    )
    return index
  }, [experts])

  const clusters = useMemo(
    () => clusterIndex.getClusters(viewport.bbox, Math.round(viewport.zoom)),
    [clusterIndex, viewport]
  )

  const syncViewport = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const bounds = map.getBounds()
    if (!bounds) return
    setViewport({
      bbox: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom: map.getZoom(),
    })
  }, [])

  const handleLoad = useCallback(() => {
    // Etykiety po polsku zamiast nazw lokalnych (np. cyrylicy za wschodnią granicą).
    mapRef.current?.getMap().setLanguage?.("pl")
    syncViewport()
  }, [syncViewport])

  /** Kliknięcie w bąbelek przybliża do poziomu, na którym grupa się rozpada. */
  const expandCluster = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      const zoom = clusterIndex.getClusterExpansionZoom(clusterId)
      mapRef.current?.easeTo({
        center: [longitude, latitude],
        zoom: Math.min(zoom, 16),
        duration: 500,
      })
    },
    [clusterIndex]
  )

  const subtitle = useMemo(() => {
    if (loading) return "Wczytywanie ekspertów…"
    if (error) return error
    if (experts.length === 0) return "Brak ekspertów z ustaloną lokalizacją."
    return `${experts.length} ${
      experts.length === 1 ? "ekspert" : "ekspertów"
    } na mapie — kliknij avatar, aby zobaczyć szczegóły.`
  }, [loading, error, experts.length])

  return (
    <div className="flex flex-col">
      <header className="container mx-auto px-4 pt-10 pb-6">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Mapa ekspertów
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          {subtitle}
        </p>
      </header>

      <div className="container mx-auto px-4 pb-16">
        <div className="relative w-full h-[70vh] min-h-[480px] rounded-2xl overflow-hidden border border-border shadow-sm bg-muted">
          {!MAPBOX_TOKEN ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground max-w-md">
                Mapa jest niedostępna — brak skonfigurowanego tokenu
                <code className="mx-1 px-1 py-0.5 rounded bg-muted-foreground/10 text-xs">
                  NEXT_PUBLIC_MAPBOX_TOKEN
                </code>
                .
              </p>
            </div>
          ) : (
            <>
              <MapboxMap
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{ ...POLAND_CENTER, zoom: POLAND_ZOOM }}
                mapStyle={
                  resolvedTheme === "light" ? MAP_STYLE_LIGHT : MAP_STYLE_DARK
                }
                onLoad={handleLoad}
                onMove={syncViewport}
                onClick={() => setSelected(null)}
                reuseMaps
                style={{ width: "100%", height: "100%" }}
              >
                <NavigationControl position="top-right" showCompass={false} />

                {clusters.map((feature) => {
                  const [longitude, latitude] = feature.geometry.coordinates

                  if (feature.properties.cluster) {
                    const clusterId = feature.properties.cluster_id
                    return (
                      <Marker
                        key={`cluster-${clusterId}`}
                        longitude={longitude}
                        latitude={latitude}
                        onClick={(event) => {
                          event.originalEvent.stopPropagation()
                          expandCluster(clusterId, longitude, latitude)
                        }}
                      >
                        <ClusterPin count={feature.properties.point_count} />
                      </Marker>
                    )
                  }

                  const expert = expertsById.get(feature.properties.expertId)
                  if (!expert) return null

                  return (
                    <Marker
                      key={expert.id}
                      longitude={longitude}
                      latitude={latitude}
                      anchor="bottom"
                      onClick={(event) => {
                        event.originalEvent.stopPropagation()
                        setSelected(expert)
                      }}
                    >
                      <ExpertPin
                        expert={expert}
                        active={selected?.id === expert.id}
                      />
                    </Marker>
                  )
                })}
              </MapboxMap>

              {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {selected && (
                <ExpertDetails
                  expert={selected}
                  onClose={() => setSelected(null)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
