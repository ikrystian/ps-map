export async function GET() {
  return Response.json({ message: "Get promotions" })
}

export async function POST() {
  return Response.json({ message: "Create promotion" })
}
