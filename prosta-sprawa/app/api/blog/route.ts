export async function GET() {
  return Response.json({ message: "Get blog posts" })
}

export async function POST() {
  return Response.json({ message: "Create blog post" })
}
