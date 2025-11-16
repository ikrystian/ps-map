"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Dynamic import of MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

interface LawFirmLocation {
  id: string
  nazwa: string
  slug: string
  miasto: string
  voivodeship: {
    nazwa: string
  }
  latitude: number
  longitude: number
  logo?: string | null
  opis?: string | null
}

interface LawFirmMapProps {
  lawFirms?: LawFirmLocation[]
  height?: string
  zoom?: number
  center?: [number, number]
}

export default function LawFirmMap({
  lawFirms: initialLawFirms,
  height = "600px",
  zoom = 6,
  center = [52.0693, 19.4803], // Center of Poland
}: LawFirmMapProps) {
  const [lawFirms, setLawFirms] = useState<LawFirmLocation[]>(initialLawFirms || [])
  const [loading, setLoading] = useState(!initialLawFirms)

  useEffect(() => {
    // If law firms weren't provided as props, fetch them
    if (!initialLawFirms) {
      fetchLawFirms()
    }
  }, [initialLawFirms])

  const fetchLawFirms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/law-firms/map")
      if (response.ok) {
        const data = await response.json()
        setLawFirms(data)
      }
    } catch (error) {
      console.error("Error fetching law firms:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie mapy...</p>
        </div>
      </div>
    )
  }

  // Filter law firms that have coordinates
  const lawFirmsWithCoordinates = lawFirms.filter(
    (firm) => firm.latitude && firm.longitude
  )

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lawFirmsWithCoordinates.map((firm) => (
          <Marker
            key={firm.id}
            position={[firm.latitude, firm.longitude]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-3 mb-2">
                  {firm.logo && (
                    <img
                      src={firm.logo}
                      alt={firm.nazwa}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      {firm.nazwa}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {firm.miasto}, {firm.voivodeship.nazwa}
                    </p>
                  </div>
                </div>
                {firm.opis && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {firm.opis}
                  </p>
                )}
                <a
                  href={`/kancelaria/${firm.slug}`}
                  className="inline-block w-full text-center bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Zobacz profil
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Info badge */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-[1000]">
        <p className="text-sm font-medium">
          Znaleziono: <span className="text-primary font-semibold">{lawFirmsWithCoordinates.length}</span> kancelarii
        </p>
      </div>
    </div>
  )
}
