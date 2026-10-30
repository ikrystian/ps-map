"use client"

import { css } from "@codemirror/lang-css"
import { syntaxTree } from "@codemirror/language"
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint"
import { indentWithTab } from "@codemirror/commands"
import { EditorView, keymap } from "@codemirror/view"
import { oneDark } from "@codemirror/theme-one-dark"
import CodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes"
import { useMemo } from "react"

interface CssEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
}

/** Zaznacza fragmenty, których parser CSS nie potrafił dopasować (np. brakujący `}`). */
const cssSyntaxLinter = linter((view) => {
  const diagnostics: Diagnostic[] = []
  const docLength = view.state.doc.length

  syntaxTree(view.state).iterate({
    enter: (node) => {
      if (!node.type.isError) return
      const from = Math.min(node.from, docLength)
      const to = Math.min(Math.max(node.to, node.from + 1), docLength)
      diagnostics.push({
        from: Math.min(from, to),
        to,
        severity: "error",
        message: "Błąd składni CSS",
      })
    },
  })

  return diagnostics
})

const editorTheme = EditorView.theme({
  "&": { fontSize: "13px" },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  "&.cm-focused": { outline: "none" },
})

/**
 * Edytor CSS oparty na CodeMirror 6: podświetlanie składni, autouzupełnianie właściwości
 * i wartości, numery linii, zwijanie bloków, domykanie nawiasów, wyszukiwanie (Ctrl+F)
 * oraz wskazywanie błędów składni. Motyw podąża za motywem strony (jasny/ciemny).
 */
export function CssEditor({
  value,
  onChange,
  placeholder,
  minHeight = "320px",
  maxHeight = "640px",
}: CssEditorProps) {
  const { resolvedTheme } = useTheme()

  const extensions = useMemo(
    () => [css(), cssSyntaxLinter, lintGutter(), keymap.of([indentWithTab]), editorTheme],
    [],
  )

  return (
    <div className="overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring/50">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme={resolvedTheme === "dark" ? oneDark : "light"}
        placeholder={placeholder}
        minHeight={minHeight}
        maxHeight={maxHeight}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          indentOnInput: true,
          searchKeymap: true,
          tabSize: 2,
        }}
      />
    </div>
  )
}
