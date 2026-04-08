"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Navigation, Loader2 } from "lucide-react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onLatLngChange: (lat: number, lng: number) => void;
  onConfirm: () => void;
  confirming: boolean;
}

export function MapPicker({
  lat,
  lng,
  onLatLngChange,
  onConfirm,
  confirming,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (mapInstance.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.on("moveend", () => {
        const c = map.getCenter();
        onLatLngChange(c.lat, c.lng);
      });

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 100);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 17),
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    };

    init();

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapInstance.current as { setView: (c: [number, number], z: number) => void } | null;
        if (map) map.setView([pos.coords.latitude, pos.coords.longitude], 17);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-[400px]">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Fixed pin in center */}
        <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-full pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#DC2626" stroke="white" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="#DC2626" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Pin shadow */}
        <div className="absolute left-1/2 top-1/2 z-[999] -translate-x-1/2 translate-y-0 pointer-events-none">
          <div className="h-1.5 w-4 rounded-full bg-black/20 mx-auto" />
        </div>

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-white/90 to-transparent px-4 pt-3 pb-8">
          <h3 className="text-[16px] font-bold text-[#111827]">Onde entregamos?</h3>
          <p className="text-[13px] text-[#6B7280]">Mova o mapa até o pino ficar no endereço certo</p>
        </div>

        {/* My location FAB */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoLoading}
          className="absolute bottom-24 right-3 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
        >
          {geoLoading ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
        </button>
      </div>

      {/* Confirm button */}
      <div className="px-4 py-4 border-t border-[#E5E7EB] bg-white">
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#DC2626] text-[15px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-50"
        >
          {confirming ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Buscando endereço...
            </>
          ) : (
            "Confirmar local"
          )}
        </button>
      </div>
    </div>
  );
}
