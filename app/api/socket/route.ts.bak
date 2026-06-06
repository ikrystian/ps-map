import { getIO } from "@/lib/socket"

export async function GET() {
  const io = getIO()
  if (io) {
    return new Response("Socket.IO server is active and running", { status: 200 })
  }
  return new Response("Socket.IO server is not initialized", { status: 500 })
}

