"use client"

import { LoadingState } from "@/components/zastepstwa/ui"
import { OrderWizard } from "@/components/zastepstwa/wizard/OrderWizard"
import { Suspense } from "react"

export default function NewSubstitutionPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderWizard />
    </Suspense>
  )
}
