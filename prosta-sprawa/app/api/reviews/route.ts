export async function GET() {
  return Response.json({ message: "Get reviews" })
}

export async function POST() {
  return Response.json({ message: "Create review" })
}
