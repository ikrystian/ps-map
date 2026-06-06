"use client"

import { useAdminTitleContext } from "@/components/admin/AdminTitleContext"

export default function AdminPageTitle() {
  const { title, subtitle } = useAdminTitleContext()

  return (
    <div className="flex flex-col animate-fade-in" id="main-title">
      <h1 className="text-xl font-playfair font-bold text-white leading-tight">
        {title}
      </h1>
      {subtitle && (
        <h2 className="text-sm text-white/70">
          {subtitle}
        </h2>
      )}
    </div>
  )
}
