export async function GET() {
  return Response.json({ message: "Get certificates" })
}

export async function POST() {
  return Response.json({ message: "Create certificate" })
}
