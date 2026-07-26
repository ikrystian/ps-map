"use client"

import { usePermissions } from "@/hooks/usePermissions"
import { BlogUpgradePromo } from "@/components/panel-eksperta/BlogUpgradePromo"
import { BlogPostForm } from "@/components/admin/blog-post-form"
import { Loader2 } from "lucide-react"

export default function LawFirmNewBlogPostPage() {
  const { hasFeature, loading: permissionsLoading } = usePermissions()
  const canAccessBlog = hasFeature("canAccessBlog")

  if (permissionsLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie uprawnień...</p>
        </div>
      </div>
    )
  }

  if (!canAccessBlog) {
    return <BlogUpgradePromo />
  }

  return <BlogPostForm mode="expert" />
}