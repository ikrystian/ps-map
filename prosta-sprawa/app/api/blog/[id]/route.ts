export async function GET() {
  return Response.json({ message: "Get blog post" })
}

export async function PUT() {
  return Response.json({ message: "Update blog post" })
}

export async function DELETE() {
  return Response.json({ message: "Delete blog post" })
}
