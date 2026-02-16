import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // sample station availability data - in production, read from DB or service
      const stations = [
        { id: '1', available: 8 },
        { id: '2', available: 14 },
        { id: '3', available: 5 },
        { id: '4', available: 8 },
        { id: '5', available: 3 },
        { id: '6', available: 6 },
      ]

      function send(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // initial send
      send({ type: 'initial', stations })

      // simulate updates every 10s
      const iv = setInterval(() => {
        // mutate small random changes
        const updated = stations.map(s => {
          const change = Math.random() > 0.7 ? -1 : Math.random() > 0.85 ? 1 : 0
          const avail = Math.max(0, s.available + change)
          s.available = avail
          return s
        })
        send({ type: 'update', stations: updated })
      }, 10000)

      // stop when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(iv)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
