export async function GET() {
  return Response.json({ message: "Get services" })
}

export async function POST() {
  return Response.json({ message: "Create service" })
}
