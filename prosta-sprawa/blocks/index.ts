/**
 * Export wszystkich bloków HTML
 * Każdy blok to osobny komponent Next.js, który można renderować do HTML
 */

import HeroBlock from './hero'
import FeaturesBlock from './features'
import CTABlock from './cta'
import ContactBlock from './contact'
import TestimonialsBlock from './testimonials'

export const blocks = {
  hero: {
    name: 'Hero - Nagłówek główny',
    description: 'Sekcja główna z nagłówkiem, opisem i przyciskami CTA',
    component: HeroBlock,
  },
  features: {
    name: 'Features - Cechy/Usługi',
    description: 'Trzy kolumny z ikonami i opisami usług/cech',
    component: FeaturesBlock,
  },
  cta: {
    name: 'CTA - Wezwanie do działania',
    description: 'Sekcja call-to-action z dużym przyciskiem',
    component: CTABlock,
  },
  contact: {
    name: 'Contact - Formularz kontaktowy',
    description: 'Sekcja z danymi kontaktowymi i formularzem',
    component: ContactBlock,
  },
  testimonials: {
    name: 'Testimonials - Opinie klientów',
    description: 'Trzy opinie klientów z ocenami gwiazdkami',
    component: TestimonialsBlock,
  },
}

export type BlockKey = keyof typeof blocks
