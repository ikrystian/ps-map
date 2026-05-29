"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bold, Code, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo, Undo } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Zacznij pisać...",
  className,
  minHeight = "400px"
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const formatHeading = () => {
    execCommand("formatBlock", "h2")
  }

  const formatBlockquote = () => {
    execCommand("formatBlock", "blockquote")
  }

  const insertLink = () => {
    const url = prompt("Wprowadź URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("bold")}
          title="Pogrubienie (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}
          title="Kursywa (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatHeading}
          title="Nagłówek"
          className="h-8 w-8 p-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          title="Lista wypunktowana"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          title="Lista numerowana"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBlockquote}
          title="Cytat"
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Wstaw link"
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "pre")}
          title="Kod"
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("undo")}
          title="Cofnij (Ctrl+Z)"
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("redo")}
          title="Ponów (Ctrl+Y)"
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "p-4 focus:outline-none prose prose-sm max-w-none",
          "prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded",
          "prose-a:text-primary prose-a:underline",
          !value && !isFocused && "before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none"
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  )
}
