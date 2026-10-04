import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';

interface MapPinpointProps {
  latitude: number;
  longitude: number;
  landmark: string;
  nameOrAlias: string;
  accuracy?: number;
}

export const MapPinpoint: React.FC<MapPinpointProps> = ({
  latitude,
  longitude,
  landmark,
  nameOrAlias,
  accuracy
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom pulse Pin marker
      const customIcon = L.divIcon({
        className: 'custom-person-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 38px;
              height: 38px;
              background-color: rgba(225, 29, 72, 0.25);
              border-radius: 50%;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 28px;
              height: 28px;
              background-color: #e11d48;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 13px;
              font-weight: bold;
              z-index: 2;
            ">
              📍
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="font-size: 13px; color: #0f172a;">${nameOrAlias}</strong>
          <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${landmark}</p>
          <div style="margin-top: 4px; font-size: 10px; color: #059669; font-weight: 600;">
            ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E
          </div>
        </div>
      `).openPopup();

      // If accuracy provided, show circle
      if (accuracy && accuracy < 500) {
        L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#e11d48',
          fillColor: '#e11d48',
          fillOpacity: 0.12,
          weight: 1
        }).addTo(map);
      }

      setMapLoaded(true);

      // Trigger resize update after a short delay
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, landmark, nameOrAlias, accuracy]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const formatCoord = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  return (
    <div className="space-y-3">
      {/* Map Frame */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0"
          style={{ minHeight: '220px' }}
        />

        {/* Floating badge for spot info */}
        <div className="absolute top-2 left-2 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200/80 px-2.5 py-1 rounded-md shadow-sm pointer-events-none text-xs flex items-center gap-1.5 text-slate-800">
          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="font-semibold truncate max-w-[200px] sm:max-w-[280px]">
            {landmark}
          </span>
        </div>

        {/* Recenter button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 16);
            }
          }}
          className="absolute bottom-2 right-2 z-[400] bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-lg shadow border border-slate-200 text-xs flex items-center gap-1"
          title="Recenter Pin"
        >
          <Compass className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Coordinates readout bar matching prompt */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-100/90 px-3 py-2 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-semibold text-slate-700">Coordinates:</span>
          <span>{formatCoord(latitude, longitude)}</span>
          {accuracy && (
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-sans">
              ±{accuracy}m accuracy
            </span>
          )}
        </div>
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 hover:underline"
        >
          View satellite
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 1-Tap Google Navigation Button matching prompt Screen 4 */}
      <a
        id="open-google-maps-directions-button"
        href={googleMapsDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-700/20 transition-all text-sm tracking-wide text-center"
      >
        <Navigation className="w-4 h-4 fill-white" />
        OPEN IN GOOGLE MAPS FOR DIRECTIONS
      </a>
    </div>
  );
};
