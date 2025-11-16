"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface LawFirm {
  id: string
  nazwa: string
  slug: string
  adres: string
  kodPocztowy: string
  miasto: string
  latitude: number | null
  longitude: number | null
  logo: string | null
  opis: string | null
  numerTelefonu: string
  emailKontakt: string
  voivodeship: string
  categories: string[]
  avgRating: number
  reviewsCount: number
}

interface GoogleMapProps {
  lawFirms: LawFirm[]
  apiKey: string
}

export default function GoogleMap({ lawFirms, apiKey }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sprawdź dark mode przy montowaniu
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    }

    checkDarkMode()

    // Obserwuj zmiany dark mode
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Załaduj Google Maps API
    const loadGoogleMapsScript = () => {
      if (typeof window.google !== "undefined" && window.google.maps) {
        initMap()
        return
      }

      // Sprawdź czy skrypt już istnieje
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      )
      if (existingScript) {
        existingScript.addEventListener("load", initMap)
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => initMap()
      script.onerror = () => {
        setError("Nie udało się załadować Google Maps")
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!mapRef.current) return

      try {
        // Centrum Polski
        const polandCenter = { lat: 52.0693, lng: 19.4803 }

        // Styl dark mode dla Google Maps
        const darkModeStyles: google.maps.MapTypeStyle[] = [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9080" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3751ff" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ]

        const lightModeStyles: google.maps.MapTypeStyle[] = []

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: polandCenter,
          zoom: 6,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: isDarkMode ? darkModeStyles : lightModeStyles,
        })

        setMap(mapInstance)
        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Błąd podczas inicjalizacji mapy")
        setIsLoading(false)
      }
    }

    loadGoogleMapsScript()
  }, [apiKey, isDarkMode])

  useEffect(() => {
    if (!map) return

    // Usuń poprzednie markery
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Utwórz InfoWindow (jeden dla wszystkich markerów)
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow()
    }

    // Utwórz geocoder
    const geocoder = new google.maps.Geocoder()
    const bounds = new google.maps.LatLngBounds()
    let processedCount = 0

    const createMarker = (firm: LawFirm, position: google.maps.LatLng) => {
      const marker = new google.maps.Marker({
        position,
        map,
        title: firm.nazwa,
        animation: google.maps.Animation.DROP,
      })

      // Rozszerz bounds
      bounds.extend(position)

      // Dodaj event listener dla kliknięcia
      marker.addListener("click", () => {
        const bgColor = isDarkMode ? "#282825" : "#ffffff"
        const textColor = isDarkMode ? "#c3c0b6" : "#3d3929"
        const linkColor = isDarkMode ? "#00897b" : "#2563eb"

        const contentString = `
          <div style="max-width: 300px; padding: 10px; background-color: ${bgColor}; color: ${textColor}; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: ${textColor};">
              ${firm.nazwa}
            </h3>
            ${
              firm.logo
                ? `<img src="${firm.logo}" alt="${firm.nazwa}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />`
                : ""
            }
            <p style="margin: 5px 0; font-size: 14px; color: ${textColor};">
              <strong>Adres:</strong><br/>
              ${firm.adres}<br/>
              ${firm.kodPocztowy} ${firm.miasto}
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: ${textColor};">
              <strong>Województwo:</strong> ${firm.voivodeship}
            </p>
            ${
              firm.categories.length > 0
                ? `<p style="margin: 5px 0; font-size: 14px; color: ${textColor};">
                    <strong>Specjalizacje:</strong><br/>
                    ${firm.categories.slice(0, 3).join(", ")}
                  </p>`
                : ""
            }
            ${
              firm.avgRating > 0
                ? `<p style="margin: 5px 0; font-size: 14px; color: ${textColor};">
                    <strong>Ocena:</strong> ${firm.avgRating}/5 ⭐ (${firm.reviewsCount} ${
                    firm.reviewsCount === 1 ? "opinia" : "opinii"
                  })
                  </p>`
                : ""
            }
            <p style="margin: 10px 0 5px 0;">
              <a href="/kancelaria/${firm.slug}" target="_blank" style="color: ${linkColor}; text-decoration: none; font-weight: 500;">
                Zobacz profil →
              </a>
            </p>
          </div>
        `

        infoWindowRef.current?.setContent(contentString)
        infoWindowRef.current?.open(map, marker)
      })

      markersRef.current.push(marker)
    }

    // Przetwórz każdą kancelarię
    lawFirms.forEach((firm, index) => {
      // Jeśli kancelaria ma już współrzędne, użyj ich
      if (firm.latitude && firm.longitude) {
        const position = new google.maps.LatLng(firm.latitude, firm.longitude)
        createMarker(firm, position)
        processedCount++

        // Dopasuj mapę po przetworzeniu wszystkich
        if (processedCount === lawFirms.length && markersRef.current.length > 0) {
          map.fitBounds(bounds)
          if (markersRef.current.length === 1) {
            map.setZoom(12)
          }
        }
      } else {
        // Geokoduj adres
        const fullAddress = `${firm.adres}, ${firm.kodPocztowy} ${firm.miasto}, Polska`

        // Dodaj opóźnienie dla każdego żądania geokodowania (aby uniknąć limitów API)
        setTimeout(() => {
          geocoder.geocode({ address: fullAddress }, (results, status) => {
            processedCount++

            if (status === "OK" && results && results[0]) {
              const position = results[0].geometry.location
              createMarker(firm, position)
            } else {
              console.warn(`Nie udało się geokodować adresu dla: ${firm.nazwa}`, status)
            }

            // Dopasuj mapę po przetworzeniu wszystkich
            if (processedCount === lawFirms.length && markersRef.current.length > 0) {
              map.fitBounds(bounds)
              if (markersRef.current.length === 1) {
                map.setZoom(12)
              }
            }
          })
        }, index * 100) // 100ms opóźnienia między żądaniami
      }
    })
  }, [map, lawFirms])

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            Sprawdź klucz API Google Maps w ustawieniach
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Ładowanie mapy...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
