export async function POST() {
  return Response.json({ message: "Add to favorites" })
}

export async function DELETE() {
  return Response.json({ message: "Remove from favorites" })
}
