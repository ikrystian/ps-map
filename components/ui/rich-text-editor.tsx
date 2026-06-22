"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

// Convert HTML string to Editor.js Block format
function convertHTMLToBlocks(html: string): any[] {
  if (typeof window === "undefined" || !html) return []

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const blocks: any[] = []

  doc.body.childNodes.forEach((node: any) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase()

      if (tagName.startsWith("h") && tagName.length === 2) {
        const level = parseInt(tagName.charAt(1))
        blocks.push({
          type: "header",
          data: {
            text: node.innerHTML,
            level: level >= 1 && level <= 6 ? level : 2
          }
        })
      } else if (tagName === "p") {
        const text = node.innerHTML.trim()
        if (text && text !== "<br>") {
          blocks.push({
            type: "paragraph",
            data: {
              text
            }
          })
        }
      } else if (tagName === "ul" && (node.classList.contains("checklist") || node.classList.contains("cdx-checklist"))) {
        const items: any[] = []
        node.querySelectorAll("li").forEach((li: any) => {
          const isChecked = li.getAttribute("data-checked") === "true" || 
                            li.classList.contains("cdx-checklist__item--checked") ||
                            !!li.querySelector("input[type='checkbox'][checked]") ||
                            (li.querySelector("input[type='checkbox']") as HTMLInputElement)?.checked === true
          
          // Strip checklist checkbox from text if parsed from raw HTML representation
          let text = li.innerHTML
          const checkbox = li.querySelector("input[type='checkbox']")
          if (checkbox) {
            text = li.textContent?.replace(/^\[[ xX]\]\s*/, "") || li.innerHTML
          }
          
          items.push({
            text: text.trim(),
            checked: isChecked
          })
        })
        blocks.push({
          type: "checklist",
          data: {
            items
          }
        })
      } else if (tagName === "ul" || tagName === "ol") {
        const items: { content: string; items: any[] }[] = []
        node.querySelectorAll(":scope > li").forEach((li: any) => {
          items.push({ content: li.innerHTML, items: [] })
        })
        blocks.push({
          type: "list",
          data: {
            style: tagName === "ol" ? "ordered" : "unordered",
            items
          }
        })
      } else if (tagName === "blockquote") {
        const p = node.querySelector("p")
        const cite = node.querySelector("cite")
        blocks.push({
          type: "quote",
          data: {
            text: p ? p.innerHTML : node.innerHTML,
            caption: cite ? cite.innerHTML : "",
            alignment: "left"
          }
        })
      } else if (tagName === "figure" || tagName === "img") {
        const img = tagName === "img" ? node : node.querySelector("img")
        const figcaption = tagName === "figure" ? node.querySelector("figcaption") : null
        if (img && img.src) {
          blocks.push({
            type: "image",
            data: {
              file: {
                url: img.src
              },
              caption: figcaption ? figcaption.innerHTML : "",
              withBorder: false,
              withBackground: false,
              stretched: false
            }
          })
        }
      } else if (tagName === "hr") {
        blocks.push({
          type: "delimiter",
          data: {}
        })
      } else if (tagName === "table") {
        const content: string[][] = []
        let withHeadings = false
        
        node.querySelectorAll("tr").forEach((tr: any) => {
          const row: string[] = []
          tr.querySelectorAll("th, td").forEach((cell: any) => {
            if (cell.tagName.toLowerCase() === "th") {
              withHeadings = true
            }
            row.push(cell.innerHTML)
          })
          if (row.length > 0) {
            content.push(row)
          }
        })
        
        blocks.push({
          type: "table",
          data: {
            withHeadings,
            content
          }
        })
      } else if (tagName === "div" && (node.classList.contains("warning-block") || node.classList.contains("cdx-warning"))) {
        const titleEl = node.querySelector(".warning-title") || node.querySelector(".cdx-warning__title")
        const messageEl = node.querySelector(".warning-message") || node.querySelector(".cdx-warning__message")
        blocks.push({
          type: "warning",
          data: {
            title: titleEl ? titleEl.innerHTML : "",
            message: messageEl ? messageEl.innerHTML : node.innerHTML
          }
        })
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        blocks.push({
          type: "paragraph",
          data: {
            text
          }
        })
      }
    }
  })

  // Fallback if no blocks were parsed
  if (blocks.length === 0 && html) {
    blocks.push({
      type: "paragraph",
      data: {
        text: html
      }
    })
  }

  return blocks
}

// Convert Editor.js Blocks to HTML string
function convertBlocksToHTML(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ""

  return blocks.map(block => {
    switch (block.type) {
      case "header":
        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`
      case "paragraph":
        return `<p>${block.data.text}</p>`
      case "list": {
        const tag = block.data.style === "ordered" ? "ol" : "ul"
        const items = block.data.items.map((item: any) => {
          // @editorjs/list v2.x uses objects {content, items}, v1.x used plain strings
          const text = typeof item === "string" ? item : (item?.content ?? "")
          return `<li>${text}</li>`
        }).join("")
        return `<${tag}>${items}</${tag}>`
      }
      case "checklist": {
        const checkItems = block.data.items.map((item: any) =>
          `<li data-checked="${item.checked ? "true" : "false"}">${item.text}</li>`
        ).join("")
        return `<ul class="checklist">${checkItems}</ul>`
      }
      case "warning": {
        return `<div class="warning-block"><strong class="warning-title">${block.data.title || ""}</strong><p class="warning-message">${block.data.message || ""}</p></div>`
      }
      case "delimiter": {
        return `<hr />`
      }
      case "table": {
        const withHeadings = block.data.withHeadings
        const rows = block.data.content.map((row: string[], rowIndex: number) => {
          const cellTag = (withHeadings && rowIndex === 0) ? "th" : "td"
          const cells = row.map((cell: string) => `<${cellTag}>${cell}</${cellTag}>`).join("")
          return `<tr>${cells}</tr>`
        })
        
        if (withHeadings && rows.length > 0) {
          return `<table><thead>${rows[0]}</thead><tbody>${rows.slice(1).join("")}</tbody></table>`
        }
        return `<table><tbody>${rows.join("")}</tbody></table>`
      }
      case "quote":
        return `<blockquote><p>${block.data.text}</p>${block.data.caption ? `<cite>${block.data.caption}</cite>` : ""}</blockquote>`
      case "embed":
        return `<div class="embed-container"><iframe src="${block.data.embed}" width="100%" height="320" frameborder="0" allowfullscreen></iframe></div>`
      case "image": {
        const src = block.data.file?.url || ""
        if (!src) return ""
        return `<figure><img src="${src}" alt="${block.data.caption || ""}" />${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ""}</figure>`
      }
      default:
        console.warn("Unhandled block type:", block.type)
        return ""
    }
  }).join("")
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Kliknij tutaj, aby rozpocząć pisanie...",
  className,
  minHeight = "400px"
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const isUpdatingRef = useRef(false)
  const initialValueRef = useRef(value)
  const lastEmittedRef = useRef(value)
  const onChangeRef = useRef(onChange)

  // Keep onChange ref updated to avoid effect dependency re-runs
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Keep initial value ref updated until editor is ready
  useEffect(() => {
    if (!editorRef.current) {
      initialValueRef.current = value
    }
  }, [value])

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    let isCancelled = false
    let editorInstance: any = null

    // We import dynamically inside useEffect since Editor.js runs client-side only
    const initEditor = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default
      const Header = (await import("@editorjs/header")).default
      const List = (await import("@editorjs/list")).default
      const ImageTool = (await import("@editorjs/image")).default
      // @ts-expect-error No type declarations available
      const Embed = (await import("@editorjs/embed")).default
      const Quote = (await import("@editorjs/quote")).default
      // @ts-expect-error No type declarations available
      const Checklist = (await import("@editorjs/checklist")).default
      const Table = (await import("@editorjs/table")).default as any
      const Warning = (await import("@editorjs/warning")).default
      const Delimiter = (await import("@editorjs/delimiter")).default
      const Underline = (await import("@editorjs/underline")).default
      // @ts-expect-error No type declarations available
      const Marker = (await import("@editorjs/marker")).default

      if (isCancelled || !containerRef.current) return

      const initialBlocks = convertHTMLToBlocks(initialValueRef.current)

      editorInstance = new EditorJS({
        holder: containerRef.current!,
        placeholder,
        data: {
          blocks: initialBlocks
        },
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  "Click to tune": "Kliknij, aby dostosować",
                  "or drag to move": "lub przeciągnij, aby przenieść"
                }
              },
              inlineToolbar: {
                converter: {
                  "Convert to": "Konwertuj na"
                }
              },
              toolbar: {
                toolbox: {
                  "Add": "Dodaj"
                }
              }
            },
            toolNames: {
              "Text": "Tekst",
              "Heading": "Nagłówek",
              "List": "Lista",
              "Warning": "Ostrzeżenie",
              "Checklist": "Lista kontrolna",
              "Quote": "Cytat",
              "Code": "Kod",
              "Delimiter": "Separator",
              "Raw HTML": "Kod HTML",
              "Table": "Tabela",
              "Link": "Link",
              "Marker": "Zakreślacz",
              "Bold": "Pogrubienie",
              "Italic": "Kursywa",
              "Underline": "Podkreślenie",
              "InlineCode": "Kod w tekście",
              "Image": "Obraz",
              "Embed": "Osadzone wideo"
            },
            tools: {
              warning: {
                "Title": "Tytuł",
                "Message": "Wiadomość"
              },
              link: {
                "Add a link": "Dodaj link"
              },
              stub: {
                "The block can not be displayed": "Ten blok nie może być wyświetlony"
              },
              image: {
                "Caption": "Podpis",
                "Select an Image": "Wybierz obraz",
                "With border": "Z obramowaniem",
                "Stretch image": "Rozciągnij obraz",
                "With background": "Z tłem"
              },
              list: {
                "Ordered": "Uporządkowana",
                "Unordered": "Nieuporządkowana"
              },
              table: {
                "Add row to top": "Dodaj wiersz powyżej",
                "Add row to bottom": "Dodaj wiersz poniżej",
                "Delete row": "Usuń wiersz",
                "Add column to left": "Dodaj kolumnę po lewej",
                "Add column to right": "Dodaj kolumnę po prawej",
                "Delete column": "Usuń kolumnę",
                "With headings": "Z nagłówkami"
              }
            },
            blockTunes: {
              delete: {
                "Delete": "Usuń",
                "Click to delete": "Kliknij, aby usunąć"
              },
              moveUp: {
                "Move up": "Przesuń w górę"
              },
              moveDown: {
                "Move down": "Przesuń w dół"
              }
            }
          }
        },
        tools: {
          header: {
            class: Header,
            inlineToolbar: ["link", "bold", "italic", "underline", "marker"]
          },
          list: {
            class: List,
            inlineToolbar: true
          },
          quote: {
            class: Quote,
            inlineToolbar: true
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 2,
            },
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            config: {
              titlePlaceholder: "Tytuł ostrzeżenia",
              messagePlaceholder: "Treść ostrzeżenia",
            },
          },
          delimiter: Delimiter,
          embed: Embed,
          underline: Underline,
          marker: {
            class: Marker,
            shortcut: "CMD+SHIFT+M",
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file: File) {
                  const formData = new FormData()
                  formData.append("file", file)

                  return fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  })
                    .then(response => response.json())
                    .then(result => {
                      return {
                        success: 1,
                        file: {
                          url: result.url
                        }
                      }
                    })
                    .catch(error => {
                      console.error("Upload error:", error)
                      return {
                        success: 0
                      }
                    })
                }
              }
            }
          }
        },
        onChange: async (api) => {
          if (isUpdatingRef.current) return
          const savedData = await api.saver.save()
          const html = convertBlocksToHTML(savedData.blocks)
          // Remember what we emitted so the parent->editor sync below can tell
          // our own echo apart from a genuine external value change.
          lastEmittedRef.current = html
          onChangeRef.current(html)
        }
      })

      try {
        await editorInstance.isReady
      } catch (readyError) {
        console.error("EditorJS failed to initialize:", readyError)
      }

      if (isCancelled) {
        return
      }

      editorRef.current = editorInstance
    }

    initEditor()

    return () => {
      isCancelled = true
      if (editorInstance) {
        const destroyEditor = () => {
          if (typeof editorInstance.destroy === "function") {
            try {
              editorInstance.destroy()
            } catch (e) {
              console.error("Error destroying EditorJS instance:", e)
            }
          }
        }

        if (editorInstance.isReady) {
          editorInstance.isReady.then(destroyEditor).catch(destroyEditor)
        } else {
          destroyEditor()
        }
      }
      editorRef.current = null
    }
  }, [placeholder])

  // Sync value from parent — only when the change came from outside the editor.
  // Echoes of the editor's own onChange are ignored, otherwise the async save
  // below races against fresh keystrokes and reverts them (which also stalls any
  // consumer reading the value, e.g. the profile completeness score).
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !editor.isReady) return

    const cleanValue = value || ""
    if (cleanValue === lastEmittedRef.current) return

    editor.isReady.then(() => {
      editor.saver.save().then((savedData: any) => {
        const currentHTML = convertBlocksToHTML(savedData.blocks)

        if (cleanValue !== currentHTML) {
          isUpdatingRef.current = true
          const newBlocks = convertHTMLToBlocks(cleanValue)
          editor
            .render({ blocks: newBlocks })
            .then(() => {
              lastEmittedRef.current = cleanValue
              isUpdatingRef.current = false
            })
            .catch(() => {
              isUpdatingRef.current = false
            })
        }
      })
    })
  }, [value])

  return (
    <div className={cn("border rounded-xl overflow-hidden bg-background p-6", className)}>
      <div 
        ref={containerRef} 
        className="editorjs-wrapper min-w-full prose prose-sm max-w-none dark:prose-invert focus:outline-none [&_.codex-editor__redactor]:pb-12 [&_.ce-block]:my-1.5 [&_.ce-header]:font-bold [&_.ce-header]:text-foreground [&_.ce-paragraph]:text-foreground [&_.ce-paragraph]:leading-relaxed [&_.cdx-list]:pl-6 [&_.cdx-list]:list-disc [&_.cdx-quote]:border-l-4 [&_.cdx-quote]:border-primary [&_.cdx-quote]:pl-4 [&_.cdx-quote]:italic [&_.cdx-warning]:bg-amber-500/10 [&_.cdx-warning]:border-l-4 [&_.cdx-warning]:border-amber-500 [&_.cdx-warning]:p-4 [&_.cdx-warning]:rounded-r-lg [&_.cdx-warning__title]:font-bold [&_.cdx-warning__title]:mb-1 [&_.cdx-warning__title]:text-foreground [&_.cdx-warning__message]:text-sm [&_.cdx-warning__message]:text-foreground [&_.ce-delimiter]:py-4 [&_.ce-delimiter]:text-2xl [&_.ce-delimiter]:font-bold [&_.ce-delimiter]:text-muted-foreground/50 [&_.ce-popover]:bg-popover [&_.ce-popover]:border [&_.ce-popover]:border-border [&_.ce-popover]:text-popover-foreground [&_.ce-popover-item]:text-popover-foreground [&_.ce-popover-item:hover]:bg-accent [&_.ce-popover-item:hover]:text-accent-foreground [&_.ce-popover-item__icon]:bg-muted [&_.ce-popover-item__icon]:text-foreground [&_.ce-inline-toolbar]:bg-popover [&_.ce-inline-toolbar]:border [&_.ce-inline-toolbar]:border-border [&_.ce-inline-toolbar]:text-popover-foreground [&_.ce-inline-toolbar__button]:text-popover-foreground [&_.ce-inline-toolbar__button:hover]:bg-accent [&_.ce-inline-toolbar__button--active]:text-primary [&_.ce-inline-toolbar__button--active]:bg-accent [&_.ce-conversion-toolbar]:bg-popover [&_.ce-conversion-toolbar]:border [&_.ce-conversion-toolbar]:border-border [&_.ce-conversion-tool]:text-popover-foreground [&_.ce-conversion-tool:hover]:bg-accent [&_.ce-toolbar__settings-btn]:text-foreground [&_.ce-toolbar__settings-btn:hover]:bg-accent [&_.ce-toolbar__plus]:text-foreground [&_.ce-toolbar__plus:hover]:bg-accent [&_.ce-settings__button]:text-popover-foreground [&_.ce-settings__button:hover]:bg-accent [&_.ce-settings__button--active]:text-primary [&_.tc-cell]:border-border [&_.tc-cell]:text-foreground [&_.tc-toolbox]:bg-popover [&_.tc-toolbox]:border [&_.tc-toolbox]:border-border [&_.tc-toolbox__toggler]:text-foreground [&_.tc-toolbox__toggler:hover]:bg-accent [&_.cdx-warning]:bg-muted/50 [&_.cdx-warning]:border-border [&_.cdx-input]:bg-transparent [&_.cdx-input]:text-foreground [&_.cdx-input]:border-border"
        style={{ minHeight }}
      />
    </div>
  )
}
