"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor"
import { parseModuleCode, renderModule } from "@/lib/module-parser"
import type { ModuleForBuilder, PageModuleForBuilder } from "@/types/cms"
import { ChevronDown, ChevronUp, GripVertical, Trash2, Loader2, Upload } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ImageCropper } from "@/components/ui/image-cropper"
import { toast } from "@/components/ui/sonner"

interface PageBuilderProps {
  modules: ModuleForBuilder[]
  pageModules: PageModuleForBuilder[]
  onChange: (modules: PageModuleForBuilder[]) => void
}

export function PageBuilder({ modules, pageModules, onChange }: PageBuilderProps) {
  const [collapsedModules, setCollapsedModules] = useState<Set<number>>(new Set())
  const [editingImage, setEditingImage] = useState<{
    moduleIndex: number
    isEditableHtml: boolean
    templateFieldName: string
    width: number
    height: number
    aspectRatio: number
  } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const toggleExpanded = (index: number) => {
    const newCollapsed = new Set(collapsedModules)
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index)
    } else {
      newCollapsed.add(index)
    }
    setCollapsedModules(newCollapsed)
  }

  const handleImageClick = (
    img: HTMLImageElement,
    moduleIndex: number,
    isEditableHtml: boolean,
    container: HTMLElement
  ) => {
    // Mark this image as being edited
    img.setAttribute('data-editing-img', 'true')

    // Read dimensions
    const width = img.naturalWidth || img.clientWidth || Number(img.getAttribute('width')) || 800
    const height = img.naturalHeight || img.clientHeight || Number(img.getAttribute('height')) || 600
    const aspectRatio = height > 0 ? width / height : 1

    // Find field name if it's a TEMPLATE module
    let templateFieldName = ''
    if (!isEditableHtml) {
      const pageModule = pageModules[moduleIndex]
      const cmsModule = pageModule.module || modules.find(m => m.id === pageModule.moduleId)
      if (cmsModule) {
        const imagesInPreview = Array.from(container.querySelectorAll('img'))
        const imgIndex = imagesInPreview.indexOf(img)
        const imgTagsInCode = cmsModule.code.match(/<img[^>]+>/g) || []
        if (imgIndex >= 0 && imgIndex < imgTagsInCode.length) {
          const matchingTag = imgTagsInCode[imgIndex]
          const srcMatch = matchingTag.match(/src=["']?\{([^}]+)\}["']?/)
          if (srcMatch) {
            templateFieldName = srcMatch[1]
          }
        }
      }

      // Fallback: search in pageModule.data for any field containing current src
      if (!templateFieldName) {
        const currentSrc = img.getAttribute('src') || ''
        for (const key of Object.keys(pageModule.data)) {
          if (pageModule.data[key] === currentSrc) {
            templateFieldName = key
            break
          }
        }
      }
    }

    setEditingImage({
      moduleIndex,
      isEditableHtml,
      templateFieldName,
      width,
      height,
      aspectRatio,
    })
  }

  const handleCancelUpload = () => {
    const img = document.querySelector('[data-editing-img]')
    if (img) {
      img.removeAttribute('data-editing-img')
    }
    setEditingImage(null)
    setSelectedFile(null)
    setShowCropDialog(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Nieprawidłowy typ pliku. Dozwolone: JPEG, PNG, WebP, GIF")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    setSelectedFile(file)
    setShowCropDialog(true)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropDialog(false)
    setIsUploading(true)

    try {
      const formData = new FormData()
      const fileName = selectedFile?.name || "image.jpg"
      const file = new File([croppedBlob], fileName, { type: croppedBlob.type })
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()

      if (editingImage) {
        const { moduleIndex, isEditableHtml, templateFieldName } = editingImage

        if (isEditableHtml) {
          const img = document.querySelector('[data-editing-img]') as HTMLImageElement
          if (img) {
            img.src = data.url
            if (editingImage.width) img.setAttribute('width', String(editingImage.width))
            if (editingImage.height) img.setAttribute('height', String(editingImage.height))
            img.removeAttribute('data-editing-img')

            const container = img.closest('[contenteditable="true"]')
            if (container) {
              updateModuleData(moduleIndex, 'html', container.innerHTML)
            }
          }
        } else if (templateFieldName) {
          updateModuleData(moduleIndex, templateFieldName, data.url)

          const img = document.querySelector('[data-editing-img]')
          if (img) {
            img.removeAttribute('data-editing-img')
          }
        }
      }

      toast.success("Obrazek został zaktualizowany")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Nie udało się przesłać obrazka")
    } finally {
      setIsUploading(false)
      setEditingImage(null)
      setSelectedFile(null)
    }
  }

  const addModule = (moduleId: string) => {
    const cmsModule = modules.find(m => m.id === moduleId)
    if (!cmsModule) return

    const newModule: PageModuleForBuilder = {
      moduleId,
      module: cmsModule,
      order: pageModules.length,
      data: cmsModule.type === 'EDITABLE_HTML' ? { html: cmsModule.code } : {},
    }

    onChange([...pageModules, newModule])
    // Automatycznie rozwiń nowo dodany moduł (czyli usuń z collapsed)
    const newCollapsed = new Set(collapsedModules)
    newCollapsed.delete(pageModules.length)
    setCollapsedModules(newCollapsed)
  }

  const removeModule = (index: number) => {
    const newModules = pageModules.filter((_, i) => i !== index)
    // Aktualizuj kolejność
    const reorderedModules = newModules.map((m, i) => ({ ...m, order: i }))
    onChange(reorderedModules)
  }

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === pageModules.length - 1)
    ) {
      return
    }

    const newModules = [...pageModules]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // Zamień miejscami
    const temp = newModules[index]
    newModules[index] = newModules[targetIndex]
    newModules[targetIndex] = temp

    // Aktualizuj kolejność
    const reorderedModules = newModules.map((m, i) => ({ ...m, order: i }))
    onChange(reorderedModules)
  }

  const updateModuleData = (index: number, fieldName: string, value: any) => {
    const newModules = [...pageModules]
    newModules[index] = {
      ...newModules[index],
      data: {
        ...newModules[index].data,
        [fieldName]: value,
      },
    }
    onChange(newModules)
  }

  const renderFieldInput = (
    field: any,
    moduleIndex: number,
    value: any
  ) => {
    const { type, name, label, placeholder, options } = field

    switch (type) {
      case 'input-text':
      case 'input-email':
      case 'input-url':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={`${moduleIndex}-${name}`}>{label}</Label>
            <Input
              id={`${moduleIndex}-${name}`}
              type={type === 'input-email' ? 'email' : type === 'input-url' ? 'url' : 'text'}
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => updateModuleData(moduleIndex, name, e.target.value)}
            />
          </div>
        )

      case 'input-number':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={`${moduleIndex}-${name}`}>{label}</Label>
            <Input
              id={`${moduleIndex}-${name}`}
              type="number"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => updateModuleData(moduleIndex, name, e.target.value)}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={`${moduleIndex}-${name}`}>{label}</Label>
            <Textarea
              id={`${moduleIndex}-${name}`}
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => updateModuleData(moduleIndex, name, e.target.value)}
              rows={4}
            />
          </div>
        )

      case 'textarea-wysiwyg':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={`${moduleIndex}-${name}`}>{label}</Label>
            <WysiwygEditor
              value={value || ''}
              onChange={(newValue) => updateModuleData(moduleIndex, name, newValue)}
            />
          </div>
        )

      case 'select':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={`${moduleIndex}-${name}`}>{label}</Label>
            <Select
              value={value || ''}
              onValueChange={(newValue) => updateModuleData(moduleIndex, name, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder || "Wybierz opcję"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'checkbox':
        return (
          <div key={name} className="flex items-center space-x-2">
            <input
              id={`${moduleIndex}-${name}`}
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateModuleData(moduleIndex, name, e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor={`${moduleIndex}-${name}`}>{label}</Label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Module Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dodaj moduł</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select onValueChange={addModule}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Wybierz moduł do dodania" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {modules.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Brak dostępnych modułów. Najpierw utwórz moduły w zakładce Moduły.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Page Modules List */}
      <div className="space-y-4">
        {pageModules.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nie dodano jeszcze żadnych modułów. Wybierz moduł z listy powyżej.
              </p>
            </CardContent>
          </Card>
        ) : (
          pageModules.map((pageModule, index) => {
            const cmsModule = pageModule.module || modules.find(m => m.id === pageModule.moduleId)
            if (!cmsModule) return null

            const parsed = parseModuleCode(cmsModule.code)
            const isExpanded = !collapsedModules.has(index)

            return (
              <Card key={`${pageModule.moduleId}-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <CardTitle className="text-lg">{cmsModule.name}</CardTitle>
                      {cmsModule.description && (
                        <span className="text-sm text-muted-foreground">
                          - {cmsModule.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveModule(index, 'up')}
                        disabled={index === 0}
                        title="Przesuń w górę"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveModule(index, 'down')}
                        disabled={index === pageModules.length - 1}
                        title="Przesuń w dół"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpanded(index)}
                        title={isExpanded ? "Zwiń" : "Rozwiń"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeModule(index)}
                        title="Usuń moduł"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="space-y-4">
                    {cmsModule.type === 'EDITABLE_HTML' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Edytuj HTML (kliknij w treść, aby edytować)</Label>
                          <div
                            className="bg-white border rounded-lg p-0 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            dangerouslySetInnerHTML={{
                              __html: pageModule.data.html || cmsModule.code
                            }}
                            onClick={(e) => {
                              const target = e.target as HTMLElement
                              if (target.tagName === 'IMG') {
                                e.preventDefault()
                                e.stopPropagation()
                                handleImageClick(target as HTMLImageElement, index, true, e.currentTarget)
                              }
                            }}
                            onBlur={(e) => {
                              updateModuleData(index, 'html', e.currentTarget.innerHTML)
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Kliknij w treść powyżej, aby ją edytować. Zmiany zostaną zapisane automatycznie. Kliknij w obrazek, aby go podmienić (upload).
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {parsed.fields.length > 0 ? (
                          parsed.fields.map((field) =>
                            renderFieldInput(field, index, pageModule.data[field.name])
                          )
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Ten moduł nie ma edytowalnych pól.
                          </p>
                        )}

                        {/* Preview for TEMPLATE modules only */}
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-2">Podgląd (kliknij w obrazek, aby go podmienić):</h4>
                          <div
                            className="bg-muted p-4 rounded-lg cursor-pointer"
                            onClick={(e) => {
                              const target = e.target as HTMLElement
                              if (target.tagName === 'IMG') {
                                e.preventDefault()
                                e.stopPropagation()
                                handleImageClick(target as HTMLImageElement, index, false, e.currentTarget)
                              }
                            }}
                            dangerouslySetInnerHTML={{
                              __html: renderModule(cmsModule.code, pageModule.data)
                            }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Dialog for image uploading */}
      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={(open) => !open && handleCancelUpload()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Zmień obrazek</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Kliknij, aby wybrać i przesłać nowy obrazek</p>
                {editingImage.width && editingImage.height ? (
                  <p className="text-xs text-primary font-semibold mt-1">
                    Wymagane wymiary: {editingImage.width} x {editingImage.height} px (proporcje {editingImage.aspectRatio.toFixed(2)}:1)
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground mt-2">
                  JPEG, PNG, WebP lub GIF (max 5MB)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-file-upload-input"
                  disabled={isUploading}
                />
                <Button asChild variant="outline" className="mt-4" disabled={isUploading}>
                  <label htmlFor="image-file-upload-input" className="cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Przesyłanie...
                      </>
                    ) : (
                      "Wybierz plik"
                    )}
                  </label>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCancelUpload} disabled={isUploading}>
                Anuluj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedFile && editingImage && (
        <ImageCropper
          image={selectedFile}
          aspectRatio={editingImage.aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setSelectedFile(null)
            setShowCropDialog(false)
          }}
          open={showCropDialog}
        />
      )}
    </div>
  )
}
