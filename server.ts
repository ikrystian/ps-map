import { createServer } from "http"
import next from "next"
import { initScheduler } from "./lib/scheduler"
import { initSocket } from "./lib/socket"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  // Inicjalizacja lokalnego harmonogramu zadań w tle (schedulera).
  // Wykonywana jest asynchronicznie — sprawdza w bazie zadania zaległe po restarcie.
  await initScheduler()

  const server = createServer(async (req, res) => {
    try {


      // In modern Next.js, the request handler can parse the URL internally.
      // This avoids using the deprecated `url.parse()` API.
      await handle(req, res)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Serwer Socket.IO dla czatu i powiadomień w czasie rzeczywistym.
  // Przechwytuje żądania na ścieżce /socket.io zanim trafią do Next.js.
  initSocket(server)

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})

