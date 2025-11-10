export async function GET() {
  return Response.json({ message: "Get orders" })
}

export async function POST() {
  return Response.json({ message: "Create order" })
}
