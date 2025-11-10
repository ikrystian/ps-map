export async function GET() {
  return Response.json({ message: "Get client" })
}

export async function PUT() {
  return Response.json({ message: "Update client" })
}

export async function DELETE() {
  return Response.json({ message: "Delete client" })
}
