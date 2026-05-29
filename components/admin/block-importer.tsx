"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/sonner"
import { Download, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Block {
  key: string
  name: string
  description: string
}

interface BlockImporterProps {
  onImported?: () => void
}

export function BlockImporter({ onImported }: BlockImporterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchBlocks()
    }
  }, [isOpen])

  const fetchBlocks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blocks')

      if (!response.ok) {
        throw new Error('Nie udało się pobrać listy bloków')
      }

      const data = await response.json()
      setBlocks(data.blocks)
    } catch (error) {
      console.error('Error fetching blocks:', error)
      toast.error('Nie udało się pobrać listy bloków')
    } finally {
      setLoading(false)
    }
  }

  const handleImportBlock = async (blockKey: string) => {
    try {
      setImporting(blockKey)

      // 1. Renderuj blok do HTML
      const renderResponse = await fetch(`/api/admin/blocks/${blockKey}/render`, {
        method: 'POST',
      })

      if (!renderResponse.ok) {
        throw new Error('Nie udało się wyrenderować bloku')
      }

      const renderData = await renderResponse.json()

      // 2. Utwórz nowy moduł typu EDITABLE_HTML
      const createResponse = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: renderData.name,
          description: renderData.description,
          code: renderData.html,
          type: 'EDITABLE_HTML',
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Nie udało się utworzyć modułu')
      }

      toast.success(`Zaimportowano blok: ${renderData.name}`)
      setIsOpen(false)

      if (onImported) {
        onImported()
      }
    } catch (error) {
      console.error('Error importing block:', error)
      toast.error('Nie udało się zaimportować bloku')
    } finally {
      setImporting(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Importuj blok HTML
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importuj blok HTML</DialogTitle>
          <DialogDescription>
            Wybierz gotowy blok HTML do zaimportowania jako moduł edytowalny
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {blocks.map((block) => (
              <div
                key={block.key}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{block.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {block.description}
                  </p>
                </div>
                <Button
                  onClick={() => handleImportBlock(block.key)}
                  disabled={importing === block.key}
                  size="sm"
                  className="ml-4"
                >
                  {importing === block.key ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importowanie...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Importuj
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
