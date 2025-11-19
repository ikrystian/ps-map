"use client"

import React, { useState } from "react"
import { GripVertical, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { parseModuleCode, renderModule } from "@/lib/module-parser"
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor"
import type { ModuleForBuilder, PageModuleForBuilder } from "@/types/cms"

interface PageBuilderProps {
  modules: ModuleForBuilder[]
  pageModules: PageModuleForBuilder[]
  onChange: (modules: PageModuleForBuilder[]) => void
}

export function PageBuilder({ modules, pageModules, onChange }: PageBuilderProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedModules(newExpanded)
  }

  const addModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newModule: PageModuleForBuilder = {
      moduleId,
      module,
      order: pageModules.length,
      data: module.type === 'EDITABLE_HTML' ? { html: module.code } : {},
    }

    onChange([...pageModules, newModule])
    // Automatycznie rozwiń nowo dodany moduł
    setExpandedModules(new Set([...expandedModules, pageModules.length]))
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
            const module = pageModule.module || modules.find(m => m.id === pageModule.moduleId)
            if (!module) return null

            const parsed = parseModuleCode(module.code)
            const isExpanded = expandedModules.has(index)

            return (
              <Card key={`${pageModule.moduleId}-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      {module.description && (
                        <span className="text-sm text-muted-foreground">
                          - {module.description}
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
                    {module.type === 'EDITABLE_HTML' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Edytuj HTML (kliknij w treść, aby edytować)</Label>
                          <div
                            className="bg-white border rounded-lg p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            dangerouslySetInnerHTML={{
                              __html: pageModule.data.html || module.code
                            }}
                            onBlur={(e) => {
                              updateModuleData(index, 'html', e.currentTarget.innerHTML)
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Kliknij w treść powyżej, aby ją edytować. Zmiany zostaną zapisane automatycznie.
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
                          <h4 className="text-sm font-semibold mb-2">Podgląd:</h4>
                          <div
                            className="bg-muted p-4 rounded-lg"
                            dangerouslySetInnerHTML={{
                              __html: renderModule(module.code, pageModule.data)
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
    </div>
  )
}
