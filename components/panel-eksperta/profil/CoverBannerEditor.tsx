"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { renderCroppedImage } from "@/components/ui/shadcn-io/image-crop"
import { AlertTriangle, Check, Loader2, Move, X, ZoomIn, ZoomOut } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const ASPECT = 2
const MAX_ZOOM = 3
const KEYBOARD_STEP = 0.05

interface CoverBannerEditorProps {
  file: File
  onSave: (blob: Blob) => void | Promise<void>
  onCancel: () => void
  isSaving?: boolean
  /** Zalecana minimalna szerokość kadru w pikselach oryginału — poniżej pokazujemy ostrzeżenie. */
  minRecommendedWidth?: number
  /** Maksymalna szerokość zapisanego kadru (większe są zmniejszane, mniejsze zapisywane 1:1). */
  maxOutputWidth: number
  maxImageSize?: number
}

type Size = { width: number; height: number }
type Point = { x: number; y: number }

// Widoczny fragment oryginału (w pikselach naturalnych) dla danego zoomu — przy zoom=1
// zdjęcie wypełnia cały kadr 2:1 (jak object-cover), więc nie zależy od szerokości podglądu.
const getVisibleSize = (natural: Size, zoom: number): Size => {
  const width = Math.min(natural.width, natural.height * ASPECT) / zoom
  return { width, height: width / ASPECT }
}

const clampCenter = (center: Point, natural: Size, zoom: number): Point => {
  const visible = getVisibleSize(natural, zoom)
  const clamp = (value: number, half: number, max: number) => Math.min(Math.max(value, half), max - half)
  return {
    x: clamp(center.x, visible.width / 2, natural.width),
    y: clamp(center.y, visible.height / 2, natural.height),
  }
}

/**
 * Edycja okładki bezpośrednio w podglądzie banneru: przeciąganie ustawia kadr,
 * suwak przybliża. Zapis wycina widoczny fragment w pikselach oryginału.
 */
export function CoverBannerEditor({
  file,
  onSave,
  onCancel,
  isSaving = false,
  minRecommendedWidth,
  maxOutputWidth,
  maxImageSize = 5 * 1024 * 1024,
}: CoverBannerEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{ pointerId: number; last: Point } | null>(null)

  const [natural, setNatural] = useState<Size | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Edytor jest montowany osobno dla każdego wybranego pliku, więc stan kadru nie wymaga resetu
  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const url = URL.createObjectURL(file)
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setNatural({ width: naturalWidth, height: naturalHeight })
    setCenter({ x: naturalWidth / 2, y: naturalHeight / 2 })
  }

  const visible = natural ? getVisibleSize(natural, zoom) : null
  // Ile pikseli ekranu przypada na piksel oryginału
  const scale = visible && containerWidth ? containerWidth / visible.width : 0

  const moveBy = (dx: number, dy: number) => {
    if (!natural || !scale) return
    setCenter((prev) => clampCenter({ x: prev.x - dx / scale, y: prev.y - dy / scale }, natural, zoom))
  }

  const changeZoom = (value: number) => {
    if (!natural) return
    const next = Math.min(Math.max(value, 1), MAX_ZOOM)
    setZoom(next)
    setCenter((prev) => clampCenter(prev, natural, next))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSaving || !natural) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { pointerId: e.pointerId, last: { x: e.clientX, y: e.clientY } }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    moveBy(e.clientX - drag.last.x, e.clientY - drag.last.y)
    drag.last = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return
    dragRef.current = null
    setIsDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = containerWidth * KEYBOARD_STEP
    const moves: Record<string, Point> = {
      ArrowLeft: { x: step, y: 0 },
      ArrowRight: { x: -step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    moveBy(move.x, move.y)
  }

  const handleSave = async () => {
    if (!imgRef.current || !natural || !visible) return
    const dataUrl = renderCroppedImage(
      imgRef.current,
      {
        x: Math.round(center.x - visible.width / 2),
        y: Math.round(center.y - visible.height / 2),
        width: Math.round(visible.width),
        height: Math.round(visible.height),
      },
      maxOutputWidth,
      maxImageSize,
      file.type,
    )
    const blob = await (await fetch(dataUrl)).blob()
    await onSave(blob)
  }

  const tooSmall = !!visible && !!minRecommendedWidth && visible.width < minRecommendedWidth

  return (
    <div className="space-y-4 p-4 border border-primary/40 rounded-xl bg-background/10">
      <div
        ref={containerRef}
        role="application"
        aria-label="Podgląd banneru — przeciągnij, aby ustawić kadr"
        tabIndex={0}
        className={`relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-border/30 bg-muted touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Lokalny blob URL — potrzebny naturalny rozmiar i rysowanie do canvas, więc zwykły <img> */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          alt="Nowy banner"
          draggable={false}
          onLoad={handleImageLoad}
          className="absolute top-0 left-0 max-w-none origin-top-left pointer-events-none"
          style={
            natural && scale
              ? {
                  width: natural.width * scale,
                  height: natural.height * scale,
                  transform: `translate(${-(center.x - visible!.width / 2) * scale}px, ${-(center.y - visible!.height / 2) * scale}px)`,
                }
              : { visibility: "hidden" }
          }
        />

        {!natural && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {natural && !isDragging && !isSaving && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white pointer-events-none">
            <Move className="h-3.5 w-3.5" />
            Przeciągnij, aby ustawić kadr
          </div>
        )}

        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Oddal"
          onClick={() => changeZoom(zoom - 0.25)}
          disabled={isSaving || !natural || zoom <= 1}
          className="text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <Slider
          aria-label="Przybliżenie"
          min={1}
          max={MAX_ZOOM}
          step={0.05}
          value={[zoom]}
          onValueChange={([value]) => changeZoom(value)}
          disabled={isSaving || !natural}
        />
        <button
          type="button"
          aria-label="Przybliż"
          onClick={() => changeZoom(zoom + 0.25)}
          disabled={isSaving || !natural || zoom >= MAX_ZOOM}
          className="text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {visible && (
        <p className={tooSmall ? "flex items-center gap-2 text-xs text-amber-600" : "text-xs text-muted-foreground"}>
          {tooSmall && <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
          Rozmiar kadru: {Math.round(visible.width)}×{Math.round(visible.height)} px
          {tooSmall && ` — zalecane min. ${minRecommendedWidth} px szerokości, banner może być nieostry na dużych ekranach.`}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !natural}
          className="rounded-xl bg-primary hover:bg-primary-hover text-white"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          {isSaving ? "Zapisywanie..." : "Zapisz banner"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-xl border-border/30"
        >
          <X className="mr-2 h-4 w-4" />
          Anuluj
        </Button>
      </div>
    </div>
  )
}
