/**
 * Export wszystkich bloków HTML
 * Każdy blok to gotowy HTML string kompatybilny z Tailwind CSS
 */

import { heroBlockHtml } from './hero'
import { featuresBlockHtml } from './features'
import { ctaBlockHtml } from './cta'
import { contactBlockHtml } from './contact'
import { testimonialsBlockHtml } from './testimonials'

export const blocks = {
  hero: {
    name: 'Hero - Nagłówek główny',
    description: 'Sekcja główna z nagłówkiem, opisem i przyciskami CTA',
    html: heroBlockHtml,
  },
  features: {
    name: 'Features - Cechy/Usługi',
    description: 'Trzy kolumny z ikonami i opisami usług/cech',
    html: featuresBlockHtml,
  },
  cta: {
    name: 'CTA - Wezwanie do działania',
    description: 'Sekcja call-to-action z dużym przyciskiem',
    html: ctaBlockHtml,
  },
  contact: {
    name: 'Contact - Formularz kontaktowy',
    description: 'Sekcja z danymi kontaktowymi i formularzem',
    html: contactBlockHtml,
  },
  testimonials: {
    name: 'Testimonials - Opinie klientów',
    description: 'Trzy opinie klientów z ocenami gwiazdkami',
    html: testimonialsBlockHtml,
  },
}

export type BlockKey = keyof typeof blocks
