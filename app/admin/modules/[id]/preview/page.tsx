"use client"

import { Button } from "@/components/ui/button"
import { parseModuleCode, renderModule } from "@/lib/module-parser"
import { ArrowLeft, Check, Code, Copy, Eye, Loader2, Monitor, Smartphone, Tablet } from "lucide-react"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"

interface Module {
  id: string
  name: string
  code: string
  description?: string | null
  active: boolean
}

function highlightHTML(code: string) {
  if (!code) return ""
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-slate-500 font-normal">$1</span>')
  escaped = escaped.replace(/(\{[^{}]*?\})/g, '<span class="text-pink-400 font-bold bg-pink-950/40 px-1 rounded border border-pink-800/30">$1</span>')
  escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="text-cyan-400">$1</span>')
  escaped = escaped.replace(/(\/?&gt;)/g, '<span class="text-cyan-400">$1</span>')
  escaped = escaped.replace(/(\s[a-zA-Z0-9:-]+)(=)/g, '<span class="text-amber-300">$1</span>$2')
  escaped = escaped.replace(/("[^"]*")/g, '<span class="text-emerald-400">$1</span>')
  escaped = escaped.replace(/('[^']*')/g, '<span class="text-emerald-400">$1</span>')

  return escaped
}

export default function ModulePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<"visual" | "code">("visual")
  const [viewportDevice, setViewportDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [liveValues, setLiveValues] = useState<Record<string, any>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(`/api/admin/modules/${id}`)
        if (!res.ok) throw new Error("Not found")
        const data = await res.json()
        setModule(data)

        const parsed = parseModuleCode(data.code)
        const initialValues: Record<string, any> = {}
        parsed.fields.forEach((field) => {
          initialValues[field.name] = field.defaultValue || field.placeholder || `Przykładowy ${(field.label || field.name).toLowerCase()}`
        })
        setLiveValues(initialValues)
      } catch {
        router.push("/admin/modules")
      } finally {
        setLoading(false)
      }
    }

    fetchModule()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#090d16]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!module) return null

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#090d16]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0c1220] shrink-0">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/modules")}
            className="text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć do listy</span>
          </Button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-lg text-white">{module.name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
              Podgląd modułu
            </span>
          </div>
        </div>

        {/* Center: Device switcher */}
        {previewMode === "visual" && (
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 shadow-inner">
            {(["desktop", "tablet", "mobile"] as const).map((device) => {
              const Icon = device === "desktop" ? Monitor : device === "tablet" ? Tablet : Smartphone
              const label = device === "desktop" ? "Desktop" : device === "tablet" ? "Tablet" : "Mobilny"
              return (
                <button
                  key={device}
                  type="button"
                  onClick={() => setViewportDevice(device)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    viewportDevice === device
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Right: mode toggle */}
        <Button
          type="button"
          onClick={() => setPreviewMode(previewMode === "visual" ? "code" : "visual")}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all gap-2 px-4"
        >
          {previewMode === "visual" ? (
            <>
              <Code className="h-4 w-4" />
              <span>Pokaż kod</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Pokaż podgląd</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-[#070b13]">
        {previewMode === "visual" ? (
          <>
            {/* Preview Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-[#070b13] overflow-auto">
              <div
                className="transition-all duration-300 ease-in-out flex flex-col shadow-2xl shadow-black/60 rounded-xl overflow-hidden border border-slate-800 bg-[#0e1626]"
                style={{
                  width: viewportDevice === "desktop" ? "100%" : viewportDevice === "tablet" ? "768px" : "375px",
                  height: viewportDevice === "desktop" ? "100%" : "667px",
                  maxHeight: "100%",
                }}
              >
                {/* Browser chrome */}
                <div className="bg-[#0b0f19] px-4 py-2 flex items-center gap-2 border-b border-slate-800 shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="mx-auto max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-md py-0.5 px-3 text-sm text-slate-500 text-center truncate">
                    https://prosta-sprawa.pl/modules/{module.name.toLowerCase().replace(/\s+/g, "-")}
                  </div>
                </div>

                <iframe
                  className="w-full flex-1 bg-white border-0"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
                        <style>
                          body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #0f172a; }
                        </style>
                      </head>
                      <body>${renderModule(module.code, liveValues)}</body>
                    </html>
                  `}
                />
              </div>
            </div>

            {/* Right Panel: Fields */}
            <div className="w-80 border-l border-slate-800 bg-[#090d16] flex flex-col shrink-0">
              <div className="p-5 border-b border-slate-800">
                <h4 className="font-semibold text-slate-200">Pola edytowalne</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Wpisz tekst poniżej, aby na żywo edytować moduł w podglądzie
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {(() => {
                  const parsed = parseModuleCode(module.code)
                  return parsed.fields.length > 0 ? (
                    parsed.fields.map((field) => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">{field.label}</label>
                        {field.type === "textarea" || field.type === "textarea-wysiwyg" ? (
                          <textarea
                            value={liveValues[field.name] || ""}
                            onChange={(e) => setLiveValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                            className="w-full min-h-[80px] bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder={field.placeholder || "Wpisz tekst..."}
                          />
                        ) : (
                          <input
                            type="text"
                            value={liveValues[field.name] || ""}
                            onChange={(e) => setLiveValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder={field.placeholder || "Wpisz tekst..."}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Ten moduł nie ma dynamicznych pól edytowalnych (kod statyczny)
                    </div>
                  )
                })()}
              </div>
            </div>
          </>
        ) : (
          /* Code Viewer */
          <div className="flex-1 flex flex-col p-8 overflow-hidden">
            <div className="flex-1 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-5 py-3.5 bg-[#0e1626] border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-mono text-slate-300">
                    {module.name.toLowerCase().replace(/\s+/g, "-")}.html
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(module.code)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Skopiowano!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Kopiuj kod</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed text-indigo-200 select-all">
                <pre className="whitespace-pre-wrap font-mono">
                  <code dangerouslySetInnerHTML={{ __html: highlightHTML(module.code) }} />
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
