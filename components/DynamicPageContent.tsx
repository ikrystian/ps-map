"use client"

import { ContactForm } from "@/components/ContactForm"

interface DynamicPageContentProps {
  modulesHtml: string[]
}

export function DynamicPageContent({ modulesHtml }: DynamicPageContentProps) {
  if (modulesHtml.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Ta strona nie ma jeszcze żadnej zawartości.</p>
      </div>
    )
  }

  return (
    <div className="page-content">
      {modulesHtml.map((html, idx) => {
        // Sprawdź czy HTML zawiera placeholder formularza kontaktowego
        if (html.includes("{contact-form}")) {
          const parts = html.split("{contact-form}")
          return (
            <div key={idx} className="page-module">
              {parts.map((part, index) => {
                const isLast = index === parts.length - 1
                return (
                  <div key={index}>
                    <div dangerouslySetInnerHTML={{ __html: part }} />
                    {!isLast && (
                      <div className="my-6">
                        <ContactForm />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        // Standardowy moduł bez formularza
        return (
          <div
            key={idx}
            className="page-module"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      })}
    </div>
  )
}
