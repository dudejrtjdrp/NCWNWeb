'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet 기본 마커 아이콘 경로 수정 (Next.js 환경)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 동아방송예술대학교 좌표
const LAT = 37.0047
const LNG = 127.3979

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [LAT, LNG],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    const customIcon = L.divIcon({
      html: `
        <div style="
          background: #22c55e;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })

    L.marker([LAT, LNG], { icon: customIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 13px; line-height: 1.6;">
          <strong>동아방송예술대학교</strong><br/>
          경기도 안성시 삼죽면<br/>동아예대길 47
        </div>`,
        { offset: [0, -4] }
      )
      .openPopup()

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '260px' }}
    />
  )
}
