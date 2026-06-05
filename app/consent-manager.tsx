"use client";

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
} from '@c15t/nextjs';
import type { ReactNode } from 'react';

/**
 * Consent management wrapper for Next.js App Router using @c15t/nextjs v2
 */
export function ConsentManager({ children }: { children: ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'offline',
        consentCategories: ['necessary', 'marketing'],
      }}
    >
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  );
}
