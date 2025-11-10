export async function GET() {
  return Response.json({ message: "Get categories" })
}

export async function POST() {
  return Response.json({ message: "Create category" })
}
