"use client"

import { useParams } from "next/navigation"
import { BlogPostForm } from "@/components/admin/blog-post-form"

export default function AdminEditBlogPostPage() {
  const params = useParams()
  const postId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  return <BlogPostForm postId={postId} mode="admin" />
}
