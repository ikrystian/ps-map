"use client"

import { useParams } from "next/navigation"
import { BlogPostForm } from "@/components/admin/blog-post-form"

export default function AdminEditBlogPostPage() {
  const params = useParams()
  const postId = params.id as string

  return <BlogPostForm postId={postId} />
}
