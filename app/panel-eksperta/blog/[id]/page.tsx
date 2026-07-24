"use client"

import { useParams } from "next/navigation"
import { BlogPostForm } from "@/components/admin/blog-post-form"

export default function LawFirmEditBlogPostPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  return <BlogPostForm postId={id} mode="expert" />
}