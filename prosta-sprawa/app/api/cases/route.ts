export async function GET() {
  return Response.json({ message: "Get cases" })
}

export async function POST() {
  return Response.json({ message: "Create case" })
}
