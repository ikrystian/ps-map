export async function GET() {
  return Response.json({ message: "Get messages" })
}

export async function POST() {
  return Response.json({ message: "Send message" })
}
