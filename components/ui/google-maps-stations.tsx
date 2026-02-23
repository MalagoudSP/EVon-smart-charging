'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api'
import { MapPin, AlertTriangle, TrendingUp, Zap } from 'lucide-react'
import { Card } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Loader } from 'lucide-react'

interface Station {
  id: string
  stationName: string
  address: string
  lat: number
  lng: number
  availableChargers: number
  totalChargers?: number
  dynamicPrice?: number
  pricePerKwh: number
  waitingTimeMinutes: number
  demandLevel: string
  averageRating: number
  reviewCount: number
  chargerTypes: string
  powerRatingKw?: number
  amenities?: string
}

interface GoogleMapsStationsProps {
  stations: Station[]
  userLocation?: { lat: number; lng: number }
  onStationSelect?: (station: Station) => void
  selectedStation?: Station
  searchRadius?: number
}

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

export default function GoogleMapsStations({
  stations,
  userLocation,
  onStationSelect,
  selectedStation,
  searchRadius = 50,
}: GoogleMapsStationsProps) {
  const [selectedMarker, setSelectedMarker] = useState<Station | null>(selectedStation || null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef<google.maps.Map | null>(null)

  const center = userLocation || defaultCenter

  const getDemandColor = (demandLevel: string): string => {
    switch (demandLevel?.toLowerCase()) {
      case 'high':
        return '#ef4444' // red
      case 'medium':
        return '#f59e0b' // amber
      case 'low':
        return '#10b981' // green
      default:
        return '#6366f1'
    }
  }

  const getPriceColor = (price: number): string => {
    if (price < 0.3) return '#10b981'
    if (price < 0.45) return '#f59e0b'
    return '#ef4444'
  }

  const getDemandBadgeVariant = (demandLevel: string) => {
    switch (demandLevel?.toLowerCase()) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'default'
      default:
        return 'outline'
    }
  }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    mapRef.current = map
    setIsLoading(false)

    // Fit bounds to show all stations
    if (stations.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      stations.forEach(station => {
        bounds.extend({ lat: station.lat, lng: station.lng })
      })
      if (userLocation) {
        bounds.extend(userLocation)
      }
      map.fitBounds(bounds)
    }
  }, [stations, userLocation])

  const handleMarkerClick = (station: Station) => {
    setSelectedMarker(station)
    if (onStationSelect) {
      onStationSelect(station)
    }
  }

  const handleInfoWindowClose = () => {
    setSelectedMarker(null)
  }

  return (
    <div className="w-full">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-lg">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          )}
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              zoomControl: true,
              fullscreenControl: true,
              streetViewControl: false,
              mapTypeControl: true,
            }}
          >
            {/* User Location Marker */}
            {userLocation && (
              <>
                <Marker
                  position={userLocation}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeColor: '#1e40af',
                    strokeWeight: 2,
                  }}
                  title="Your Location"
                />
                <Circle
                  center={userLocation}
                  radius={searchRadius * 1000}
                  options={{
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.3,
                    strokeWeight: 2,
                  }}
                />
              </>
            )}

            {/* Station Markers */}
            {stations.map(station => (
              <Marker
                key={station.id}
                position={{ lat: station.lat, lng: station.lng }}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 7,
                  fillColor: getDemandColor(station.demandLevel),
                  fillOpacity: 0.9,
                  strokeColor: '#000',
                  strokeWeight: 1,
                }}
                onClick={() => handleMarkerClick(station)}
                title={`${station.stationName} - ${station.availableChargers}/${station.totalChargers || 10} available`}
              />
            ))}

            {/* Info Window */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={handleInfoWindowClose}
                options={{
                  pixelOffset: new google.maps.Size(0, -40),
                }}
              >
                <StationInfoCard station={selectedMarker} />
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp size={16} /> Demand Levels
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span>Low Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#f59e0b' }}
                />
                <span>Medium Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#ef4444' }}
                />
                <span>High Demand</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap size={16} /> Price Ranges
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span>&lt; $0.30/kWh</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#f59e0b' }}
                />
                <span>$0.30 - $0.45/kWh</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#ef4444' }}
                />
                <span>&gt; $0.45/kWh</span>
              </div>
            </div>
          </Card>
        </div>
      </LoadScript>
    </div>
  )
}

function StationInfoCard({ station }: { station: Station }) {
  const availabilityPercentage =
    station.totalChargers && station.totalChargers > 0
      ? ((station.availableChargers / station.totalChargers) * 100).toFixed(0)
      : 'N/A'

  return (
    <div className="max-w-xs bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
        <h3 className="font-bold text-sm">{station.stationName}</h3>
        <p className="text-xs opacity-90">{station.address}</p>
      </div>

      <div className="p-3 space-y-3 bg-white text-gray-900">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs text-gray-600">Available Chargers</p>
            <p className="font-bold text-lg">
              {station.availableChargers}/{station.totalChargers || 10}
            </p>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <Badge variant={getDemandBadgeVariant(station.demandLevel)}>
              {station.demandLevel.toUpperCase()}
            </Badge>
            <p className="text-xs text-gray-600 mt-2">Rating</p>
            <p className="font-bold text-sm">⭐ {station.averageRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500">({station.reviewCount} reviews)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t pt-2">
          <div>
            <p className="text-xs text-gray-600">Price/kWh</p>
            <p className="font-semibold text-sm">${station.pricePerKwh.toFixed(2)}</p>
            {station.dynamicPrice && station.dynamicPrice !== station.pricePerKwh && (
              <p className="text-xs text-orange-600">
                Dynamic: ${station.dynamicPrice.toFixed(2)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600">Wait Time</p>
            <p className="font-semibold text-sm">{station.waitingTimeMinutes} min</p>
          </div>
        </div>

        {station.amenities && (
          <div className="border-t pt-2">
            <p className="text-xs text-gray-600 mb-1">Amenities</p>
            <p className="text-xs">{station.amenities}</p>
          </div>
        )}

        <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm">
          View Details
        </Button>
      </div>
    </div>
  )
}
