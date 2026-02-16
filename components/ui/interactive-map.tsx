"use client"

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { GoogleMap, useLoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

interface Station {
  id: string
  stationName: string
  lat: number
  lng: number
  available?: number
  price?: number
}

interface Props {
  stations: Station[]
  center?: { lat: number; lng: number }
  zoom?: number
  userLocation?: { lat: number; lng: number } | null
  onSelect?: (id: string) => void
}

export default function InteractiveMap({ stations, center, zoom = 12, userLocation = null, onSelect }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey })
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const clusterRef = useRef<any>(null)

  const mapCenter = useMemo(() => center || (stations[0] ? { lat: stations[0].lat, lng: stations[0].lng } : { lat: 0, lng: 0 }), [center, stations])

  const handleMarkerClick = (id: string) => {
    setSelected(id)
    onSelect?.(id)
  }

  const handleDirectionsCallback = useCallback((result: any, status: any) => {
    if (status === 'OK' && result) setDirections(result)
  }, [])

  const selectedStation = stations.find(s => s.id === selected)

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    // clear previous markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    if (clusterRef.current) {
      try { clusterRef.current.clearMarkers() } catch (e) {}
      clusterRef.current = null
    }

    // create markers
    const mk: google.maps.Marker[] = stations.map((s) => {
      const marker = new google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map: mapRef.current!,
        title: s.stationName,
      })
      marker.addListener('click', () => handleMarkerClick(s.id))
      marker.addListener('mouseover', () => {
        if (!infoWindowRef.current) infoWindowRef.current = new google.maps.InfoWindow()
        const content = `<div style="min-width:160px"><strong>${s.stationName}</strong><div style="font-size:12px;margin-top:6px">${s.available ?? 'N/A'} chargers • $${s.price ?? 'N/A'}/kWh</div><div style="margin-top:8px"><a href=\"/booking/${s.id}\">Book</a></div></div>`
        infoWindowRef.current.setContent(content)
        infoWindowRef.current.open({ anchor: marker, map: mapRef.current! })
      })
      marker.addListener('mouseout', () => {
        // close on mouseout after small delay
        setTimeout(() => infoWindowRef.current?.close(), 200)
      })
      return marker
    })

    markersRef.current = mk

    // create cluster
    try {
      clusterRef.current = new MarkerClusterer({ markers: mk, map: mapRef.current! })
    } catch (err) {
      // fallback: no clustering
    }

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      if (clusterRef.current) try { clusterRef.current.clearMarkers() } catch (e) {}
      if (infoWindowRef.current) try { infoWindowRef.current.close() } catch (e) {}
    }
  }, [isLoaded, stations])

  // compute directions when userLocation and selectedStation change
  useEffect(() => {
    if (!userLocation || !selectedStation || !isLoaded) return
    // DirectionsService component below will compute and render
  }, [userLocation, selectedStation, isLoaded])

  return (
    <div className="w-full h-96 rounded-md overflow-hidden">
      {!apiKey ? (
        <div className="w-full h-full bg-muted flex items-center justify-center">Google Maps key missing</div>
      ) : !isLoaded ? (
        <div className="w-full h-full bg-muted flex items-center justify-center">Loading map...</div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={zoom}
          onLoad={(m) => (mapRef.current = m)}
          onUnmount={() => (mapRef.current = null)}
        >
          {userLocation && selectedStation && (
            <DirectionsService
              options={{
                origin: userLocation,
                destination: { lat: selectedStation.lat, lng: selectedStation.lng },
                travelMode: google.maps.TravelMode.DRIVING,
              }}
              callback={handleDirectionsCallback}
            />
          )}

          {directions && <DirectionsRenderer options={{ directions }} />}
        </GoogleMap>
      )}
    </div>
  )
}
