export async function GET() {
  return Response.json({ message: "Get service" })
}

export async function PUT() {
  return Response.json({ message: "Update service" })
}

export async function DELETE() {
  return Response.json({ message: "Delete service" })
}
