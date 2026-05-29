"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/sonner"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Youtube from "@tiptap/extension-youtube"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
  Youtube as YoutubeIcon
} from "lucide-react"
import { useCallback, useState } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "400px"
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Youtube.configure({
        controls: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none p-4",
          "prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded",
          "prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full",
          "min-h-[200px]"
        ),
        style: `min-height: ${minHeight}`
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === null) {
      return
    }

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl("")
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor) return

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
    }
  }, [editor, imageUrl])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        editor?.chain().focus().setImage({ src: data.url }).run()
        toast.success("Zdjęcie dodane")
      } else {
        toast.error("Błąd przesyłania zdjęcia")
      }
    } catch (error) {
      toast.error("Błąd przesyłania zdjęcia")
    }
  }

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return

    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
      })
      setYoutubeUrl("")
    }
  }, [editor, youtubeUrl])

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30 sticky top-0 z-10">
        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Toggle bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Toggle italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Toggle underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Toggle strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            aria-label="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            aria-label="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            aria-label="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
            aria-label="Align justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Ordered list"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('codeBlock')}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            aria-label="Code block"
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-1 border-r pr-2 mr-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={cn(editor.isActive('link') && "bg-accent")}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <Button onClick={setLink} size="sm">Dodaj</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Z dysku</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Z URL</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button onClick={addImage} size="sm">Dodaj</Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <YoutubeIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex gap-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <Button onClick={addYoutubeVideo} size="sm">Dodaj</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
