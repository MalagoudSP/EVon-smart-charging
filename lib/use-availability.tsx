"use client"

import { useEffect, useState } from 'react'

type StationUpdate = { id: string; available: number }

export default function useAvailability() {
  const [availability, setAvailability] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const es = new EventSource('/api/availability')
    es.onopen = () => setConnected(true)
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type === 'initial' || payload.type === 'update') {
          const map: Record<string, number> = {}
          payload.stations.forEach((s: StationUpdate) => (map[s.id] = s.available))
          setAvailability(prev => ({ ...prev, ...map }))
        }
      } catch (err) {
        // ignore parse errors
      }
    }
    es.onerror = () => {
      setConnected(false)
      // attempt reconnect; EventSource will handle automatic reconnect in browsers
    }

    return () => es.close()
  }, [])

  return { availability, connected }
}
